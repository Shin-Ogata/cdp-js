/*!
 * @cdp/framework-core 0.9.0
 *   core framework
 */

(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
   typeof define === 'function' && define.amd ? define(['exports'], factory) :
   (global = global || self, factory(global.CDP = global.CDP || {}));
}(this, (function (exports) { 'use strict';

   /*!
    * @cdp/core-utils 0.9.0
    *   core framework utilities
    */

   /**
    * @en Safe `global` accessor.
    * @ja `global` アクセッサ
    *
    * @returns
    *  - `en` `global` object of the runtime environment
    *  - `ja` 環境に応じた `global` オブジェクト
    */
   function getGlobal() {
       // eslint-disable-next-line no-new-func
       return ('object' === typeof globalThis) ? globalThis : Function('return this')();
   }
   /**
    * @en Ensure named object as parent's property.
    * @ja 親オブジェクトを指定して, 名前に指定したオブジェクトの存在を保証
    *
    * @param parent
    *  - `en` parent object. If null given, `globalThis` is assigned.
    *  - `ja` 親オブジェクト. null の場合は `globalThis` が使用される
    * @param names
    *  - `en` object name chain for ensure instance.
    *  - `ja` 保証するオブジェクトの名前
    */
   function ensureObject(parent, ...names) {
       let root = parent || getGlobal();
       for (const name of names) {
           root[name] = root[name] || {};
           root = root[name];
       }
       return root;
   }
   /**
    * @en Global namespace accessor.
    * @ja グローバルネームスペースアクセッサ
    */
   function getGlobalNamespace(namespace) {
       return ensureObject(null, namespace);
   }
   /**
    * @en Global config accessor.
    * @ja グローバルコンフィグアクセッサ
    *
    * @returns default: `CDP.Config`
    */
   function getConfig(namespace = 'CDP', configName = 'Config') {
       return ensureObject(getGlobalNamespace(namespace), configName);
   }

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   function exists(x) {
       return null != x;
   }
   /**
    * @en Check the value-type is [[Nil]].
    * @ja [[Nil]] 型であるか判定
    *
    * @param x
    *  - `en` evaluated value
    *  - `ja` 評価する値
    */
   function isNil(x) {
       return null == x;
   }
   /**
    * @en Check the value-type is String.
    * @ja String 型であるか判定
    *
    * @param x
    *  - `en` evaluated value
    *  - `ja` 評価する値
    */
   function isString(x) {
       return 'string' === typeof x;
   }
   /**
    * @en Check the value-type is Number.
    * @ja Number 型であるか判定
    *
    * @param x
    *  - `en` evaluated value
    *  - `ja` 評価する値
    */
   function isNumber(x) {
       return 'number' === typeof x;
   }
   /**
    * @en Check the value-type is Boolean.
    * @ja Boolean 型であるか判定
    *
    * @param x
    *  - `en` evaluated value
    *  - `ja` 評価する値
    */
   function isBoolean(x) {
       return 'boolean' === typeof x;
   }
   /**
    * @en Check the value-type is Symble.
    * @ja Symbol 型であるか判定
    *
    * @param x
    *  - `en` evaluated value
    *  - `ja` 評価する値
    */
   function isSymbol(x) {
       return 'symbol' === typeof x;
   }
   /**
    * @en Check the value-type is primitive type.
    * @ja プリミティブ型であるか判定
    *
    * @param x
    *  - `en` evaluated value
    *  - `ja` 評価する値
    */
   function isPrimitive(x) {
       return !x || ('function' !== typeof x) && ('object' !== typeof x);
   }
   /**
    * @en Check the value-type is Array.
    * @ja Array 型であるか判定
    *
    * @param x
    *  - `en` evaluated value
    *  - `ja` 評価する値
    */
   const isArray = Array.isArray; // eslint-disable-line @typescript-eslint/unbound-method
   /**
    * @en Check the value-type is Object.
    * @ja Object 型であるか判定
    *
    * @param x
    *  - `en` evaluated value
    *  - `ja` 評価する値
    */
   function isObject(x) {
       return Boolean(x) && 'object' === typeof x;
   }
   /**
    * @en Check the value-type is [[PlainObject]].
    * @ja [[PlainObject]] 型であるか判定
    *
    * @param x
    *  - `en` evaluated value
    *  - `ja` 評価する値
    */
   function isPlainObject(x) {
       if (!isObject(x)) {
           return false;
       }
       // create from `Object.create( null )` is plain
       if (!Object.getPrototypeOf(x)) {
           return true;
       }
       return ownInstanceOf(Object, x);
   }
   /**
    * @en Check the value-type is empty object.
    * @ja 空オブジェクトであるか判定
    *
    * @param x
    *  - `en` evaluated value
    *  - `ja` 評価する値
    */
   function isEmptyObject(x) {
       if (!isPlainObject(x)) {
           return false;
       }
       for (const name in x) { // eslint-disable-line @typescript-eslint/no-unused-vars
           return false;
       }
       return true;
   }
   /**
    * @en Check the value-type is Function.
    * @ja Function 型であるか判定
    *
    * @param x
    *  - `en` evaluated value
    *  - `ja` 評価する値
    */
   function isFunction(x) {
       return 'function' === typeof x;
   }
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
   function typeOf(type, x) {
       return typeof x === type;
   }
   function isIterable(x) {
       return Symbol.iterator in Object(x);
   }
   const _typedArrayNames = {
       'Int8Array': true,
       'Uint8Array': true,
       'Uint8ClampedArray': true,
       'Int16Array': true,
       'Uint16Array': true,
       'Int32Array': true,
       'Uint32Array': true,
       'Float32Array': true,
       'Float64Array': true,
   };
   /**
    * @en Check the value is one of [[TypedArray]].
    * @ja 指定したインスタンスが [[TypedArray]] の一種であるか判定
    *
    * @param x
    *  - `en` evaluated value
    *  - `ja` 評価する値
    */
   function isTypedArray(x) {
       return !!_typedArrayNames[className(x)];
   }
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
   function instanceOf(ctor, x) {
       return ('function' === typeof ctor) && (x instanceof ctor);
   }
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
   function ownInstanceOf(ctor, x) {
       return (null != x) && ('function' === typeof ctor) && (Object.getPrototypeOf(x) === Object(ctor.prototype));
   }
   /**
    * @en Get the value's class name.
    * @ja クラス名を取得
    *
    * @param x
    *  - `en` evaluated value
    *  - `ja` 評価する値
    */
   function className(x) {
       if (x != null) {
           const toStringTagName = x[Symbol.toStringTag];
           if (isString(toStringTagName)) {
               return toStringTagName;
           }
           else if (isFunction(x) && x.prototype && null != x.name) {
               return x.name;
           }
           else {
               const ctor = x.constructor;
               if (isFunction(ctor) && ctor === Object(ctor.prototype).constructor) {
                   return ctor.name;
               }
           }
       }
       return Object.prototype.toString.call(x).slice(8, -1);
   }
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
   function sameType(lhs, rhs) {
       return typeof lhs === typeof rhs;
   }
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
   function sameClass(lhs, rhs) {
       if (null == lhs && null == rhs) {
           return className(lhs) === className(rhs);
       }
       else {
           return (null != lhs) && (null != rhs) && (Object.getPrototypeOf(lhs) === Object.getPrototypeOf(rhs));
       }
   }
   /**
    * @en Common Symble for framework.
    * @ja フレームワークが共通で使用する Symble
    */
   const $cdp = Symbol('@cdp');

   /**
    * @en Concrete type verifier object.
    * @ja 型検証実装オブジェクト
    *
    * @internal
    */
   const _verifier = {
       notNil: (x, message) => {
           if (null == x) {
               exists(message) || (message = `${className(x)} is not a valid value.`);
               throw new TypeError(message);
           }
       },
       typeOf: (type, x, message) => {
           if (typeof x !== type) {
               exists(message) || (message = `Type of ${className(x)} is not ${type}.`);
               throw new TypeError(message);
           }
       },
       array: (x, message) => {
           if (!isArray(x)) {
               exists(message) || (message = `${className(x)} is not an Array.`);
               throw new TypeError(message);
           }
       },
       iterable: (x, message) => {
           if (!(Symbol.iterator in Object(x))) {
               exists(message) || (message = `${className(x)} is not an iterable object.`);
               throw new TypeError(message);
           }
       },
       instanceOf: (ctor, x, message) => {
           if (!(x instanceof ctor)) {
               exists(message) || (message = `${className(x)} is not an instance of ${ctor.name}.`);
               throw new TypeError(message);
           }
       },
       ownInstanceOf: (ctor, x, message) => {
           if (null == x || Object.getPrototypeOf(x) !== Object(ctor.prototype)) {
               exists(message) || (message = `The object is not own instance of ${ctor.name}.`);
               throw new TypeError(message);
           }
       },
       notOwnInstanceOf: (ctor, x, message) => {
           if (null != x && Object.getPrototypeOf(x) === Object(ctor.prototype)) {
               exists(message) || (message = `The object is own instance of ${ctor.name}.`);
               throw new TypeError(message);
           }
       },
       hasProperty: (x, prop, message) => {
           if (null == x || !(prop in x)) {
               exists(message) || (message = `The object does not have property ${String(prop)}.`);
               throw new TypeError(message);
           }
       },
       hasOwnProperty: (x, prop, message) => {
           if (null == x || !Object.prototype.hasOwnProperty.call(x, prop)) {
               exists(message) || (message = `The object does not have own property ${String(prop)}.`);
               throw new TypeError(message);
           }
       },
   };
   /**
    * @en Verify method.
    * @ja 検証メソッド
    *
    * @param method
    *  - `en` method name which using
    *  - `ja` 使用するメソッド名
    * @param args
    *  - `en` arguments which corresponds to the method name
    *  - `ja` メソッド名に対応する引数
    */
   function verify(method, ...args) {
       _verifier[method](...args); // eslint-disable-line @typescript-eslint/no-explicit-any
   }

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   /** @internal helper for deepEqual() */
   function arrayEqual(lhs, rhs) {
       const len = lhs.length;
       if (len !== rhs.length) {
           return false;
       }
       for (let i = 0; i < len; i++) {
           if (!deepEqual(lhs[i], rhs[i])) {
               return false;
           }
       }
       return true;
   }
   /** @internal helper for deepEqual() */
   function bufferEqual(lhs, rhs) {
       const size = lhs.byteLength;
       if (size !== rhs.byteLength) {
           return false;
       }
       let pos = 0;
       if (size - pos >= 8) {
           const len = size >>> 3;
           const f64L = new Float64Array(lhs, 0, len);
           const f64R = new Float64Array(rhs, 0, len);
           for (let i = 0; i < len; i++) {
               if (!Object.is(f64L[i], f64R[i])) {
                   return false;
               }
           }
           pos = len << 3;
       }
       if (pos === size) {
           return true;
       }
       const L = new DataView(lhs);
       const R = new DataView(rhs);
       if (size - pos >= 4) {
           if (!Object.is(L.getUint32(pos), R.getUint32(pos))) {
               return false;
           }
           pos += 4;
       }
       if (size - pos >= 2) {
           if (!Object.is(L.getUint16(pos), R.getUint16(pos))) {
               return false;
           }
           pos += 2;
       }
       if (size > pos) {
           if (!Object.is(L.getUint8(pos), R.getUint8(pos))) {
               return false;
           }
           pos += 1;
       }
       return pos === size;
   }
   /**
    * @en Performs a deep comparison between two values to determine if they are equivalent.
    * @ja 2値の詳細比較をし, 等しいかどうか判定
    */
   function deepEqual(lhs, rhs) {
       if (lhs === rhs) {
           return true;
       }
       if (isFunction(lhs) && isFunction(rhs)) {
           return lhs.length === rhs.length && lhs.name === rhs.name;
       }
       if (!isObject(lhs) || !isObject(rhs)) {
           return false;
       }
       { // Primitive Wrapper Objects / Date
           const valueL = lhs.valueOf();
           const valueR = rhs.valueOf();
           if (lhs !== valueL || rhs !== valueR) {
               return valueL === valueR;
           }
       }
       { // RegExp
           const isRegExpL = lhs instanceof RegExp;
           const isRegExpR = rhs instanceof RegExp;
           if (isRegExpL || isRegExpR) {
               return isRegExpL === isRegExpR && String(lhs) === String(rhs);
           }
       }
       { // Array
           const isArrayL = isArray(lhs);
           const isArrayR = isArray(rhs);
           if (isArrayL || isArrayR) {
               return isArrayL === isArrayR && arrayEqual(lhs, rhs);
           }
       }
       { // ArrayBuffer
           const isBufferL = lhs instanceof ArrayBuffer;
           const isBufferR = rhs instanceof ArrayBuffer;
           if (isBufferL || isBufferR) {
               return isBufferL === isBufferR && bufferEqual(lhs, rhs);
           }
       }
       { // ArrayBufferView
           const isBufferViewL = ArrayBuffer.isView(lhs);
           const isBufferViewR = ArrayBuffer.isView(rhs);
           if (isBufferViewL || isBufferViewR) {
               return isBufferViewL === isBufferViewR && sameClass(lhs, rhs)
                   && bufferEqual(lhs.buffer, rhs.buffer);
           }
       }
       { // other Iterable
           const isIterableL = isIterable(lhs);
           const isIterableR = isIterable(rhs);
           if (isIterableL || isIterableR) {
               return isIterableL === isIterableR && arrayEqual([...lhs], [...rhs]);
           }
       }
       if (sameClass(lhs, rhs)) {
           const keysL = new Set(Object.keys(lhs));
           const keysR = new Set(Object.keys(rhs));
           if (keysL.size !== keysR.size) {
               return false;
           }
           for (const key of keysL) {
               if (!keysR.has(key)) {
                   return false;
               }
           }
           for (const key of keysL) {
               if (!deepEqual(lhs[key], rhs[key])) {
                   return false;
               }
           }
       }
       else {
           for (const key in lhs) {
               if (!(key in rhs)) {
                   return false;
               }
           }
           const keys = new Set();
           for (const key in rhs) {
               if (!(key in lhs)) {
                   return false;
               }
               keys.add(key);
           }
           for (const key of keys) {
               if (!deepEqual(lhs[key], rhs[key])) {
                   return false;
               }
           }
       }
       return true;
   }
   //__________________________________________________________________________________________________//
   /** @internal clone RegExp */
   function cloneRegExp(regexp) {
       const result = new RegExp(regexp.source, regexp.flags);
       result.lastIndex = regexp.lastIndex;
       return result;
   }
   /** @internal clone ArrayBuffer */
   function cloneArrayBuffer(arrayBuffer) {
       const result = new ArrayBuffer(arrayBuffer.byteLength);
       new Uint8Array(result).set(new Uint8Array(arrayBuffer));
       return result;
   }
   /** @internal clone DataView */
   function cloneDataView(dataView) {
       const buffer = cloneArrayBuffer(dataView.buffer);
       return new DataView(buffer, dataView.byteOffset, dataView.byteLength);
   }
   /** @internal clone TypedArray */
   function cloneTypedArray(typedArray) {
       const buffer = cloneArrayBuffer(typedArray.buffer);
       return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
   }
   /** @internal check necessary to update */
   function needUpdate(oldValue, newValue, exceptUndefined) {
       if (oldValue !== newValue) {
           return true;
       }
       else {
           return (exceptUndefined && undefined === oldValue);
       }
   }
   /** @internal merge Array */
   function mergeArray(target, source) {
       for (let i = 0, len = source.length; i < len; i++) {
           const oldValue = target[i];
           const newValue = merge(oldValue, source[i]);
           !needUpdate(oldValue, newValue, false) || (target[i] = newValue);
       }
       return target;
   }
   /** @internal merge Set */
   function mergeSet(target, source) {
       for (const item of source) {
           target.has(item) || target.add(merge(undefined, item));
       }
       return target;
   }
   /** @internal merge Map */
   function mergeMap(target, source) {
       for (const [k, v] of source) {
           const oldValue = target.get(k);
           const newValue = merge(oldValue, v);
           !needUpdate(oldValue, newValue, false) || target.set(k, newValue);
       }
       return target;
   }
   /** @internal helper for deepMerge() */
   function merge(target, source) {
       if (undefined === source || target === source) {
           return target;
       }
       if (!isObject(source)) {
           return source;
       }
       // Primitive Wrapper Objects / Date
       if (source.valueOf() !== source) {
           return deepEqual(target, source) ? target : new source.constructor(source.valueOf());
       }
       // RegExp
       if (source instanceof RegExp) {
           return deepEqual(target, source) ? target : cloneRegExp(source);
       }
       // ArrayBuffer
       if (source instanceof ArrayBuffer) {
           return deepEqual(target, source) ? target : cloneArrayBuffer(source);
       }
       // ArrayBufferView
       if (ArrayBuffer.isView(source)) {
           return deepEqual(target, source) ? target : isTypedArray(source) ? cloneTypedArray(source) : cloneDataView(source);
       }
       // Array
       if (Array.isArray(source)) {
           return mergeArray(isArray(target) ? target : [], source);
       }
       // Set
       if (source instanceof Set) {
           return mergeSet(target instanceof Set ? target : new Set(), source);
       }
       // Map
       if (source instanceof Map) {
           return mergeMap(target instanceof Map ? target : new Map(), source);
       }
       const obj = isObject(target) ? target : {};
       if (sameClass(target, source)) {
           for (const key of Object.keys(source)) {
               const oldValue = obj[key];
               const newValue = merge(oldValue, source[key]);
               !needUpdate(oldValue, newValue, true) || (obj[key] = newValue);
           }
       }
       else {
           for (const key in source) {
               const oldValue = obj[key];
               const newValue = merge(oldValue, source[key]);
               !needUpdate(oldValue, newValue, true) || (obj[key] = newValue);
           }
       }
       return obj;
   }
   function deepMerge(target, ...sources) {
       let result = target;
       for (const source of sources) {
           result = merge(result, source);
       }
       return result;
   }
   //__________________________________________________________________________________________________//
   /**
    * @en Create deep copy instance of source object.
    * @ja ディープコピーオブジェクトの生成
    */
   function deepCopy(src) {
       return deepMerge(undefined, src);
   }

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   //__________________________________________________________________________________________________//
   const _objPrototype = Object.prototype;
   const _instanceOf = Function.prototype[Symbol.hasInstance];
   const _override = Symbol('override');
   const _isInherited = Symbol('isInherited');
   const _constructors = Symbol('constructors');
   const _classBase = Symbol('classBase');
   const _classSources = Symbol('classSources');
   const _protoExtendsOnly = Symbol('protoExtendsOnly');
   // copy properties core
   function reflectProperties(target, source, key) {
       if (null == target[key]) {
           Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
       }
   }
   // object properties copy method
   function copyProperties(target, source) {
       source && Object.getOwnPropertyNames(source)
           .filter(key => !/(prototype|name|constructor)/.test(key))
           .forEach(key => {
           reflectProperties(target, source, key);
       });
       source && Object.getOwnPropertySymbols(source)
           .forEach(key => {
           reflectProperties(target, source, key);
       });
   }
   // helper for setMixClassAttribute(target, 'instanceOf')
   function setInstanceOf(target, method) {
       const behaviour = method || (null === method ? undefined : ((i) => Object.prototype.isPrototypeOf.call(target.prototype, i)));
       const applied = behaviour && Object.getOwnPropertyDescriptor(target, _override);
       if (!applied) {
           Object.defineProperties(target, {
               [Symbol.hasInstance]: {
                   value: behaviour,
                   writable: true,
                   enumerable: false,
               },
               [_override]: {
                   value: behaviour ? true : undefined,
                   writable: true,
               },
           });
       }
   }
   /**
    * @en Set the Mixin class attribute.
    * @ja Mixin クラスに対して属性を設定
    *
    * @example <br>
    *
    * ```ts
    * // 'protoExtendOnly'
    * class Base { constructor(a, b) {} };
    * class MixA { };
    * setMixClassAttribute(MixA, 'protoExtendsOnly');  // for improving construction performance
    * class MixB { constructor(c, d) {} };
    *
    * class MixinClass extends mixins(Base, MixA, MixB) {
    *     constructor(a, b, c, d){
    *         // calling `Base` constructor
    *         super(a, b);
    *
    *         // calling Mixin class's constructor
    *         this.super(MixA);        // no affect
    *         this.super(MixB, c, d);
    *     }
    * }
    *
    * const mixed = new MixinClass();
    * console.log(mixed instanceof MixA);    // false
    * console.log(mixed.isMixedWith(MixA));  // false
    *
    * // 'instanceOf'
    * class Base {};
    * class Source {};
    * class MixinClass extends mixins(Base, Source) {};
    *
    * class Other extends Source {};
    *
    * const mixed = new MixinClass();
    * console.log(mixed instanceof MixinClass);    // true
    * console.log(mixed instanceof Base);          // true
    * console.log(mixed instanceof Source);        // true
    * console.log(mixed instanceof Other);         // true ???
    *
    * setMixClassAttribute(Other, 'instanceOf'); // or setMixClassAttribute(Other, 'instanceOf', null);
    * console.log(mixed instanceof Other);         // false !
    * ```
    *
    * @param target
    *  - `en` set target constructor
    *  - `ja` 設定対象のコンストラクタ
    * @param attr
    *  - `en`:
    *    - `protoExtendsOnly`: Suppress providing constructor-trap for the mixin source class. (for improving performance)
    *    - `instanceOf`      : function by using [Symbol.hasInstance] <br>
    *                          Default behaviour is `{ return target.prototype.isPrototypeOf(instance) }`
    *                          If set `null`, delete [Symbol.hasInstance] property.
    *  - `ja`:
    *    - `protoExtendsOnly`: Mixin Source クラスに対して, コンストラクタトラップを抑止 (パフォーマンス改善)
    *    - `instanceOf`      : [Symbol.hasInstance] が使用する関数を指定 <br>
    *                          既定では `{ return target.prototype.isPrototypeOf(instance) }` が使用される
    *                         `null` 指定をすると [Symbol.hasInstance] プロパティを削除する
    */
   function setMixClassAttribute(target, attr, method) {
       switch (attr) {
           case 'protoExtendsOnly':
               target[_protoExtendsOnly] = true;
               break;
           case 'instanceOf':
               setInstanceOf(target, method);
               break;
       }
   }
   /**
    * @en Mixin function for multiple inheritance. <br>
    *     Resolving type support for maximum 10 classes.
    * @ja 多重継承のための Mixin <br>
    *     最大 10 クラスの型解決をサポート
    *
    * @example <br>
    *
    * ```ts
    * class Base { constructor(a, b) {} };
    * class MixA { constructor(a, b) {} };
    * class MixB { constructor(c, d) {} };
    *
    * class MixinClass extends mixins(Base, MixA, MixB) {
    *     constructor(a, b, c, d){
    *         // calling `Base` constructor
    *         super(a, b);
    *
    *         // calling Mixin class's constructor
    *         this.super(MixA, a, b);
    *         this.super(MixB, c, d);
    *     }
    * }
    * ```
    *
    * @param base
    *  - `en` primary base class. super(args) is this class's one.
    *  - `ja` 基底クラスコンストラクタ. 同名プロパティ, メソッドは最優先される. super(args) はこのクラスのものが指定可能.
    * @param sources
    *  - `en` multiple extends class
    *  - `ja` 拡張クラスコンストラクタ
    * @returns
    *  - `en` mixined class constructor
    *  - `ja` 合成されたクラスコンストラクタ
    */
   function mixins(base, ...sources) {
       let _hasSourceConstructor = false;
       // eslint-disable-next-line @typescript-eslint/class-name-casing
       class _MixinBase extends base {
           constructor(...args) {
               // eslint-disable-next-line constructor-super
               super(...args);
               const constructors = new Map();
               this[_constructors] = constructors;
               this[_classBase] = base;
               if (_hasSourceConstructor) {
                   for (const srcClass of sources) {
                       if (!srcClass[_protoExtendsOnly]) {
                           const handler = {
                               apply: (target, thisobj, arglist) => {
                                   const obj = new srcClass(...arglist);
                                   copyProperties(this, obj);
                               }
                           };
                           // proxy for 'construct' and cache constructor
                           constructors.set(srcClass, new Proxy(srcClass, handler));
                       }
                   }
               }
           }
           super(srcClass, ...args) {
               const map = this[_constructors];
               const ctor = map.get(srcClass);
               if (ctor) {
                   ctor.call(this, ...args);
                   map.set(srcClass, null); // prevent calling twice
               }
               return this;
           }
           isMixedWith(srcClass) {
               if (this.constructor === srcClass) {
                   return false;
               }
               else if (this[_classBase] === srcClass) {
                   return true;
               }
               else {
                   return this[_classSources].reduce((p, c) => p || (srcClass === c), false);
               }
           }
           static [Symbol.hasInstance](instance) {
               return Object.prototype.isPrototypeOf.call(_MixinBase.prototype, instance);
           }
           [_isInherited](srcClass) {
               const ctors = this[_constructors];
               if (ctors.has(srcClass)) {
                   return true;
               }
               for (const ctor of ctors.keys()) {
                   if (Object.prototype.isPrototypeOf.call(srcClass, ctor)) {
                       return true;
                   }
               }
               return false;
           }
           get [_classSources]() {
               return [...this[_constructors].keys()];
           }
       }
       for (const srcClass of sources) {
           // provide custom instanceof
           const desc = Object.getOwnPropertyDescriptor(srcClass, Symbol.hasInstance);
           if (!desc || desc.writable) {
               const orgInstanceOf = desc ? srcClass[Symbol.hasInstance] : _instanceOf;
               setInstanceOf(srcClass, (inst) => {
                   return orgInstanceOf.call(srcClass, inst) || ((null != inst && inst[_isInherited]) ? inst[_isInherited](srcClass) : false);
               });
           }
           // provide prototype
           copyProperties(_MixinBase.prototype, srcClass.prototype);
           let parent = Object.getPrototypeOf(srcClass.prototype);
           while (_objPrototype !== parent) {
               copyProperties(_MixinBase.prototype, parent);
               parent = Object.getPrototypeOf(parent);
           }
           // check constructor
           if (!_hasSourceConstructor) {
               _hasSourceConstructor = !srcClass[_protoExtendsOnly];
           }
       }
       return _MixinBase;
   }

   /* eslint-disable
      no-invalid-this
    , @typescript-eslint/no-explicit-any
    */
   const random = Math.random.bind(Math);
   /**
    * @en Execute shuffle of an array elements.
    * @ja 配列要素のシャッフル
    *
    * @param array
    *  - `en` source array
    *  - `ja` 入力配列
    * @param destructive
    *  - `en` true: destructive / false: non-destructive (default)
    *  - `ja` true: 破壊的 / false: 非破壊的 (既定)
    */
   function shuffle(array, destructive = false) {
       const source = destructive ? array : array.slice();
       const len = source.length;
       for (let i = len > 0 ? len >>> 0 : 0; i > 1;) {
           const j = i * random() >>> 0;
           const swap = source[--i];
           source[i] = source[j];
           source[j] = swap;
       }
       return source;
   }
   //__________________________________________________________________________________________________//
   /**
    * @en Execute stable sort by merge-sort algorithm.
    * @ja `merge-sort` による安定ソート
    *
    * @param array
    *  - `en` source array
    *  - `ja` 入力配列
    * @param comparator
    *  - `en` sort comparator function
    *  - `ja` ソート関数を指定
    * @param destructive
    *  - `en` true: destructive / false: non-destructive (default)
    *  - `ja` true: 破壊的 / false: 非破壊的 (既定)
    */
   function sort(array, comparator, destructive = false) {
       const source = destructive ? array : array.slice();
       if (source.length < 2) {
           return source;
       }
       const lhs = sort(source.splice(0, source.length >>> 1), comparator, true);
       const rhs = sort(source.splice(0), comparator, true);
       while (lhs.length && rhs.length) {
           source.push(comparator(lhs[0], rhs[0]) <= 0 ? lhs.shift() : rhs.shift());
       }
       return source.concat(lhs, rhs);
   }
   //__________________________________________________________________________________________________//
   /**
    * @en Make unique array.
    * @ja 重複要素のない配列の作成
    *
    * @param array
    *  - `en` source array
    *  - `ja` 入力配列
    */
   function unique(array) {
       return [...new Set(array)];
   }
   /**
    * @en Make union array.
    * @ja 配列の和集合を返却
    *
    * @param arrays
    *  - `en` source arrays
    *  - `ja` 入力配列群
    */
   function union(...arrays) {
       return unique(arrays.flat());
   }
   //__________________________________________________________________________________________________//
   /**
    * @en Make index array.
    * @ja インデックス配列の作成
    *
    * @param array
    *  - `en` source array
    *  - `ja` 入力配列
    * @param excludes
    *  - `en` exclude index in return value.
    *  - `ja` 戻り値配列に含めないインデックスを指定
    */
   function indices(array, ...excludes) {
       const retval = [...array.keys()];
       const len = array.length;
       const exList = [...new Set(excludes)].sort((lhs, rhs) => lhs < rhs ? 1 : -1);
       for (const ex of exList) {
           if (0 <= ex && ex < len) {
               retval.splice(ex, 1);
           }
       }
       return retval;
   }
   /**
    * @en Execute `GROUP BY` for array elements.
    * @ja 配列の要素の `GROUP BY` 集合を抽出
    *
    * @param array
    *  - `en` source array
    *  - `ja` 入力配列
    * @param options
    *  - `en` `GROUP BY` options
    *  - `ja` `GROUP BY` オプション
    */
   function groupBy(array, options) {
       const { keys, sumKeys, groupKey } = options;
       const _groupKey = groupKey || 'items';
       const _sumKeys = sumKeys || [];
       _sumKeys.push(_groupKey);
       const hash = array.reduce((res, data) => {
           // create groupBy internal key
           const _key = keys.reduce((s, k) => s + String(data[k]), '');
           // init keys
           if (!(_key in res)) {
               const keyList = keys.reduce((h, k) => {
                   h[k] = data[k];
                   return h;
               }, {});
               res[_key] = _sumKeys.reduce((h, k) => {
                   h[k] = 0;
                   return h;
               }, keyList);
           }
           const resKey = res[_key];
           // sum properties
           for (const k of _sumKeys) {
               if (_groupKey === k) {
                   resKey[k] = resKey[k] || [];
                   resKey[k].push(data);
               }
               else {
                   resKey[k] += data[k];
               }
           }
           return res;
       }, {});
       return Object.values(hash);
   }
   //__________________________________________________________________________________________________//
   /**
    * @en Substitution method of `Array.prototype.map()` which also accepts asynchronous callback.
    * @ja 非同期コールバックを指定可能な `Array.prototype.map()` の代替メソッド
    *
    * @param array
    *  - `en` Array to iterate over.
    *  - `ja` 入力配列
    * @param callback
    *  - `en` Function to apply each item in `array`.
    *  - `ja` イテレーション適用関数
    * @param thisArg
    *  - `en` Value to use as *this* when executing the `callback`.
    *  - `ja` `callback` 実行コンテキスト
    * @returns
    *  - `en` Returns a Promise with the resultant *Array* as value.
    *  - `ja` イテレーション結果配列を格納した Promise オブジェクト
    */
   async function map(array, callback, thisArg) {
       return Promise.all(array.map(async (v, i, a) => {
           return await callback.call(thisArg || this, v, i, a);
       }));
   }
   /**
    * @en Substitution method of `Array.prototype.filter()` which also accepts asynchronous callback.
    * @ja 非同期コールバックを指定可能な `Array.prototype.filter()` の代替メソッド
    *
    * @param array
    *  - `en` Array to iterate over.
    *  - `ja` 入力配列
    * @param callback
    *  - `en` Function to apply each item in `array`.
    *  - `ja` イテレーション適用関数
    * @param thisArg
    *  - `en` Value to use as *this* when executing the `callback`.
    *  - `ja` `callback` 実行コンテキスト
    * @returns
    *  - `en` Returns a Promise with the resultant *Array* as value.
    *  - `ja` イテレーション結果配列を格納した Promise オブジェクト
    */
   async function filter(array, callback, thisArg) {
       const bits = await map(array, (v, i, a) => callback.call(thisArg || this, v, i, a));
       return array.filter(() => bits.shift());
   }
   /**
    * @en Substitution method of `Array.prototype.find()` which also accepts asynchronous callback.
    * @ja 非同期コールバックを指定可能な `Array.prototype.find()` の代替メソッド
    *
    * @param array
    *  - `en` Array to iterate over.
    *  - `ja` 入力配列
    * @param callback
    *  - `en` Function to apply each item in `array`.
    *  - `ja` イテレーション適用関数
    * @param thisArg
    *  - `en` Value to use as *this* when executing the `callback`.
    *  - `ja` `callback` 実行コンテキスト
    * @returns
    *  - `en` Returns a Promise with the resultant value.
    *  - `ja` イテレーション結果を格納した Promise オブジェクト
    */
   async function find(array, callback, thisArg) {
       for (const [i, v] of array.entries()) {
           if (await callback.call(thisArg || this, v, i, array)) {
               return v;
           }
       }
       return undefined;
   }
   /**
    * @en Substitution method of `Array.prototype.findIndex()` which also accepts asynchronous callback.
    * @ja 非同期コールバックを指定可能な `Array.prototype.findIndex()` の代替メソッド
    *
    * @param array
    *  - `en` Array to iterate over.
    *  - `ja` 入力配列
    * @param callback
    *  - `en` Function to apply each item in `array`.
    *  - `ja` イテレーション適用関数
    * @param thisArg
    *  - `en` Value to use as *this* when executing the `callback`.
    *  - `ja` `callback` 実行コンテキスト
    * @returns
    *  - `en` Returns a Promise with the resultant index value.
    *  - `ja` インデックスを格納した Promise オブジェクト
    */
   async function findIndex(array, callback, thisArg) {
       for (const [i, v] of array.entries()) {
           if (await callback.call(thisArg || this, v, i, array)) {
               return i;
           }
       }
       return -1;
   }
   /**
    * @en Substitution method of `Array.prototype.some()` which also accepts asynchronous callback.
    * @ja 非同期コールバックを指定可能な `Array.prototype.some()` の代替メソッド
    *
    * @param array
    *  - `en` Array to iterate over.
    *  - `ja` 入力配列
    * @param callback
    *  - `en` Function to apply each item in `array`.
    *  - `ja` イテレーション適用関数
    * @param thisArg
    *  - `en` Value to use as *this* when executing the `callback`.
    *  - `ja` `callback` 実行コンテキスト
    * @returns
    *  - `en` Returns a Promise with the resultant boolean value.
    *  - `ja` 真偽値を格納した Promise オブジェクト
    */
   async function some(array, callback, thisArg) {
       for (const [i, v] of array.entries()) {
           if (await callback.call(thisArg || this, v, i, array)) {
               return true;
           }
       }
       return false;
   }
   /**
    * @en Substitution method of `Array.prototype.every()` which also accepts asynchronous callback.
    * @ja 非同期コールバックを指定可能な `Array.prototype.every()` の代替メソッド
    *
    * @param array
    *  - `en` Array to iterate over.
    *  - `ja` 入力配列
    * @param callback
    *  - `en` Function to apply each item in `array`.
    *  - `ja` イテレーション適用関数
    * @param thisArg
    *  - `en` Value to use as *this* when executing the `callback`.
    *  - `ja` `callback` 実行コンテキスト
    * @returns
    *  - `en` Returns a Promise with the resultant boolean value.
    *  - `ja` 真偽値を格納した Promise オブジェクト
    */
   async function every(array, callback, thisArg) {
       for (const [i, v] of array.entries()) {
           if (!await callback.call(thisArg || this, v, i, array)) {
               return false;
           }
       }
       return true;
   }
   /**
    * @en Substitution method of `Array.prototype.reduce()` which also accepts asynchronous callback.
    * @ja 非同期コールバックを指定可能な `Array.prototype.reduce()` の代替メソッド
    *
    * @param array
    *  - `en` Array to iterate over.
    *  - `ja` 入力配列
    * @param callback
    *  - `en` Function to apply each item in `array`.
    *  - `ja` イテレーション適用関数
    * @param initialValue
    *  - `en` Used as first argument to the first call of `callback`.
    *  - `ja` `callback` に渡される初期値
    * @returns
    *  - `en` Returns a Promise with the resultant *Array* as value.
    *  - `ja` イテレーション結果配列を格納した Promise オブジェクト
    */
   async function reduce(array, callback, initialValue) {
       if (array.length <= 0 && undefined === initialValue) {
           throw TypeError('Reduce of empty array with no initial value');
       }
       const hasInit = (undefined !== initialValue);
       let acc = (hasInit ? initialValue : array[0]);
       for (const [i, v] of array.entries()) {
           if (!(!hasInit && 0 === i)) {
               acc = await callback(acc, v, i, array);
           }
       }
       return acc;
   }

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   /**
    * @en Check whether input source has a property.
    * @ja 入力元がプロパティを持っているか判定
    *
    * @param src
    */
   function has(src, propName) {
       return null != src && isObject(src) && (propName in src);
   }
   /**
    * @en Get shallow copy of `target` which has only `pickKeys`.
    * @ja `pickKeys` で指定されたプロパティのみを持つ `target` の Shallow Copy を取得
    *
    * @param target
    *  - `en` copy source object
    *  - `ja` コピー元オブジェクト
    * @param pickKeys
    *  - `en` copy target keys
    *  - `ja` コピー対象のキー一覧
    */
   function pick(target, ...pickKeys) {
       if (!target || !isObject(target)) {
           throw new TypeError(`${className(target)} is not an object.`);
       }
       return pickKeys.reduce((obj, key) => {
           key in target && (obj[key] = target[key]);
           return obj;
       }, {});
   }
   /**
    * @en Get shallow copy of `target` without `omitKeys`.
    * @ja `omitKeys` で指定されたプロパティ以外のキーを持つ `target` の Shallow Copy を取得
    *
    * @param target
    *  - `en` copy source object
    *  - `ja` コピー元オブジェクト
    * @param omitKeys
    *  - `en` omit target keys
    *  - `ja` 削除対象のキー一覧
    */
   function omit(target, ...omitKeys) {
       if (!target || !isObject(target)) {
           throw new TypeError(`${className(target)} is not an object.`);
       }
       const obj = {};
       for (const key of Object.keys(target)) {
           !omitKeys.includes(key) && (obj[key] = target[key]);
       }
       return obj;
   }
   /**
    * @en Invert the keys and values of an object. The values must be serializable.
    * @ja オブジェクトのキーと値を逆転する. すべての値がユニークであることが前提
    *
    * @param target
    *  - `en` target object
    *  - `ja` 対象オブジェクト
    */
   function invert(target) {
       const result = {};
       for (const key of Object.keys(target)) {
           result[target[key]] = key;
       }
       return result;
   }
   /**
    * @en Get shallow copy of difference between `base` and `src`.
    * @ja `base` と `src` の差分プロパティをもつオブジェクトの Shallow Copy を取得
    *
    * @param base
    *  - `en` base object
    *  - `ja` 基準となるオブジェクト
    * @param src
    *  - `en` source object
    *  - `ja` コピー元オブジェクト
    */
   function diff(base, src) {
       if (!base || !isObject(base)) {
           throw new TypeError(`${className(base)} is not an object.`);
       }
       if (!src || !isObject(src)) {
           throw new TypeError(`${className(src)} is not an object.`);
       }
       const retval = {};
       for (const key of Object.keys(src)) {
           if (!deepEqual(base[key], src[key])) {
               retval[key] = src[key];
           }
       }
       return retval;
   }
   /**
    * @en If the value of the named property is a function then invoke it; otherwise, return it.
    * @ja object の property がメソッドならその実行結果を, プロパティならその値を返却
    *
    * @param target
    * - `en` Object to maybe invoke function `property` on.
    * - `ja` 評価するオブジェクト
    * @param property
    * - `en` The function by name to invoke on `object`.
    * - `ja` 評価するプロパティ名
    * @param fallback
    * - `en` The value to be returned in case `property` doesn't exist or is undefined.
    * - `ja` 存在しなかった場合の fallback 値
    */
   function result(target, property, fallback) {
       const props = isArray(property) ? property : [property];
       if (!props.length) {
           return isFunction(fallback) ? fallback.call(target) : fallback;
       }
       const resolve = (o, p) => {
           return isFunction(p) ? p.call(o) : p;
       };
       let obj = target;
       for (const name of props) {
           const prop = null == obj ? undefined : obj[name];
           if (undefined === prop) {
               return resolve(obj, fallback);
           }
           obj = resolve(obj, prop);
       }
       return obj;
   }

   const _computeDateFuncMap = {
       year: (date, base, add) => {
           date.setUTCFullYear(base.getUTCFullYear() + add);
           return date;
       },
       month: (date, base, add) => {
           date.setUTCMonth(base.getUTCMonth() + add);
           return date;
       },
       day: (date, base, add) => {
           date.setUTCDate(base.getUTCDate() + add);
           return date;
       },
       hour: (date, base, add) => {
           date.setUTCHours(base.getUTCHours() + add);
           return date;
       },
       min: (date, base, add) => {
           date.setUTCMinutes(base.getUTCMinutes() + add);
           return date;
       },
       sec: (date, base, add) => {
           date.setUTCSeconds(base.getUTCSeconds() + add);
           return date;
       },
       msec: (date, base, add) => {
           date.setUTCMilliseconds(base.getUTCMilliseconds() + add);
           return date;
       },
   };
   /**
    * @en Calculate from the date which becomes a cardinal point before a N date time or after a N date time (by [[DateUnit]]).
    * @ja 基点となる日付から、N日後、N日前を算出
    *
    * @param base
    *  - `en` base date time.
    *  - `ja` 基準日
    * @param add
    *  - `en` relative date time.
    *  - `ja` 加算日. マイナス指定でn日前も設定可能
    * @param unit [[DateUnit]]
    */
   function computeDate(base, add, unit = 'day') {
       const date = new Date(base.getTime());
       const func = _computeDateFuncMap[unit];
       if (func) {
           return func(date, base, add);
       }
       else {
           throw new TypeError(`invalid unit: ${unit}`);
       }
   }

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   function callable() {
       // eslint-disable-next-line @typescript-eslint/no-use-before-define
       return accessible;
   }
   const accessible = new Proxy(callable, {
       get: (target, name) => {
           const prop = target[name];
           if (null != prop) {
               return prop;
           }
           else {
               return accessible;
           }
       },
   });
   function create() {
       const stub = new Proxy({}, {
           get: (target, name) => {
               const prop = target[name];
               if (null != prop) {
                   return prop;
               }
               else {
                   return accessible;
               }
           },
       });
       Object.defineProperty(stub, 'stub', {
           value: true,
           writable: false,
       });
       return stub;
   }
   /**
    * @en Get safe accessible object.
    * @ja 安全にアクセス可能なオブジェクトの取得
    *
    * @example <br>
    *
    * ```ts
    * const safeWindow = safe(globalThis.window);
    * console.log(null != safeWindow.document);    // true
    * const div = safeWindow.document.createElement('div');
    * console.log(null != div);    // true
    * ```
    *
    * @param target
    *  - `en` A reference of an object with a possibility which exists.
    *  - `ja` 存在しうるオブジェクトの参照
    * @returns
    *  - `en` Reality or stub instance.
    *  - `ja` 実体またはスタブインスタンス
    */
   function safe(target) {
       return target || create();
   }

   /* eslint-disable
      @typescript-eslint/no-empty-interface
    , @typescript-eslint/no-explicit-any
    */
   const root = getGlobal();
   const _setTimeout = safe(root.setTimeout);
   const _clearTimeout = safe(root.clearTimeout);
   const _setInterval = safe(root.setInterval);
   const _clearInterval = safe(root.clearInterval);

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   /**
    * @en Ensure asynchronous execution.
    * @ja 非同期実行を保証
    *
    * @example <br>
    *
    * ```ts
    * post(() => exec(arg));
    * ```
    *
    * @param executor
    *  - `en` implement as function scope.
    *  - `ja` 関数スコープとして実装
   */
   function post(executor) {
       return Promise.resolve().then(executor);
   }
   /**
    * @en Generic No-Operation.
    * @ja 汎用 No-Operation
    */
   function noop(...args) {
       // noop
   }
   /**
    * @en Wait for the designation elapse.
    * @ja 指定時間処理を待機
    *
    * @param elapse
    *  - `en` wait elapse [msec].
    *  - `ja` 待機時間 [msec]
    */
   function sleep(elapse) {
       return new Promise(resolve => _setTimeout(resolve, elapse));
   }
   /**
    * @en Returns a function, that, when invoked, will only be triggered at most once during a given time.
    * @ja 関数の実行を wait [msec] に1回に制限
    *
    * @example <br>
    *
    * ```ts
    * const throttled = throttle(upatePosition, 100);
    * $(window).scroll(throttled);
    * ```
    *
    * @param executor
    *  - `en` seed function.
    *  - `ja` 対象の関数
    * @param elapse
    *  - `en` wait elapse [msec].
    *  - `ja` 待機時間 [msec]
    * @param options
    */
   function throttle(executor, elapse, options) {
       const opts = options || {};
       let handle;
       let args;
       let context, result;
       let previous = 0;
       const later = function () {
           previous = false === opts.leading ? 0 : Date.now();
           handle = undefined;
           result = executor.apply(context, args);
           if (!handle) {
               context = args = undefined;
           }
       };
       const throttled = function (...arg) {
           const now = Date.now();
           if (!previous && false === opts.leading) {
               previous = now;
           }
           const remaining = elapse - (now - previous);
           // eslint-disable-next-line no-invalid-this
           context = this;
           args = [...arg];
           if (remaining <= 0 || remaining > elapse) {
               if (handle) {
                   _clearTimeout(handle);
                   handle = undefined;
               }
               previous = now;
               result = executor.apply(context, args);
               if (!handle) {
                   context = args = undefined;
               }
           }
           else if (!handle && false !== opts.trailing) {
               handle = _setTimeout(later, remaining);
           }
           return result;
       };
       throttled.cancel = function () {
           _clearTimeout(handle);
           previous = 0;
           handle = context = args = undefined;
       };
       return throttled;
   }
   /**
    * @en Returns a function, that, as long as it continues to be invoked, will not be triggered.
    * @ja 呼び出されてから wait [msec] 経過するまで実行しない関数を返却
    *
    * @param executor
    *  - `en` seed function.
    *  - `ja` 対象の関数
    * @param wait
    *  - `en` wait elapse [msec].
    *  - `ja` 待機時間 [msec]
    * @param immediate
    *  - `en` If `true` is passed, trigger the function on the leading edge, instead of the trailing.
    *  - `ja` `true` の場合, 初回のコールは即時実行
    */
   function debounce(executor, wait, immediate) {
       /* eslint-disable no-invalid-this */
       let handle;
       let result;
       const later = function (context, args) {
           handle = undefined;
           if (args) {
               result = executor.apply(context, args);
           }
       };
       const debounced = function (...args) {
           if (handle) {
               _clearTimeout(handle);
           }
           if (immediate) {
               const callNow = !handle;
               handle = _setTimeout(later, wait);
               if (callNow) {
                   result = executor.apply(this, args);
               }
           }
           else {
               handle = _setTimeout(later, wait, this, [...args]);
           }
           return result;
       };
       debounced.cancel = function () {
           _clearTimeout(handle);
           handle = undefined;
       };
       return debounced;
       /* eslint-enable no-invalid-this */
   }
   /**
    * @en Returns a function that will be executed at most one time, no matter how often you call it.
    * @ja 1度しか実行されない関数を返却. 2回目以降は最初のコールのキャッシュを返却
    *
    * @param executor
    *  - `en` seed function.
    *  - `ja` 対象の関数
    */
   function once(executor) {
       /* eslint-disable no-invalid-this, @typescript-eslint/no-non-null-assertion */
       let memo;
       return function (...args) {
           if (executor) {
               memo = executor.call(this, ...args);
               executor = null;
           }
           return memo;
       };
       /* eslint-enable no-invalid-this, @typescript-eslint/no-non-null-assertion */
   }
   //__________________________________________________________________________________________________//
   /**
    * @en Create escape function from map.
    * @ja 文字置換関数を作成
    *
    * @param map
    *  - `en` key: target char, value: replace char
    *  - `ja` key: 置換対象, value: 置換文字
    * @returns
    *  - `en` espace function
    *  - `ja` エスケープ関数
    */
   function createEscaper(map) {
       const escaper = (match) => {
           return map[match];
       };
       const source = `(?:${Object.keys(map).join('|')})`;
       const regexTest = RegExp(source);
       const regexReplace = RegExp(source, 'g');
       return (src) => {
           src = (null == src || 'symbol' === typeof src) ? '' : String(src);
           return regexTest.test(src) ? src.replace(regexReplace, escaper) : src;
       };
   }
   const mapHtmlEscape = {
       '<': '&lt;',
       '>': '&gt;',
       '&': '&amp;',
       '"': '&quot;',
       "'": '&#39;',
       '`': '&#x60;'
   };
   /**
    * @en Escape HTML string.
    * @ja HTML で使用する文字を制御文字に置換
    *
    * @brief <br>
    *
    * ```ts
    * const mapHtmlEscape = {
    *     '<': '&lt;',
    *     '>': '&gt;',
    *     '&': '&amp;',
    *     '"': '&quot;',
    *     "'": '&#39;',
    *     '`': '&#x60;'
    * };
    * ```
    */
   const escapeHTML = createEscaper(mapHtmlEscape);
   /**
    * @en Unescape HTML string.
    * @ja HTML で使用する制御文字を復元
    */
   const unescapeHTML = createEscaper(invert(mapHtmlEscape));
   //__________________________________________________________________________________________________//
   /**
    * @en Convert to the style compulsion value from input string.
    * @ja 入力文字列を型強制した値に変換
    *
    * @param data
    *  - `en` input string
    *  - `ja` 変換対象の文字列
    */
   function toTypedData(data) {
       if ('true' === data) {
           // boolean: true
           return true;
       }
       else if ('false' === data) {
           // boolean: false
           return false;
       }
       else if ('null' === data) {
           // null
           return null;
       }
       else if (data === String(Number(data))) {
           // number: 数値変換 → 文字列変換で元に戻るとき
           return Number(data);
       }
       else if (data && /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/.test(data)) {
           // object
           return JSON.parse(data);
       }
       else {
           // string / undefined
           return data;
       }
   }
   /**
    * @en Convert to string from [[TypedData]].
    * @ja [[TypedData]] を文字列に変換
    *
    * @param data
    *  - `en` input string
    *  - `ja` 変換対象の文字列
    */
   function fromTypedData(data) {
       if (undefined === data || isString(data)) {
           return data;
       }
       else if (isObject(data)) {
           return JSON.stringify(data);
       }
       else {
           return String(data);
       }
   }
   /**
    * @en Convert to `Web API` stocked type. <br>
    *     Ensure not to return `undefined` value.
    * @ja `Web API` 格納形式に変換 <br>
    *     `undefined` を返却しないことを保証
    */
   function dropUndefined(value, nilSerialize = false) {
       return null != value ? value : (nilSerialize ? String(value) : null);
   }
   /**
    * @en Deserialize from `Web API` stocked type. <br>
    *     Convert from 'null' or 'undefined' string to original type.
    * @ja 'null' or 'undefined' をもとの型に戻す
    */
   function restoreNil(value) {
       if ('null' === value) {
           return null;
       }
       else if ('undefined' === value) {
           return undefined;
       }
       else {
           return value;
       }
   }
   //__________________________________________________________________________________________________//
   let _localId = 0;
   /**
    * @en Get local unique id. <br>
    *     "local unique" means guarantees unique during in script life cycle only.
    * @ja ローカルユニーク ID の取得 <br>
    *     スクリプトライフサイクル中の同一性を保証する.
    *
    * @param prefix
    *  - `en` ID prefix
    *  - `ja` ID に付与する Prefix
    * @param zeroPad
    *  - `en` 0 padding order
    *  - `ja` 0 詰めする桁数を指定
    */
   function luid(prefix = '', zeroPad) {
       const id = (++_localId).toString(16);
       return (null != zeroPad) ? `${prefix}${id.padStart(zeroPad, '0')}` : `${prefix}${id}`;
   }
   //__________________________________________________________________________________________________//
   /** @internal */
   const _regexCancelLikeString = /(abort|cancel)/im;
   /**
    * @en Presume whether it's a canceled error.
    * @ja キャンセルされたエラーであるか推定
    *
    * @param error
    *  - `en` an error object handled in `catch` block.
    *  - `ja` `catch` 節などで補足したエラーを指定
    */
   function isChancelLikeError(error) {
       if (null == error) {
           return false;
       }
       else if (isString(error)) {
           return _regexCancelLikeString.test(error);
       }
       else if (isObject(error)) {
           return _regexCancelLikeString.test(error.message);
       }
       else {
           return false;
       }
   }
   //__________________________________________________________________________________________________//
   /**
    * @en Converts first letter of the string to uppercase.
    * @ja 最初の文字を大文字に変換
    *
    *
    * @example <br>
    *
    * ```ts
    * capitalize("foo Bar");
    * // => "Foo Bar"
    *
    * capitalize("FOO Bar", true);
    * // => "Foo bar"
    * ```
    *
    * @param src
    *  - `en` source string
    *  - `ja` 変換元文字列
    * @param lowercaseRest
    *  - `en` If `true` is passed, the rest of the string will be converted to lower case
    *  - `ja` `true` を指定した場合, 2文字目以降も小文字化
    */
   function capitalize(src, lowercaseRest = false) {
       const remainingChars = !lowercaseRest ? src.slice(1) : src.slice(1).toLowerCase();
       return src.charAt(0).toUpperCase() + remainingChars;
   }
   /**
    * @en Converts first letter of the string to lowercase.
    * @ja 最初の文字を小文字化
    *
    * @example <br>
    *
    * ```ts
    * decapitalize("Foo Bar");
    * // => "foo Bar"
    * ```
    *
    * @param src
    *  - `en` source string
    *  - `ja` 変換元文字列
    */
   function decapitalize(src) {
       return src.charAt(0).toLowerCase() + src.slice(1);
   }
   /**
    * @en Converts underscored or dasherized string to a camelized one. <br>
    *     Begins with a lower case letter unless it starts with an underscore, dash or an upper case letter.
    * @ja `_`, `-` 区切り文字列をキャメルケース化 <br>
    *     `-` または大文字スタートであれば, 大文字スタートが既定値
    *
    * @example <br>
    *
    * ```ts
    * camelize("moz-transform");
    * // => "mozTransform"
    *
    * camelize("-moz-transform");
    * // => "MozTransform"
    *
    * camelize("_moz_transform");
    * // => "MozTransform"
    *
    * camelize("Moz-transform");
    * // => "MozTransform"
    *
    * camelize("-moz-transform", true);
    * // => "mozTransform"
    * ```
    *
    * @param src
    *  - `en` source string
    *  - `ja` 変換元文字列
    * @param lower
    *  - `en` If `true` is passed, force converts to lower camel case in starts with the special case.
    *  - `ja` 強制的に小文字スタートする場合には `true` を指定
    */
   function camelize(src, lower = false) {
       src = src.trim().replace(/[-_\s]+(.)?/g, (match, c) => {
           return c ? c.toUpperCase() : '';
       });
       if (true === lower) {
           return decapitalize(src);
       }
       else {
           return src;
       }
   }
   /**
    * @en Converts string to camelized class name. First letter is always upper case.
    * @ja 先頭大文字のキャメルケースに変換
    *
    * @example <br>
    *
    * ```ts
    * classify("some_class_name");
    * // => "SomeClassName"
    * ```
    *
    * @param src
    *  - `en` source string
    *  - `ja` 変換元文字列
    */
   function classify(src) {
       return capitalize(camelize(src.replace(/[\W_]/g, ' ')).replace(/\s/g, ''));
   }
   /**
    * @en Converts a camelized or dasherized string into an underscored one.
    * @ja キャメルケース or `-` つなぎ文字列を `_` つなぎに変換
    *
    * @example <br>
    *
    * ```ts
    * underscored("MozTransform");
    * // => "moz_transform"
    * ```
    *
    * @param src
    *  - `en` source string
    *  - `ja` 変換元文字列
    */
   function underscored(src) {
       return src.trim().replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
   }
   /**
    * @en Converts a underscored or camelized string into an dasherized one.
    * @ja キャメルケース or `_` つなぎ文字列を `-` つなぎに変換
    *
    * @example <br>
    *
    * ```ts
    * dasherize("MozTransform");
    * // => "-moz-transform"
    * ```
    *
    * @param src
    *  - `en` source string
    *  - `ja` 変換元文字列
    */
   function dasherize(src) {
       return src.trim().replace(/([A-Z])/g, '-$1').replace(/[_\s]+/g, '-').toLowerCase();
   }

   /*!
    * @cdp/events 0.9.0
    *   pub/sub framework
    */

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   /** @internal Lisner の弱参照 */
   const _mapListeners = new WeakMap();
   /** @internal LisnerMap の取得 */
   function listeners(instance) {
       if (!_mapListeners.has(instance)) {
           throw new TypeError('This is not a valid EventPublisher.');
       }
       return _mapListeners.get(instance);
   }
   /** @internal Channel の型検証 */
   function validChannel(channel) {
       if (isString(channel) || isSymbol(channel)) {
           return;
       }
       throw new TypeError(`Type of ${className(channel)} is not a valid channel.`);
   }
   /** @internal Listener の型検証 */
   function validListener(listener) {
       if (null != listener) {
           verify('typeOf', 'function', listener);
       }
       return listener;
   }
   /** @internal event 発行 */
   function triggerEvent(map, channel, original, ...args) {
       const list = map.get(channel);
       if (!list) {
           return;
       }
       for (const listener of list) {
           try {
               const eventArgs = original ? [original, ...args] : args;
               const handled = listener(...eventArgs);
               // if received 'true', stop delegation.
               if (true === handled) {
                   break;
               }
           }
           catch (e) {
               Promise.reject(e);
           }
       }
   }
   //__________________________________________________________________________________________________//
   /**
    * @en Eventing framework class with ensuring type-safe for TypeScript. <br>
    *     The client of this class can implement original Pub-Sub (Observer) design pattern.
    * @ja 型安全を保障するイベント登録・発行クラス <br>
    *     クライアントは本クラスを派生して独自の Pub-Sub (Observer) パターンを実装可能
    *
    * @example <br>
    *
    * ```ts
    * import { EventPublisher } from '@cdp/events';
    *
    * // declare event interface
    * interface SampleEvent {
    *   hoge: [number, string];        // callback function's args type tuple
    *   foo: [void];                   // no args
    *   hoo: void;                     // no args (same the upon)
    *   bar: [Error];                  // any class is available.
    *   baz: Error | Number;           // if only one argument, `[]` is not required.
    * }
    *
    * // declare client class
    * class SamplePublisher extends EventPublisher<SampleEvent> {
    *   :
    *   someMethod(): void {
    *     this.publish('hoge', 100, 'test');       // OK. standard usage.
    *     this.publish('hoge', 100, true);         // NG. argument of type 'true' is not assignable
    *                                              //     to parameter of type 'string | undefined'.
    *     this.publish('hoge', 100);               // OK. all args to be optional automatically.
    *     this.publish('foo');                     // OK. standard usage.
    *     this.publish('foo', 100);                // NG. argument of type '100' is not assignable
    *                                              //     to parameter of type 'void | undefined'.
    *   }
    * }
    *
    * const sample = new SamplePublisher();
    *
    * sample.on('hoge', (a: number, b: string) => { ... });    // OK. standard usage.
    * sample.on('hoge', (a: number, b: boolean) => { ... });   // NG. types of parameters 'b'
    *                                                          //     and 'args_1' are incompatible.
    * sample.on('hoge', (a) => { ... });                       // OK. all args
    *                                                          //     to be optional automatically.
    * sample.on('hoge', (a, b, c) => { ... });                 // NG. expected 1-2 arguments,
    *                                                          //     but got 3.
    * ```
    */
   class EventPublisher {
       /** constructor */
       constructor() {
           verify('instanceOf', EventPublisher, this);
           _mapListeners.set(this, new Map());
       }
       /**
        * @en Notify event to clients.
        * @ja event 発行
        *
        * @param channel
        *  - `en` event channel key. (string | symbol)
        *  - `ja` イベントチャネルキー (string | symbol)
        * @param args
        *  - `en` arguments for callback function of the `channel` corresponding.
        *  - `ja` `channel` に対応したコールバック関数に渡す引数
        */
       publish(channel, ...args) {
           const map = listeners(this);
           validChannel(channel);
           triggerEvent(map, channel, undefined, ...args);
           // trigger for all handler
           if ('*' !== channel) {
               triggerEvent(map, '*', channel, ...args);
           }
       }
       ///////////////////////////////////////////////////////////////////////
       // implements: Subscribable<Event>
       /**
        * @en Check whether this object has clients.
        * @ja クライアントが存在するか判定
        *
        * @param channel
        *  - `en` event channel key. (string | symbol)
        *  - `ja` イベントチャネルキー (string | symbol)
        * @param listener
        *  - `en` callback function of the `channel` corresponding.
        *  - `ja` `channel` に対応したコールバック関数
        */
       hasListener(channel, listener) {
           const map = listeners(this);
           if (null == channel) {
               return map.size > 0;
           }
           validChannel(channel);
           if (null == listener) {
               return map.has(channel);
           }
           validListener(listener);
           const list = map.get(channel);
           return list ? list.has(listener) : false;
       }
       /**
        * @en Returns registered channel keys.
        * @ja 登録されているチャネルキーを返却
        */
       channels() {
           return [...listeners(this).keys()];
       }
       /**
        * @en Subscrive event(s).
        * @ja イベント購読設定
        *
        * @param channel
        *  - `en` target event channel key. (string | symbol)
        *  - `ja` 対象のイベントチャネルキー (string | symbol)
        * @param listener
        *  - `en` callback function of the `channel` corresponding.
        *  - `ja` `channel` に対応したコールバック関数
        */
       on(channel, listener) {
           const map = listeners(this);
           validListener(listener);
           const channels = isArray(channel) ? channel : [channel];
           for (const ch of channels) {
               validChannel(ch);
               map.has(ch) ? map.get(ch).add(listener) : map.set(ch, new Set([listener])); // eslint-disable-line @typescript-eslint/no-non-null-assertion
           }
           return Object.freeze({
               get enable() {
                   for (const ch of channels) {
                       const list = map.get(ch);
                       if (!list || !list.has(listener)) {
                           this.unsubscribe();
                           return false;
                       }
                   }
                   return true;
               },
               unsubscribe() {
                   for (const ch of channels) {
                       const list = map.get(ch);
                       if (list) {
                           list.delete(listener);
                           list.size > 0 || map.delete(ch);
                       }
                   }
               },
           });
       }
       /**
        * @en Subscrive event(s) but it causes the bound callback to only fire once before being removed.
        * @ja 一度だけハンドリング可能なイベント購読設定
        *
        * @param channel
        *  - `en` target event channel key. (string | symbol)
        *  - `ja` 対象のイベントチャネルキー (string | symbol)
        * @param listener
        *  - `en` callback function of the `channel` corresponding.
        *  - `ja` `channel` に対応したコールバック関数
        */
       once(channel, listener) {
           const context = this.on(channel, listener);
           const managed = this.on(channel, () => {
               context.unsubscribe();
               managed.unsubscribe();
           });
           return context;
       }
       /**
        * @en Unsubscribe event(s).
        * @ja イベント購読解除
        *
        * @param channel
        *  - `en` target event channel key. (string | symbol)
        *         When not set this parameter, everything is released.
        *  - `ja` 対象のイベントチャネルキー (string | symbol)
        *         指定しない場合はすべて解除
        * @param listener
        *  - `en` callback function of the `channel` corresponding.
        *         When not set this parameter, all same `channel` listeners are released.
        *  - `ja` `channel` に対応したコールバック関数
        *         指定しない場合は同一 `channel` すべてを解除
        */
       off(channel, listener) {
           const map = listeners(this);
           if (null == channel) {
               map.clear();
               return this;
           }
           const channels = isArray(channel) ? channel : [channel];
           const callback = validListener(listener);
           for (const ch of channels) {
               validChannel(ch);
               if (null == callback) {
                   map.delete(ch);
                   continue;
               }
               else {
                   const list = map.get(ch);
                   if (list) {
                       list.delete(callback);
                       list.size > 0 || map.delete(ch);
                   }
               }
           }
           return this;
       }
   }

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    , @typescript-eslint/unbound-method
    */
   /**
    * @en Constructor of [[EventBroker]]
    * @ja [[EventBroker]] のコンストラクタ実体
    */
   const EventBroker = EventPublisher;
   EventBroker.prototype.trigger = EventPublisher.prototype.publish;

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   /** @internal */
   const _context = Symbol('context');
   /** @internal register listener context */
   function register(context, target, channel, listener) {
       const subscriptions = [];
       const channels = isArray(channel) ? channel : [channel];
       for (const ch of channels) {
           const s = target.on(ch, listener);
           context.set.add(s);
           subscriptions.push(s);
           const listenerMap = context.map.get(target) || new Map();
           const map = listenerMap.get(ch) || new Map();
           map.set(listener, s);
           if (!listenerMap.has(ch)) {
               listenerMap.set(ch, map);
           }
           if (!context.map.has(target)) {
               context.map.set(target, listenerMap);
           }
       }
       return Object.freeze({
           get enable() {
               for (const s of subscriptions) {
                   if (s.enable) {
                       return true;
                   }
               }
               return false;
           },
           unsubscribe() {
               for (const s of subscriptions) {
                   s.unsubscribe();
               }
           },
       });
   }
   /** @internal unregister listener context */
   function unregister(context, target, channel, listener) {
       if (null != target) {
           target.off(channel, listener);
           const listenerMap = context.map.get(target);
           if (!listenerMap) {
               return;
           }
           if (null != channel) {
               const channels = isArray(channel) ? channel : [channel];
               for (const ch of channels) {
                   const map = listenerMap.get(ch);
                   if (!map) {
                       return;
                   }
                   else if (listener) {
                       const s = map.get(listener);
                       if (s) {
                           s.unsubscribe();
                           context.set.delete(s);
                       }
                       map.delete(listener);
                   }
                   else {
                       for (const s of map.values()) {
                           s.unsubscribe();
                           context.set.delete(s);
                       }
                   }
               }
           }
           else {
               for (const map of listenerMap.values()) {
                   for (const s of map.values()) {
                       s.unsubscribe();
                       context.set.delete(s);
                   }
               }
           }
       }
       else {
           for (const s of context.set) {
               s.unsubscribe();
           }
           context.map = new WeakMap();
           context.set.clear();
       }
   }
   //__________________________________________________________________________________________________//
   /**
    * @en The class to which the safe event register/unregister method is offered for the object which is a short life cycle than subscription target. <br>
    *     The advantage of using this form, instead of `on()`, is that `listenTo()` allows the object to keep track of the events,
    *     and they can be removed all at once later call `stopListening()`.
    * @ja 購読対象よりもライフサイクルが短いオブジェクトに対して, 安全なイベント登録/解除メソッドを提供するクラス <br>
    *     `on()` の代わりに `listenTo()` を使用することで, 後に `stopListening()` を1度呼ぶだけですべてのリスナーを解除できる利点がある.
    *
    * @example <br>
    *
    * ```ts
    * import { EventReceiver, EventBroker } from '@cdp/events';
    *
    * // declare event interface
    * interface SampleEvent {
    *   hoge: [number, string];        // callback function's args type tuple
    *   foo: [void];                   // no args
    *   hoo: void;                     // no args (same the upon)
    *   bar: [Error];                  // any class is available.
    *   baz: Error | Number;           // if only one argument, `[]` is not required.
    * }
    *
    * // declare client class
    * class SampleReceiver extends EventReceiver {
    *   constructor(broker: EventBroker<SampleEvent>) {
    *     super();
    *     this.listenTo(broker, 'hoge', (num: number, str: string) => { ... });
    *     this.listenTo(broker, 'bar', (e: Error) => { ... });
    *     this.listenTo(broker, ['foo', 'hoo'], () => { ... });
    *   }
    *
    *   release(): void {
    *     this.stopListening();
    *   }
    * }
    * ```
    *
    * or
    *
    * ```ts
    * const broker   = new EventBroker<SampleEvent>();
    * const receiver = new EventReceiver();
    *
    * receiver.listenTo(broker, 'hoge', (num: number, str: string) => { ... });
    * receiver.listenTo(broker, 'bar', (e: Error) => { ... });
    * receiver.listenTo(broker, ['foo', 'hoo'], () => { ... });
    *
    * receiver.stopListening();
    * ```
    */
   class EventRevceiver {
       /** constructor */
       constructor() {
           this[_context] = { map: new WeakMap(), set: new Set() };
       }
       /**
        * @en Tell an object to listen to a particular event on an other object.
        * @ja 対象オブジェクトのイベント購読設定
        *
        * @param target
        *  - `en` event listening target object.
        *  - `ja` イベント購読対象のオブジェクト
        * @param channel
        *  - `en` target event channel key. (string | symbol)
        *  - `ja` 対象のイベントチャネルキー (string | symbol)
        * @param listener
        *  - `en` callback function of the `channel` corresponding.
        *  - `ja` `channel` に対応したコールバック関数
        */
       listenTo(target, channel, listener) {
           return register(this[_context], target, channel, listener);
       }
       /**
        * @en Just like listenTo, but causes the bound callback to fire only once before being removed.
        * @ja 対象オブジェクトの一度だけハンドリング可能なイベント購読設定
        *
        * @param target
        *  - `en` event listening target object.
        *  - `ja` イベント購読対象のオブジェクト
        * @param channel
        *  - `en` target event channel key. (string | symbol)
        *  - `ja` 対象のイベントチャネルキー (string | symbol)
        * @param listener
        *  - `en` callback function of the `channel` corresponding.
        *  - `ja` `channel` に対応したコールバック関数
        */
       listenToOnce(target, channel, listener) {
           const context = register(this[_context], target, channel, listener);
           const managed = target.on(channel, () => {
               unregister(this[_context], target, channel, listener);
               managed.unsubscribe();
           });
           return context;
       }
       /**
        * @en Tell an object to stop listening to events.
        * @ja イベント購読解除
        *
        * @param target
        *  - `en` event listening target object.
        *         When not set this parameter, everything is released.
        *  - `ja` イベント購読対象のオブジェクト
        *         指定しない場合はすべてのリスナーを解除
        * @param channel
        *  - `en` target event channel key. (string | symbol)
        *         When not set this parameter, everything is released listeners from `target`.
        *  - `ja` 対象のイベントチャネルキー (string | symbol)
        *         指定しない場合は対象 `target` のリスナーをすべて解除
        * @param listener
        *  - `en` callback function of the `channel` corresponding.
        *         When not set this parameter, all same `channel` listeners are released.
        *  - `ja` `channel` に対応したコールバック関数
        *         指定しない場合は同一 `channel` すべてを解除
        */
       stopListening(target, channel, listener) {
           unregister(this[_context], target, channel, listener);
           return this;
       }
   }

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   /** @internal [[EventSource]] class */
   class EventSource extends mixins(EventBroker, EventRevceiver) {
       constructor() {
           super();
           this.super(EventRevceiver);
       }
   }
   /**
    * @en Constructor of [[EventSource]]
    * @ja [[EventSource]] のコンストラクタ実体
    */
   const EventSourceBase = EventSource;

   /*!
    * @cdp/promise 0.9.0
    *   promise utility module
    */

   /** @internal */
   const _cancel = Symbol('cancel');
   /** @internal */
   const _close = Symbol('close');
   /**
    * @en Invalid subscription object declaration.
    * @ja 無効な Subscription オブジェクト
    *
    * @internal
    */
   const invalidSubscription = Object.freeze({
       enable: false,
       unsubscribe() { }
   });

   /* eslint-disable
      no-redeclare
    , @typescript-eslint/no-explicit-any
    */
   /** @internal */
   const _tokens = new WeakMap();
   /** @internal */
   function getContext(instance) {
       if (!_tokens.has(instance)) {
           throw new TypeError('The object is not a valid CancelToken.');
       }
       return _tokens.get(instance);
   }
   /**
    * @en The token object to which unification processing for asynchronous processing cancellation is offered. <br>
    *     Origin is `CancellationToken` of `.NET Framework`.
    * @ja 非同期処理キャンセルのための統一処理を提供するトークンオブジェクト <br>
    *     オリジナルは `.NET Framework` の `CancellationToken`
    *
    * @see https://docs.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads
    *
    * @example <br>
    *
    * ```ts
    * import { CancelToken } from '@cdp/promise';
    * ```
    *
    * - Basic Usage
    *
    * ```ts
    * const token = new CancelToken((cancel, close) => {
    *   button1.onclick = ev => cancel(new Error('Cancel'));
    *   button2.onclick = ev => close();
    * });
    * ```
    *
    * or
    *
    * ```ts
    * const { cancel, close, token } = CancelToken.source();
    * button1.onclick = ev => cancel(new Error('Cancel'));
    * button2.onclick = ev => close();
    * ```
    *
    * - Use with Promise
    *
    * ```ts
    * const { cancel, close, token } = CancelToken.source();
    * const promise = new Promise((ok, ng) => { ... }, token);
    * promise
    *   .then(...)
    *   .then(...)
    *   .then(...)
    *   .catch(reason => {
    *     // check reason
    *   });
    * ```
    *
    * - Register & Unregister callback(s)
    *
    * ```ts
    * const { cancel, close, token } = CancelToken.source();
    * const subscription = token.register(reason => {
    *   console.log(reason.message);
    * });
    * if (someCase) {
    *   subscription.unsubscribe();
    * }
    * ```
    */
   class CancelToken {
       /**
        * @en Create [[CancelTokenSource]] instance.
        * @ja [[CancelTokenSource]] インスタンスの取得
        *
        * @param linkedTokens
        *  - `en` relating already made [[CancelToken]] instance.
        *        You can attach to the token that to be a cancellation target.
        *  - `ja` すでに作成された [[CancelToken]] 関連付ける場合に指定
        *        渡された token はキャンセル対象として紐づけられる
        */
       static source(...linkedTokens) {
           let cancel;
           let close;
           const token = new CancelToken((onCancel, onClose) => {
               cancel = onCancel;
               close = onClose;
           }, ...linkedTokens);
           return Object.freeze({ token, cancel, close });
       }
       /**
        * constructor
        *
        * @param executor
        *  - `en` executer that has `cancel` and `close` callback.
        *  - `ja` キャンセル/クローズ 実行コールバックを指定
        * @param linkedTokens
        *  - `en` relating already made [[CancelToken]] instance.
        *        You can attach to the token that to be a cancellation target.
        *  - `ja` すでに作成された [[CancelToken]] 関連付ける場合に指定
        *        渡された token はキャンセル対象として紐づけられる
        */
       constructor(executor, ...linkedTokens) {
           verify('instanceOf', CancelToken, this);
           verify('typeOf', 'function', executor);
           const linkedTokenSet = new Set(linkedTokens.filter(t => _tokens.has(t)));
           let status = 0 /* OPEN */;
           for (const t of linkedTokenSet) {
               status |= getContext(t).status;
           }
           const context = {
               broker: new EventBroker(),
               subscriptions: new Set(),
               reason: undefined,
               status,
           };
           _tokens.set(this, Object.seal(context));
           const cancel = this[_cancel];
           const close = this[_close];
           if (status === 0 /* OPEN */) {
               for (const t of linkedTokenSet) {
                   context.subscriptions.add(t.register(cancel.bind(this)));
                   this.register(cancel.bind(t));
               }
           }
           executor(cancel.bind(this), close.bind(this));
       }
       /**
        * @en Cancellation reason accessor.
        * @ja キャンセルの原因取得
        */
       get reason() {
           return getContext(this).reason;
       }
       /**
        * @en Enable cancellation state accessor.
        * @ja キャンセル可能か判定
        */
       get cancelable() {
           return getContext(this).status === 0 /* OPEN */;
       }
       /**
        * @en Cancellation requested state accessor.
        * @ja キャンセルを受け付けているか判定
        */
       get requested() {
           return !!(getContext(this).status & 1 /* REQUESTED */);
       }
       /**
        * @en Cancellation closed state accessor.
        * @ja キャンセル受付を終了しているか判定
        */
       get closed() {
           return !!(getContext(this).status & 2 /* CLOSED */);
       }
       /**
        * @en `toString` tag override.
        * @ja `toString` タグのオーバーライド
        */
       get [Symbol.toStringTag]() { return 'CancelToken'; }
       /**
        * @en Register custom cancellation callback.
        * @ja キャンセル時のカスタム処理の登録
        *
        * @param onCancel
        *  - `en` cancel operation callback
        *  - `ja` キャンセルコールバック
        * @returns
        *  - `en` `Subscription` instance.
        *        You can revoke cancellation to call `unsubscribe` method.
        *  - `ja` `Subscription` インスタンス
        *        `unsubscribe` メソッドを呼ぶことでキャンセルを無効にすることが可能
        */
       register(onCancel) {
           const context = getContext(this);
           if (!this.cancelable) {
               return invalidSubscription;
           }
           return context.broker.on('cancel', onCancel);
       }
       /** @internal */
       [_cancel](reason) {
           const context = getContext(this);
           verify('notNil', reason);
           if (!this.cancelable) {
               return;
           }
           context.reason = reason;
           context.status |= 1 /* REQUESTED */;
           for (const s of context.subscriptions) {
               s.unsubscribe();
           }
           context.broker.trigger('cancel', reason);
           Promise.resolve().then(() => this[_close]());
       }
       /** @internal */
       [_close]() {
           const context = getContext(this);
           if (this.closed) {
               return;
           }
           context.status |= 2 /* CLOSED */;
           for (const s of context.subscriptions) {
               s.unsubscribe();
           }
           context.subscriptions.clear();
           context.broker.off();
       }
   }

   /* eslint-disable
      no-global-assign
    , @typescript-eslint/no-explicit-any
    */
   /** `Native Promise` constructor */
   const NativePromise = Promise;
   /** @internal */
   const _create = Symbol('create');
   /** @internal */
   const _tokens$1 = new WeakMap();
   /**
    * @en Extended `Promise` class which enabled cancellation. <br>
    *     `Native Promise` constructor is overridden by framework default behaviour.
    * @ja キャンセルを可能にした `Promise` 拡張クラス <br>
    *     既定で `Native Promise` をオーバーライドする.
    */
   class CancelablePromise extends NativePromise {
       /**
        * @en Overriding of the default constructor used for generation of an object.
        * @ja オブジェクトの生成に使われるデフォルトコンストラクタのオーバーライド
        *
        * @internal
        */
       static get [Symbol.species]() { return NativePromise; }
       /**
        * @en Creates a new resolved promise for the provided value.
        * @ja 新規に解決済み promise インスタンスを作成
        *
        * @internal
        *
        * @param value
        *  - `en` the value transmitted in promise chain.
        *  - `ja` `Promise` に伝達する値
        * @param cancelToken
        *  - `en` [[CancelToken]] instance create from [[CancelToken]].`source()`.
        *  - `ja` [[CancelToken]].`source()` より作成した [[CancelToken]] インスタンスを指定
        */
       static resolve(value, cancelToken) {
           return this[_create](super.resolve(value), cancelToken);
       }
       /** @internal private construction */
       static [_create](src, token, thenArgs) {
           verify('instanceOf', NativePromise, src);
           let p;
           if (!(token instanceof CancelToken)) {
               p = src;
           }
           else if (thenArgs && (!isFunction(thenArgs[0]) || isFunction(thenArgs[1]))) {
               p = src;
           }
           else if (token.cancelable) {
               let s;
               p = new NativePromise((resolve, reject) => {
                   s = token.register(reject);
                   super.prototype.then.call(src, resolve, reject);
               });
               const dispose = () => {
                   s.unsubscribe();
                   _tokens$1.delete(p);
               };
               p.then(dispose, dispose);
           }
           else if (token.requested) {
               p = super.reject(token.reason);
           }
           else if (token.closed) {
               p = src;
           }
           else {
               throw new Error('Unexpected Exception');
           }
           if (thenArgs) {
               p = super.prototype.then.apply(p, thenArgs);
           }
           if (token && token.cancelable) {
               _tokens$1.set(p, token);
           }
           p instanceof this || Object.setPrototypeOf(p, this.prototype);
           return p;
       }
       /**
        * constructor
        *
        * @param executor
        *  - `en` A callback used to initialize the promise. This callback is passed two arguments `resolve` and `reject`.
        *  - `ja` promise の初期化に使用するコールバックを指定. `resolve` と `reject` の2つの引数を持つ
        * @param cancelToken
        *  - `en` [[CancelToken]] instance create from [[CancelToken]].`source()`.
        *  - `ja` [[CancelToken]].`source()` より作成した [[CancelToken]] インスタンスを指定
        */
       constructor(executor, cancelToken) {
           super(executor);
           return CancelablePromise[_create](this, cancelToken);
       }
       /**
        * Attaches callbacks for the resolution and/or rejection of the Promise.
        *
        * @internal
        *
        * @param onfulfilled The callback to execute when the Promise is resolved.
        * @param onrejected The callback to execute when the Promise is rejected.
        * @returns A Promise for the completion of which ever callback is executed.
        */
       then(onfulfilled, onrejected) {
           return CancelablePromise[_create](this, _tokens$1.get(this), [onfulfilled, onrejected]);
       }
       /**
        * Attaches a callback for only the rejection of the Promise.
        *
        * @internal
        *
        * @param onrejected The callback to execute when the Promise is rejected.
        * @returns A Promise for the completion of the callback.
        */
       catch(onrejected) {
           return this.then(undefined, onrejected);
       }
       /**
        * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). <br>
        * The resolved value cannot be modified from the callback.
        *
        * @internal
        *
        * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
        * @returns A Promise for the completion of the callback.
        */
       finally(onfinally) {
           return CancelablePromise[_create](super.finally(onfinally), _tokens$1.get(this));
       }
   }
   /**
    * @en Switch the global `Promise` constructor `Native Promise` or [[CancelablePromise]]. <br>
    *     `Native Promise` constructor is overridden by framework default behaviour.
    * @ja グローバル `Promise` コンストラクタを `Native Promise` または [[CancelablePromise]] に切り替え <br>
    *     既定で `Native Promise` をオーバーライドする.
    *
    * @param enable
    *  - `en` `true`: use [[CancelablePromise]] /  `false`: use `Native Promise`
    *  - `ja` `true`: [[CancelablePromise]] を使用 / `false`: `Native Promise` を使用
    */
   function extendPromise(enable) {
       if (enable) {
           Promise = CancelablePromise;
       }
       else {
           Promise = NativePromise;
       }
       return Promise;
   }
   // default: automatic native promise override.
   extendPromise(!getConfig().noAutomaticNativeExtend);

   /* eslint-disable
      @typescript-eslint/explicit-function-return-type
    */
   //__________________________________________________________________________________________________//
   /**
    * @en Wait for promises done. <br>
    *     While control will be returned immediately when `Promise.all()` fails, but this mehtod waits for including failure.
    * @ja `Promise` オブジェクトの終了まで待機 <br>
    *     `Promise.all()` は失敗するとすぐに制御を返すのに対し、失敗も含めて待つ `Promise` オブジェクトを返却
    *
    * @param promises
    *  - `en` Promise instance array
    *  - `ja` Promise インスタンスの配列を指定
    */
   function wait(promises) {
       const safePromises = promises.map((promise) => promise.catch((e) => e));
       return Promise.all(safePromises);
   }
   /**
    * @en Cancellation checker method. <br>
    *     It's practicable by `async function`.
    * @ja キャンセルチェッカー <br>
    *     `async function` で使用可能
    *
    * @example <br>
    *
    * ```ts
    *  async function someFunc(token: CancelToken): Promise<{}> {
    *    await checkCanceled(token);
    *    return {};
    *  }
    * ```
    *
    * @param token
    *  - `en` [[CancelToken]] reference. (enable `undefined`)
    *  - `ja` [[CancelToken]] を指定 (undefined 可)
    */
   function checkCanceled(token) {
       return Promise.resolve(undefined, token);
   }
   //__________________________________________________________________________________________________//
   /**
    * @en The class manages lumping multiple `Promise` objects. <br>
    *     It's possible to make them cancel more than one `Promise` which handles different [[CancelToken]] by lumping.
    * @ja 複数 `Promise` オブジェクトを一括管理するクラス <br>
    *     異なる [[CancelToken]] を扱う複数の `Promise` を一括でキャンセルさせることが可能
    */
   class PromiseManager {
       constructor() {
           // eslint-disable-next-line func-call-spacing
           this._pool = new Map();
       }
       /**
        * @en Add a `Promise` object under the management.
        * @ja `Promise` オブジェクトを管理下に追加
        *
        * @param promise
        *  - `en` any `Promise` instance is available.
        *  - `ja` 任意の `Promise` インスタンス
        * @param cancelSource
        *  - `en` [[CancelTokenSource]] instance made by `CancelToken.source()`.
        *  - `ja` `CancelToken.source()` で生成される [[CancelTokenSource]] インスタンス
        * @returns
        *  - `en` return the same instance of input `promise` instance.
        *  - `ja` 入力した `promise` と同一インスタンスを返却
        */
       add(promise, cancelSource) {
           this._pool.set(promise, cancelSource && cancelSource.cancel); // eslint-disable-line @typescript-eslint/unbound-method
           const always = () => {
               this._pool.delete(promise);
               if (cancelSource) {
                   cancelSource.close();
               }
           };
           promise
               .then(always, always);
           return promise;
       }
       /**
        * @en Released all instances under the management.
        * @ja 管理対象を破棄
        */
       release() {
           this._pool.clear();
       }
       /**
        * @en Return `promise` array from under the management.
        * @ja 管理対象の Promise を配列で取得
        */
       promises() {
           return [...this._pool.keys()];
       }
       /**
        * @en Call `Promise.all()` for under the management.
        * @ja 管理対象に対して `Promise.all()`
        */
       all() {
           return Promise.all(this.promises());
       }
       /**
        * @en Call `Promise.race()` for under the management.
        * @ja 管理対象に対して `Promise.race()`
        */
       race() {
           return Promise.race(this.promises());
       }
       /**
        * @en Call [[wait]]() for under the management.
        * @ja 管理対象に対して [[wait]]()
        */
       wait() {
           return wait(this.promises());
       }
       /**
        * @en Invoke `cancel` message for under the management promises.
        * @ja 管理対象の `Promise` に対してキャンセルを発行
        *
        * @param reason
        *  - `en` arguments for `cancelSource`
        *  - `ja` `cancelSource` に渡される引数
        * @returns
        *  - `en` `Promise` instance which wait by until cancellation completion.
        *  - `ja` キャンセル完了まで待機する [[Promise]] インスタンス
        */
       abort(reason) {
           for (const canceler of this._pool.values()) {
               if (canceler) {
                   canceler((null != reason) ? reason : new Error('abort'));
               }
           }
           return wait(this.promises());
       }
   }

   /*!
    * @cdp/observable 0.9.0
    *   observable utility module
    */

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   /** @internal EventBrokerProxy */
   class EventBrokerProxy {
       get() {
           return this._broker || (this._broker = new EventBroker());
       }
   }
   /** @internal */
   const _internal = Symbol('internal');
   /** @internal */
   const _notify = Symbol('notify');
   /** @internal */
   const _stockChange = Symbol('stock-change');
   /** @internal */
   const _notifyChanges = Symbol('notify-changes');
   /** @internal */
   function verifyObservable(x) {
       if (!x || !x[_internal]) {
           throw new TypeError(`The object passed is not an IObservable.`);
       }
   }

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   /**
    * @en Check the value-type is [[IObservable]].
    * @ja [[IObservable]] 型であるか判定
    *
    * @param x
    *  - `en` evaluated value
    *  - `ja` 評価する値
    */
   function isObservable(x) {
       return Boolean(x && x[_internal]);
   }

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   /** @internal */
   const _proxyHandler = {
       set(target, p, value, receiver) {
           if (!isString(p)) {
               return Reflect.set(target, p, value, receiver);
           }
           const oldValue = target[p];
           if ("disabled" /* DISABLED */ !== target[_internal].state && value !== oldValue) {
               target[_stockChange](p, oldValue);
           }
           return Reflect.set(target, p, value, receiver);
       },
   };
   Object.freeze(_proxyHandler);
   //__________________________________________________________________________________________________//
   /**
    * @en The object class which change can be observed.
    * @ja オブジェクトの変更を監視できるオブジェクトクラス
    *
    * @example <br>
    *
    * - Basic Usage
    *
    * ```ts
    * class Example extends ObservableObject {
    *   public a: number = 0;
    *   public b: number = 0;
    *   public get sum(): number {
    *       return this.a + this.b;
    *   }
    * }
    *
    * const observable = new Example();
    *
    * function onNumChange(newValue: number, oldValue: number, key: string) {
    *   console.log(`${key} changed from ${oldValue} to ${newValue}.`);
    * }
    * observable.on(['a', 'b'], onNumChange);
    *
    * // update
    * observable.a = 100;
    * observable.b = 200;
    *
    * // console out from `async` event loop.
    * // => 'a changed from 0 to 100.'
    * // => 'b changed from 0 to 200.'
    *
    * :
    *
    * function onSumChange(newValue: number, oldValue: number) {
    *   console.log(`sum changed from ${oldValue} to ${newVaue}.`);
    * }
    * observable.on('sum', onSumChange);
    *
    * // update
    * observable.a = 100; // nothing reaction because of no change properties.
    * observable.a = 200;
    *
    * // console out from `async` event loop.
    * // => 'sum changed from 300 to 400.'
    * ```
    */
   class ObservableObject {
       /**
        * constructor
        *
        * @param state
        *  - `en` initial state. default: [[ObservableState.ACTIVE]]
        *  - `ja` 初期状態 既定: [[ObservableState.ACTIVE]]
        */
       constructor(state = "active" /* ACTIVE */) {
           verify('instanceOf', ObservableObject, this);
           const internal = {
               state,
               changed: false,
               changeMap: new Map(),
               broker: new EventBrokerProxy(),
           };
           Object.defineProperty(this, _internal, { value: Object.seal(internal) });
           return new Proxy(this, _proxyHandler);
       }
       on(property, listener) {
           verifyObservable(this);
           const { changeMap, broker } = this[_internal];
           const result = broker.get().on(property, listener);
           if (0 < changeMap.size) {
               const props = isArray(property) ? property : [property];
               for (const prop of props) {
                   changeMap.has(prop) || changeMap.set(prop, this[prop]);
               }
           }
           return result;
       }
       off(property, listener) {
           verifyObservable(this);
           this[_internal].broker.get().off(property, listener);
       }
       /**
        * @en Suspend or disable the event observation state.
        * @ja イベント購読状態のサスペンド
        *
        * @param noRecord
        *  - `en` `true`: not recording property changes and clear changes. / `false`: property changes are recorded and fired when [[resume]]() callded. (default)
        *  - `ja` `true`: プロパティ変更も記録せず, 現在の記録も破棄 / `false`: プロパティ変更は記録され, [[resume]]() 時に発火する (既定)
        */
       suspend(noRecord = false) {
           verifyObservable(this);
           this[_internal].state = noRecord ? "disabled" /* DISABLED */ : "suspended" /* SUSEPNDED */;
           if (noRecord) {
               this[_internal].changeMap.clear();
           }
           return this;
       }
       /**
        * @en Resume the event observation state.
        * @ja イベント購読状態のリジューム
        */
       resume() {
           verifyObservable(this);
           const internal = this[_internal];
           if ("active" /* ACTIVE */ !== internal.state) {
               internal.state = "active" /* ACTIVE */;
               post(() => this[_notifyChanges]());
           }
           return this;
       }
       /**
        * @en observation state
        * @ja 購読可能状態
        */
       getObservableState() {
           verifyObservable(this);
           return this[_internal].state;
       }
       ///////////////////////////////////////////////////////////////////////
       // implements: IObservableEventBrokerAccess
       /** @internal */
       getBroker() {
           const { broker } = this[_internal];
           return broker.get();
       }
       ///////////////////////////////////////////////////////////////////////
       // static methods:
       /**
        * @en Create [[ObservableObject]] from any object.
        * @ja 任意のオブジェクトから [[ObservableObject]] を生成
        *
        * @example <br>
        *
        * ```ts
        * const observable = ObservableObject.from({ a: 1, b: 1 });
        * function onNumChange(newValue: number, oldValue: number, key: string) {
        *   console.log(`${key} changed from ${oldValue} to ${newValue}.`);
        * }
        * observable.on(['a', 'b'], onNumChange);
        *
        * // update
        * observable.a = 100;
        * observable.b = 200;
        *
        * // console out from `async` event loop.
        * // => 'a changed from 1 to 100.'
        * // => 'b changed from 1 to 200.'
        * ```
        */
       static from(src) {
           const observable = deepMerge(new class extends ObservableObject {
           }("disabled" /* DISABLED */), src);
           observable.resume();
           return observable;
       }
       ///////////////////////////////////////////////////////////////////////
       // protected mehtods:
       /**
        * @en Force notify property change(s) in spite of active state.
        * @ja アクティブ状態にかかわらず強制的にプロパティ変更通知を発行
        */
       notify(...properties) {
           verifyObservable(this);
           if (0 === properties.length) {
               return;
           }
           const { changeMap } = this[_internal];
           const keyValue = new Map();
           for (const key of properties) {
               const newValue = this[key];
               const oldValue = changeMap.has(key) ? changeMap.get(key) : newValue;
               keyValue.set(key, [newValue, oldValue]);
           }
           0 < keyValue.size && this[_notify](keyValue);
       }
       ///////////////////////////////////////////////////////////////////////
       // private mehtods:
       /** @internal */
       [_stockChange](p, oldValue) {
           const { state, changeMap, broker } = this[_internal];
           this[_internal].changed = true;
           if (0 === changeMap.size) {
               changeMap.set(p, oldValue);
               for (const k of broker.get().channels()) {
                   changeMap.has(k) || changeMap.set(k, this[k]);
               }
               if ("active" /* ACTIVE */ === state) {
                   post(() => this[_notifyChanges]());
               }
           }
           else {
               changeMap.has(p) || changeMap.set(p, oldValue);
           }
       }
       /** @internal */
       [_notifyChanges]() {
           const { state, changeMap } = this[_internal];
           if ("active" /* ACTIVE */ !== state) {
               return;
           }
           const keyValuePairs = new Map();
           for (const [key, oldValue] of changeMap) {
               const curValue = this[key];
               if (!deepEqual(oldValue, curValue)) {
                   keyValuePairs.set(key, [curValue, oldValue]);
               }
           }
           this[_notify](keyValuePairs);
       }
       /** @internal */
       [_notify](keyValue) {
           const { changed, changeMap, broker } = this[_internal];
           changeMap.clear();
           this[_internal].changed = false;
           const eventBroker = broker.get();
           for (const [key, values] of keyValue) {
               eventBroker.trigger(key, ...values, key);
           }
           if (changed) {
               eventBroker.trigger('@', this);
           }
       }
   }

   /* eslint-disable
      prefer-rest-params
    , @typescript-eslint/no-explicit-any
    */
   /** @internal */
   const _proxyHandler$1 = {
       defineProperty(target, p, attributes) {
           const internal = target[_internal];
           if ("disabled" /* DISABLED */ === internal.state || internal.byMethod || !Object.prototype.hasOwnProperty.call(attributes, 'value')) {
               return Reflect.defineProperty(target, p, attributes);
           }
           const oldValue = target[p];
           const newValue = attributes.value;
           // eslint-disable-next-line eqeqeq
           if ('length' === p && newValue != oldValue) { // Do NOT use strict inequality (!==)
               const oldLength = oldValue >>> 0;
               const newLength = newValue >>> 0;
               const stock = () => {
                   const scrap = newLength < oldLength && target.slice(newLength);
                   if (scrap) { // newLength < oldLength
                       for (let i = oldLength; --i >= newLength;) {
                           target[_stockChange](-1 /* REMOVE */, i, undefined, scrap[i - newLength]);
                       }
                   }
                   else { // oldLength < newLength
                       for (let i = oldLength; i < newLength; i++) {
                           target[_stockChange](1 /* INSERT */, i /*, undefined, undefined */);
                       }
                   }
               };
               const result = Reflect.defineProperty(target, p, attributes);
               result && stock();
               return result;
           }
           else if (newValue !== oldValue && isValidArrayIndex(p)) {
               const i = p >>> 0;
               const type = Number(i >= target.length); // INSERT or UPDATE
               const result = Reflect.defineProperty(target, p, attributes);
               result && target[_stockChange](type, i, newValue, oldValue);
               return result;
           }
           else {
               return Reflect.defineProperty(target, p, attributes);
           }
       },
       deleteProperty(target, p) {
           const internal = target[_internal];
           if ("disabled" /* DISABLED */ === internal.state || internal.byMethod || !Object.prototype.hasOwnProperty.call(target, p)) {
               return Reflect.deleteProperty(target, p);
           }
           const oldValue = target[p];
           const result = Reflect.deleteProperty(target, p);
           result && isValidArrayIndex(p) && target[_stockChange](0 /* UPDATE */, p >>> 0, undefined, oldValue);
           return result;
       },
   };
   Object.freeze(_proxyHandler$1);
   /** @internal valid array index helper */
   function isValidArrayIndex(index) {
       const s = String(index);
       const n = Math.trunc(s);
       return String(n) === s && 0 <= n && n < 0xFFFFFFFF;
   }
   /** @internal helper for index management */
   function findRelatedChangeIndex(records, type, index) {
       const checkType = type === 1 /* INSERT */
           ? (t) => t === -1 /* REMOVE */
           : (t) => t !== -1 /* REMOVE */;
       for (let i = records.length; --i >= 0;) {
           const value = records[i];
           if (value.index === index && checkType(value.type)) {
               return i;
           }
           else if (value.index < index && Boolean(value.type)) { // REMOVE or INSERT
               index -= value.type;
           }
       }
       return -1;
   }
   //__________________________________________________________________________________________________//
   /**
    * @en The array class which change can be observed.
    * @ja 変更監視可能な配列クラス
    *
    * @example <br>
    *
    * - Basic Usage
    *
    * ```ts
    * const obsArray = ObservableArray.from(['a', 'b', 'c']);
    *
    * function onChangeArray(records: ArrayChangeRecord[]) {
    *   console.log(records);
    *   //  [
    *   //    { type: 1, index: 3, newValue: 'x', oldValue: undefined },
    *   //    { type: 1, index: 4, newValue: 'y', oldValue: undefined },
    *   //    { type: 1, index: 5, newValue: 'z', oldValue: undefined }
    *   //  ]
    * }
    * obsArray.on(onChangeArray);
    *
    * function addXYZ() {
    *   obsArray.push('x', 'y', 'z');
    * }
    * ```
    */
   class ObservableArray extends Array {
       /** @final constructor */
       constructor() {
           super(...arguments);
           verify('instanceOf', ObservableArray, this);
           const internal = {
               state: "active" /* ACTIVE */,
               byMethod: false,
               records: [],
               indexes: new Set(),
               broker: new EventBrokerProxy(),
           };
           Object.defineProperty(this, _internal, { value: Object.seal(internal) });
           const argLength = arguments.length;
           if (1 === argLength && isNumber(arguments[0])) {
               const len = arguments[0] >>> 0;
               for (let i = 0; i < len; i++) {
                   this[_stockChange](1 /* INSERT */, i /*, undefined */);
               }
           }
           else if (0 < argLength) {
               for (let i = 0; i < argLength; i++) {
                   this[_stockChange](1 /* INSERT */, i, arguments[i]);
               }
           }
           return new Proxy(this, _proxyHandler$1);
       }
       ///////////////////////////////////////////////////////////////////////
       // implements: IObservable
       /**
        * @en Subscrive array change(s).
        * @ja 配列変更購読設定
        *
        * @param listener
        *  - `en` callback function of the array change.
        *  - `ja` 配列変更通知コールバック関数
        */
       on(listener) {
           verifyObservable(this);
           return this[_internal].broker.get().on('@', listener);
       }
       /**
        * @en Unsubscribe array change(s).
        * @ja 配列変更購読解除
        *
        * @param listener
        *  - `en` callback function of the array change.
        *         When not set this parameter, all same `channel` listeners are released.
        *  - `ja` 配列変更通知コールバック関数
        *         指定しない場合は同一 `channel` すべてを解除
        */
       off(listener) {
           verifyObservable(this);
           this[_internal].broker.get().off('@', listener);
       }
       /**
        * @en Suspend or disable the event observation state.
        * @ja イベント購読状態のサスペンド
        *
        * @param noRecord
        *  - `en` `true`: not recording property changes and clear changes. / `false`: property changes are recorded and fired when [[resume]]() callded. (default)
        *  - `ja` `true`: プロパティ変更も記録せず, 現在の記録も破棄 / `false`: プロパティ変更は記録され, [[resume]]() 時に発火する (既定)
        */
       suspend(noRecord = false) {
           verifyObservable(this);
           this[_internal].state = noRecord ? "disabled" /* DISABLED */ : "suspended" /* SUSEPNDED */;
           if (noRecord) {
               this[_internal].records = [];
           }
           return this;
       }
       /**
        * @en Resume of the event subscription state.
        * @ja イベント購読状態のリジューム
        */
       resume() {
           verifyObservable(this);
           const internal = this[_internal];
           if ("active" /* ACTIVE */ !== internal.state) {
               internal.state = "active" /* ACTIVE */;
               post(() => this[_notifyChanges]());
           }
           return this;
       }
       /**
        * @en observation state
        * @ja 購読可能状態
        */
       getObservableState() {
           verifyObservable(this);
           return this[_internal].state;
       }
       ///////////////////////////////////////////////////////////////////////
       // override: Array methods
       /**
        * Sorts an array.
        * @param compareFn The name of the function used to determine the order of the elements. If omitted, the elements are sorted in ascending, ASCII character order.
        */
       sort(comparator) {
           verifyObservable(this);
           const internal = this[_internal];
           const old = Array.from(this);
           internal.byMethod = true;
           const result = super.sort(comparator);
           internal.byMethod = false;
           if ("disabled" /* DISABLED */ !== internal.state) {
               const len = old.length;
               for (let i = 0; i < len; i++) {
                   const oldValue = old[i];
                   const newValue = this[i];
                   if (newValue !== oldValue) {
                       this[_stockChange](0 /* UPDATE */, i, newValue, oldValue);
                   }
               }
           }
           return result;
       }
       splice(start, deleteCount, ...items) {
           verifyObservable(this);
           const internal = this[_internal];
           const oldLen = this.length;
           internal.byMethod = true;
           const result = super.splice(...arguments);
           internal.byMethod = false;
           if ("disabled" /* DISABLED */ !== internal.state) {
               start = Math.trunc(start);
               const from = start < 0 ? Math.max(oldLen + start, 0) : Math.min(start, oldLen);
               for (let i = result.length; --i >= 0;) {
                   this[_stockChange](-1 /* REMOVE */, from + i, undefined, result[i]);
               }
               const len = items.length;
               for (let i = 0; i < len; i++) {
                   this[_stockChange](1 /* INSERT */, from + i, items[i]);
               }
           }
           return result;
       }
       /**
        * Removes the first element from an array and returns it.
        */
       shift() {
           verifyObservable(this);
           const internal = this[_internal];
           const oldLen = this.length;
           internal.byMethod = true;
           const result = super.shift();
           internal.byMethod = false;
           if ("disabled" /* DISABLED */ !== internal.state && this.length < oldLen) {
               this[_stockChange](-1 /* REMOVE */, 0, undefined, result);
           }
           return result;
       }
       /**
        * Inserts new elements at the start of an array.
        * @param items  Elements to insert at the start of the Array.
        */
       unshift(...items) {
           verifyObservable(this);
           const internal = this[_internal];
           internal.byMethod = true;
           const result = super.unshift(...items);
           internal.byMethod = false;
           if ("disabled" /* DISABLED */ !== internal.state) {
               const len = items.length;
               for (let i = 0; i < len; i++) {
                   this[_stockChange](1 /* INSERT */, i, items[i]);
               }
           }
           return result;
       }
       /**
        * Calls a defined callback function on each element of an array, and returns an array that contains the results.
        * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
        * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
        */
       map(callbackfn, thisArg) {
           /*
            * [NOTE] original implement is very very high-cost.
            *        so it's converted native Array once, and restored.
            *
            * return (super.map as any)(...arguments);
            */
           return ObservableArray.from([...this].map(callbackfn, thisArg));
       }
       ///////////////////////////////////////////////////////////////////////
       // implements: IObservableEventBrokerAccess
       /** @internal */
       getBroker() {
           const { broker } = this[_internal];
           return broker.get();
       }
       ///////////////////////////////////////////////////////////////////////
       // private mehtods:
       /** @internal */
       [_stockChange](type, index, newValue, oldValue) {
           const { state, indexes, records } = this[_internal];
           const rci = indexes.has(index) ? findRelatedChangeIndex(records, type, index) : -1;
           const len = records.length;
           if (rci >= 0) {
               const rct = records[rci].type;
               if (!rct /* UPDATE */) {
                   const prevRecord = records.splice(rci, 1)[0];
                   // UPDATE => UPDATE : UPDATE
                   // UPDATE => REMOVE : INSERT
                   this[_stockChange](type, index, newValue, prevRecord.oldValue);
               }
               else {
                   for (let r, i = len; --i > rci;) {
                       r = records[i];
                       (r.index >= index) && (r.index -= rct);
                   }
                   const prevRecord = records.splice(rci, 1)[0];
                   if (type !== -1 /* REMOVE */) {
                       // INSERT => UPDATE : INSERT
                       // REMOVE => INSERT : UPDATE
                       this[_stockChange](Number(!type), index, newValue, prevRecord.oldValue);
                   }
               }
               return;
           }
           indexes.add(index);
           records[len] = { type, index, newValue, oldValue };
           if ("active" /* ACTIVE */ === state && 0 === len) {
               post(() => this[_notifyChanges]());
           }
       }
       /** @internal */
       [_notifyChanges]() {
           const { state, records } = this[_internal];
           if ("active" /* ACTIVE */ !== state || 0 === records.length) {
               return;
           }
           for (const r of records) {
               Object.freeze(r);
           }
           this[_notify](Object.freeze(records));
           this[_internal].records = [];
       }
       /** @internal */
       [_notify](records) {
           const internal = this[_internal];
           internal.indexes.clear();
           internal.broker.get().trigger('@', records);
       }
   }

   /*!
    * @cdp/result 0.9.0
    *   result utility module
    */

   /* eslint-disable
      no-inner-declarations
    , @typescript-eslint/no-namespace
    , @typescript-eslint/no-unused-vars
    */
   /*
    * NOTE: 内部モジュールに `CDP` namespace を使用してしまうと, 外部モジュールでは宣言できなくなる.
    * https://github.com/Microsoft/TypeScript/issues/9611
    */
   globalThis.CDP_DECLARE = globalThis.CDP_DECLARE || {};
   (function () {
       /**
        * @en Common result code for the application.
        * @ja アプリケーション全体で使用する共通エラーコード定義
        */
       let RESULT_CODE;
       (function (RESULT_CODE) {
           /** `en` general success code             <br> `ja` 汎用成功コード                       */
           RESULT_CODE[RESULT_CODE["SUCCESS"] = 0] = "SUCCESS";
           /** `en` general cancel code              <br> `ja` 汎用キャンセルコード                 */
           RESULT_CODE[RESULT_CODE["ABORT"] = 1] = "ABORT";
           /** `en` general pending code             <br> `ja` 汎用オペレーション未実行エラーコード */
           RESULT_CODE[RESULT_CODE["PENDING"] = 2] = "PENDING";
           /** `en` general success but noop code    <br> `ja` 汎用実行不要コード                   */
           RESULT_CODE[RESULT_CODE["NOOP"] = 3] = "NOOP";
           /** `en` general error code               <br> `ja` 汎用エラーコード                     */
           RESULT_CODE[RESULT_CODE["FAIL"] = -1] = "FAIL";
           /** `en` general fatal error code         <br> `ja` 汎用致命的エラーコード               */
           RESULT_CODE[RESULT_CODE["FATAL"] = -2] = "FATAL";
           /** `en` general not supported error code <br> `ja` 汎用オペレーションエラーコード       */
           RESULT_CODE[RESULT_CODE["NOT_SUPPORTED"] = -3] = "NOT_SUPPORTED";
       })(RESULT_CODE = CDP_DECLARE.RESULT_CODE || (CDP_DECLARE.RESULT_CODE = {}));
       /**
        * @en Assign declared [[RESULT_CODE]] to root enumeration.
        *     (It's enable to merge enum in the module system environment.)
        * @ja 拡張した [[RESULT_CODE]] を ルート enum にアサイン
        *     モジュールシステム環境においても、enum をマージを可能にする
        */
       function ASSIGN_RESULT_CODE(extend) {
           Object.assign(RESULT_CODE, extend);
       }
       CDP_DECLARE.ASSIGN_RESULT_CODE = ASSIGN_RESULT_CODE;
       /** @internal */
       const _code2message = {
           '0': 'operation succeeded.',
           '1': 'operation aborted.',
           '2': 'operation pending.',
           '3': 'no operation.',
           '-1': 'operation failed.',
           '-2': 'unexpected error occured.',
           '-3': 'operation not supported.',
       };
       /**
        * @en Access to error message map.
        * @ja エラーメッセージマップの取得
        *
        * @internal
        */
       function ERROR_MESSAGE_MAP() {
           return _code2message;
       }
       CDP_DECLARE.ERROR_MESSAGE_MAP = ERROR_MESSAGE_MAP;
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
       function DECLARE_SUCCESS_CODE(base, code, message) {
           return declareResultCode(base, code, message, true);
       }
       CDP_DECLARE.DECLARE_SUCCESS_CODE = DECLARE_SUCCESS_CODE;
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
       function DECLARE_ERROR_CODE(base, code, message) {
           return declareResultCode(base, code, message, false);
       }
       CDP_DECLARE.DECLARE_ERROR_CODE = DECLARE_ERROR_CODE;
       ///////////////////////////////////////////////////////////////////////
       // private section:
       /** @internal register for [[RESULT_CODE]] */
       function declareResultCode(base, code, message, succeeded) {
           if (code < 0 || 1000 /* MAX */ <= code) {
               throw new RangeError(`declareResultCode(), invalid local-code range. [code: ${code}]`);
           }
           const signed = succeeded ? 1 : -1;
           const resultCode = signed * (base + code);
           _code2message[resultCode] = message ? message : (`[CODE: ${resultCode}]`);
           return resultCode;
       }
   })();

   var RESULT_CODE = CDP_DECLARE.RESULT_CODE;
   var DECLARE_SUCCESS_CODE = CDP_DECLARE.DECLARE_SUCCESS_CODE;
   var DECLARE_ERROR_CODE = CDP_DECLARE.DECLARE_ERROR_CODE;
   var ASSIGN_RESULT_CODE = CDP_DECLARE.ASSIGN_RESULT_CODE;
   var ERROR_MESSAGE_MAP = CDP_DECLARE.ERROR_MESSAGE_MAP;
   /**
    * @en Judge fail or not.
    * @ja 失敗判定
    *
    * @param code [[RESULT_CODE]]
    * @returns true: fail result / false: success result
    */
   function FAILED(code) {
       return code < 0;
   }
   /**
    * @en Judge success or not.
    * @ja 成功判定
    *
    * @param code [[RESULT_CODE]]
    * @returns true: success result / false: fail result
    */
   function SUCCEEDED(code) {
       return !FAILED(code);
   }
   /**
    * @en Convert to [[RESULT_CODE]] `name` string from [[RESULT_CODE]].
    * @ja [[RESULT_CODE]] を [[RESULT_CODE]] 文字列に変換
    *
    * @param code [[RESULT_CODE]]
    * @param tag  custom tag if needed.
    * @returns name string ex) "[tag][NOT_SUPPORTED]"
    */
   function toNameString(code, tag) {
       const prefix = tag ? `[${tag}]` : '';
       if (RESULT_CODE[code]) {
           return `${prefix}[${RESULT_CODE[code]}]`;
       }
       else {
           return `${prefix}[${"UNKNOWN" /* UNKNOWN_ERROR_NAME */}]`;
       }
   }
   /**
    * @en Convert to help string from [[RESULT_CODE]].
    * @ja [[RESULT_CODE]] をヘルプストリングに変換
    *
    * @param code [[RESULT_CODE]]
    * @returns registered help string
    */
   function toHelpString(code) {
       const map = ERROR_MESSAGE_MAP();
       if (map[code]) {
           return map[code];
       }
       else {
           return `unregistered result code. [code: ${code}]`;
       }
   }

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   /* eslint-disable-next-line @typescript-eslint/unbound-method */
   const isNumber$1 = Number.isFinite;
   /**
    * @en A result holder class. <br>
    *     Derived native `Error` class.
    * @ja 処理結果伝達クラス <br>
    *     ネイティブ `Error` の派生クラス
    */
   class Result extends Error {
       /**
        * constructor
        *
        * @param code
        *  - `en` result code
        *  - `ja` 結果コード
        * @param message
        *  - `en` result info message
        *  - `ja` 結果情報メッセージ
        * @param cause
        *  - `en` low-level error information
        *  - `ja` 下位のエラー情報
        */
       constructor(code, message, cause) {
           code = isNil(code) ? RESULT_CODE.SUCCESS : isNumber$1(code) ? Math.trunc(code) : RESULT_CODE.FAIL;
           super(message || toHelpString(code));
           let time = isError(cause) ? cause.time : undefined;
           isNumber$1(time) || (time = Date.now());
           const descriptors = {
               code: { enumerable: true, value: code },
               cause: { enumerable: true, value: cause },
               time: { enumerable: true, value: time },
           };
           Object.defineProperties(this, descriptors);
       }
       /**
        * @en Judge succeeded or not.
        * @ja 成功判定
        */
       get isSucceeded() {
           return SUCCEEDED(this.code);
       }
       /**
        * @en Judge failed or not.
        * @ja 失敗判定
        */
       get isFailed() {
           return FAILED(this.code);
       }
       /**
        * @en Judge canceled or not.
        * @ja キャンセルエラー判定
        */
       get isCanceled() {
           return this.code === RESULT_CODE.ABORT;
       }
       /**
        * @en Get formatted [[RESULT_CODE]] name string.
        * @ja フォーマットされた [[RESULT_CODE]] 名文字列を取得
        */
       get codeName() {
           return toNameString(this.code, this.name);
       }
       /**
        * @en Get [[RESULT_CODE]] help string.
        * @ja [[RESULT_CODE]] のヘルプストリングを取得
        */
       get help() {
           return toHelpString(this.code);
       }
       /** @internal */
       get [Symbol.toStringTag]() {
           return "Result" /* RESULT */;
       }
   }
   Result.prototype.name = "Result" /* RESULT */;
   /** @interna lReturns `true` if `x` is `Error`, `false` otherwise. */
   function isError(x) {
       return x instanceof Error || className(x) === "Error" /* ERROR */;
   }
   /** Returns `true` if `x` is `Result`, `false` otherwise. */
   function isResult(x) {
       return x instanceof Result || className(x) === "Result" /* RESULT */;
   }
   /**
    * @en Convert to [[Result]] object.
    * @ja [[Result]] オブジェクトに変換
    */
   function toResult(o) {
       if (o instanceof Result) {
           /* eslint-disable-next-line prefer-const */
           let { code, cause, time } = o;
           code = isNil(code) ? RESULT_CODE.SUCCESS : isNumber$1(code) ? Math.trunc(code) : RESULT_CODE.FAIL;
           isNumber$1(time) || (time = Date.now());
           // Do nothing if already defined
           Reflect.defineProperty(o, 'code', { enumerable: true, value: code });
           Reflect.defineProperty(o, 'cause', { enumerable: true, value: cause });
           Reflect.defineProperty(o, 'time', { enumerable: true, value: time });
           return o;
       }
       else {
           const e = Object(o);
           const message = isString(e.message) ? e.message : isString(o) ? o : undefined;
           const code = isChancelLikeError(message) ? RESULT_CODE.ABORT : isNumber$1(e.code) ? e.code : o;
           const cause = isError(e.cause) ? e.cause : isError(o) ? o : isString(o) ? new Error(o) : o;
           return new Result(code, message, cause);
       }
   }
   /**
    * @en Create [[Result]] helper.
    * @ja [[Result]] オブジェクト構築ヘルパー
    *
    * @param code
    *  - `en` result code
    *  - `ja` 結果コード
    * @param message
    *  - `en` result info message
    *  - `ja` 結果情報メッセージ
    * @param cause
    *  - `en` low-level error information
    *  - `ja` 下位のエラー情報
    */
   function makeResult(code, message, cause) {
       return new Result(code, message, cause);
   }
   /**
    * @en Create canceled [[Result]] helper.
    * @ja キャンセル情報格納 [[Result]] オブジェクト構築ヘルパー
    *
    * @param message
    *  - `en` result info message
    *  - `ja` 結果情報メッセージ
    * @param cause
    *  - `en` low-level error information
    *  - `ja` 下位のエラー情報
    */
   function makeCanceledResult(message, cause) {
       return new Result(RESULT_CODE.ABORT, message, cause);
   }

   /*!
    * @cdp/core-storage 0.9.0
    *   core storage utility module
    */

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   //__________________________________________________________________________________________________//
   /**
    * @en Memory storage class. This class doesn't support permaneciation data.
    * @ja メモリーストレージクラス. 本クラスはデータの永続化をサポートしない
    */
   class MemoryStorage {
       constructor() {
           this._broker = new EventBroker();
           this._storage = {};
       }
       ///////////////////////////////////////////////////////////////////////
       // implements: IStorage
       /**
        * @en [[IStorage]] kind signature.
        * @ja [[IStorage]] の種別を表す識別子
        */
       get kind() {
           return 'memory';
       }
       async getItem(key, options) {
           options = options || {};
           await checkCanceled(options.cancel);
           // `undefined` → `null`
           const value = dropUndefined(this._storage[key]);
           switch (options.dataType) {
               case 'string':
                   return fromTypedData(value);
               case 'number':
                   return Number(restoreNil(value));
               case 'boolean':
                   return Boolean(restoreNil(value));
               case 'object':
                   return Object(restoreNil(value));
               default:
                   return restoreNil(value);
           }
       }
       /**
        * @en Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
        * @ja キーを指定して値を設定. 存在しない場合は新規に作成
        *
        * @param key
        *  - `en` access key
        *  - `ja` アクセスキー
        * @param options
        *  - `en` I/O options
        *  - `ja` I/O オプション
        */
       async setItem(key, value, options) {
           options = options || {};
           await checkCanceled(options.cancel);
           const newVal = dropUndefined(value, true); // `null` or `undefined` → 'null' or 'undefined'
           const oldVal = dropUndefined(this._storage[key]); // `undefined` → `null`
           if (!deepEqual(oldVal, newVal)) {
               this._storage[key] = newVal;
               !options.silent && this._broker.trigger('@', key, newVal, oldVal);
           }
       }
       /**
        * @en Removes the key/value pair with the given key from the list associated with the object, if a key/value pair with the given key exists.
        * @ja 指定されたキーに対応する値が存在すれば削除
        *
        * @param options
        *  - `en` storage options
        *  - `ja` ストレージオプション
        */
       async removeItem(key, options) {
           options = options || {};
           await checkCanceled(options.cancel);
           const oldVal = this._storage[key];
           if (undefined !== oldVal) {
               delete this._storage[key];
               !options.silent && this._broker.trigger('@', key, null, oldVal);
           }
       }
       /**
        * @en Empties the list associated with the object of all key/value pairs, if there are any.
        * @ja すべてのキーに対応する値を削除
        *
        * @param options
        *  - `en` storage options
        *  - `ja` ストレージオプション
        */
       async clear(options) {
           options = options || {};
           await checkCanceled(options.cancel);
           if (!isEmptyObject(this._storage)) {
               this._storage = {};
               !options.silent && this._broker.trigger('@', null, null, null);
           }
       }
       /**
        * @en Returns all entry keys.
        * @ja すべてのキー一覧を返却
        *
        * @param options
        *  - `en` cancel options
        *  - `ja` キャンセルオプション
        */
       async keys(options) {
           await checkCanceled(options && options.cancel);
           return Object.keys(this._storage);
       }
       /**
        * @en Subscrive event(s).
        * @ja イベント購読設定
        *
        * @param listener
        *  - `en` callback function.
        *  - `ja` コールバック関数
        */
       on(listener) {
           return this._broker.on('@', listener);
       }
       /**
        * @en Unsubscribe event(s).
        * @ja イベント購読解除
        *
        * @param listener
        *  - `en` callback function.
        *         When not set this parameter, listeners are released.
        *  - `ja` コールバック関数
        *         指定しない場合はすべてを解除
        */
       off(listener) {
           this._broker.off('@', listener);
       }
       ///////////////////////////////////////////////////////////////////////
       // operations:
       /**
        * @en Return a shallow copy of the storage's attributes for JSON stringification.
        * @ja JSON stringify のためにストレージプロパティのシャローコピー返却
        */
       get context() {
           return this._storage;
       }
   }
   // default storage
   const memoryStorage = new MemoryStorage();

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    */
   /**
    * @en Registry management class for synchronous Read/Write accessible from any [[IStorage]] object.
    * @ja 任意の [[IStorage]] オブジェクトから同期 Read/Write アクセス可能なレジストリ管理クラス
    *
    * @example <br>
    *
    * ```ts
    * // 1. define registry schema
    * interface Schema extends RegistrySchemaBase {
    *    'common/mode': 'normal' | 'specified';
    *    'common/value': number;
    *    'trade/local': { unit: '円' | '$'; rate: number; };
    *    'trade/check': boolean;
    *    'extra/user': string;
    * }
    *
    * // 2. prepare IStorage instance
    * // ex
    * import { webStorage } from '@cdp/web-storage';
    *
    * // 3. instantiate this class
    * const reg = new Registry<Schema>(webStorage, '@test');
    *
    * // 4. read example
    * const val = reg.read('common/mode'); // 'normal' | 'specified' | null
    *
    * // 5. write example
    * reg.write('common/mode', 'specified');
    * // reg.write('common/mode', 'hoge'); // compile error
    * ```
    */
   class Registry extends EventPublisher {
       /**
        * constructor
        *
        * @param storage
        *  - `en` Root key for [[IStorage]].
        *  - `ja` [[IStorage]] に使用するルートキー
        * @param rootKey
        *  - `en` Root key for [[IStorage]].
        *  - `ja` [[IStorage]] に使用するルートキー
        * @param formatSpace
        *  - `en` for JSON format space.
        *  - `ja` JSON フォーマットスペースを指定
        */
       constructor(storage, rootKey, formatSpace) {
           super();
           this._store = {};
           this._storage = storage;
           this._rootKey = rootKey;
           this._defaultOptions = { jsonSpace: formatSpace };
       }
       /**
        * @en Access to root key.
        * @ja ルートキーを取得
        */
       get rootKey() {
           return this._rootKey;
       }
       /**
        * @en Access to [[IStorage]] object.
        * @ja [[IStorage]] オブジェクトを取得
        */
       get storage() {
           return this._storage;
       }
       ///////////////////////////////////////////////////////////////////////
       // public methods:
       /**
        * @en Read persistence data from [[IStorage]]. The data loaded already will be cleared.
        * @ja [[IStorage]] から永続化したデータを読み込み. すでにキャッシュされているデータは破棄される
        */
       async load(options) {
           options = options || {};
           this._store = (await this._storage.getItem(this._rootKey, options)) || {};
           if (!options.silent) {
               post(() => this.publish('change', '*'));
           }
       }
       /**
        * @en Persist data to [[IStorage]].
        * @ja [[IStorage]] にデータを永続化
        */
       async save(options) {
           const opts = { ...this._defaultOptions, ...options };
           if (!opts.silent) {
               this.publish('will-save');
           }
           await this._storage.setItem(this._rootKey, this._store, opts);
       }
       /**
        * @en Read registry value.
        * @ja レジストリ値の読み取り
        *
        * @param key
        *  - `en` target registry key.
        *  - `ja` 対象のレジストリキーを指定
        * @param options
        *  - `en` read options.
        *  - `ja` 読み取りオプションを指定
        */
       read(key, options) {
           const { field } = options || {};
           const structure = String(key).split('/');
           const lastKey = structure.pop();
           let name;
           let reg = this.targetRoot(field);
           while (name = structure.shift()) { // eslint-disable-line no-cond-assign
               if (!(name in reg)) {
                   return null;
               }
               reg = reg[name];
           }
           // return deep copy
           return (null != reg[lastKey]) ? deepCopy(reg[lastKey]) : null;
       }
       /**
        * @en Write registry value.
        * @ja レジストリ値の書き込み
        *
        * @param key
        *  - `en` target registry key.
        *  - `ja` 対象のレジストリキーを指定
        * @param value
        *  - `en` update value. if `null` set to delete.
        *  - `ja` 更新する値. `null` は削除
        * @param options
        *  - `en` write options.
        *  - `ja` 書き込みオプションを指定
        */
       write(key, value, options) {
           const { field, noSave, silent } = options || {};
           const remove = (null == value);
           const structure = String(key).split('/');
           const lastKey = structure.pop();
           let name;
           let reg = this.targetRoot(field);
           while (name = structure.shift()) { // eslint-disable-line no-cond-assign
               if (name in reg) {
                   reg = reg[name];
               }
               else if (remove) {
                   return; // すでに親キーがないため何もしない
               }
               else {
                   reg = reg[name] = {};
               }
           }
           const newVal = remove ? null : value;
           const oldVal = dropUndefined(reg[lastKey]);
           if (deepEqual(oldVal, newVal)) {
               return; // 更新なし
           }
           else if (remove) {
               delete reg[lastKey];
           }
           else {
               reg[lastKey] = deepCopy(newVal);
           }
           if (!noSave) {
               // no fire notification
               this._storage.setItem(this._rootKey, this._store, { ...this._defaultOptions, ...options });
           }
           if (!silent) {
               post(() => this.publish('change', key, newVal, oldVal));
           }
       }
       /**
        * @en Delete registry key.
        * @ja レジストリキーの削除
        *
        * @param key
        *  - `en` target registry key.
        *  - `ja` 対象のレジストリキーを指定
        * @param options
        *  - `en` read options.
        *  - `ja` 書き込みオプションを指定
        */
       delete(key, options) {
           this.write(key, null, options);
       }
       /**
        * @en Clear all registry.
        * @ja レジストリの全削除
        *
        * @param options
        *  - `en` read options.
        *  - `ja` 書き込みオプションを指定
        */
       clear(options) {
           options = options || {};
           this._store = {};
           this._storage.removeItem(this._rootKey, options);
           if (!options.silent) {
               this.publish('change', null, null, null);
           }
       }
       ///////////////////////////////////////////////////////////////////////
       // private methods:
       /** get root object */
       targetRoot(field) {
           if (field) {
               // ensure [field] object.
               this._store[field] = this._store[field] || {};
               return this._store[field];
           }
           else {
               return this._store;
           }
       }
   }

   /*!
    * @cdp/core-template 0.9.0
    *   template engine
    */

   const globalSettings = {
       tags: ['{{', '}}'],
       escape: escapeHTML,
   };

   /**
    * @en Build cache key.
    * @ja キャッシュキーの生成
    */
   function buildCacheKey(template, tags) {
       return `${template}:${tags.join(':')}`;
   }
   /**
    * @en Clears all cached templates in cache pool.
    * @ja すべてのテンプレートキャッシュを破棄
    */
   function clearCache() {
       const namespace = getGlobalNamespace("CDP_DECLARE" /* NAMESPACE */);
       namespace["TEMPLATE_CACHE" /* ROOT */] = {};
   }
   /** global cache pool */
   const cache = ensureObject(null, "CDP_DECLARE" /* NAMESPACE */, "TEMPLATE_CACHE" /* ROOT */);

   /**
    * More correct typeof string handling array
    * which normally returns typeof 'object'
    */
   function typeString(src) {
       return isArray(src) ? 'array' : typeof src;
   }
   /**
    * Escape for template's expression charactors.
    */
   function escapeTemplateExp(src) {
       // eslint-disable-next-line
       return src.replace(/[-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
   }
   /**
    * Safe way of detecting whether or not the given thing is a primitive and
    * whether it has the given property
    */
   function primitiveHasOwnProperty(src, propName) {
       return isPrimitive(src) && Object.prototype.hasOwnProperty.call(src, propName);
   }
   /**
    * Check whitespace charactor exists.
    */
   function isWhitespace(src) {
       return !/\S/.test(src);
   }

   /**
    * A simple string scanner that is used by the template parser to find
    * tokens in template strings.
    */
   class Scanner {
       /**
        * constructor
        */
       constructor(src) {
           this._source = this._tail = src;
           this._pos = 0;
       }
       ///////////////////////////////////////////////////////////////////////
       // public methods:
       /**
        * Returns current scanning position.
        */
       get pos() {
           return this._pos;
       }
       /**
        * Returns string  source.
        */
       get source() {
           return this._source;
       }
       /**
        * Returns `true` if the tail is empty (end of string).
        */
       get eos() {
           return '' === this._tail;
       }
       /**
        * Tries to match the given regular expression at the current position.
        * Returns the matched text if it can match, the empty string otherwise.
        */
       scan(regexp) {
           const match = regexp.exec(this._tail);
           if (!match || 0 !== match.index) {
               return '';
           }
           const string = match[0];
           this._tail = this._tail.substring(string.length);
           this._pos += string.length;
           return string;
       }
       /**
        * Skips all text until the given regular expression can be matched. Returns
        * the skipped string, which is the entire tail if no match can be made.
        */
       scanUntil(regexp) {
           const index = this._tail.search(regexp);
           let match;
           switch (index) {
               case -1:
                   match = this._tail;
                   this._tail = '';
                   break;
               case 0:
                   match = '';
                   break;
               default:
                   match = this._tail.substring(0, index);
                   this._tail = this._tail.substring(index);
           }
           this._pos += match.length;
           return match;
       }
   }

   /* eslint-disable
      @typescript-eslint/no-explicit-any
    , @typescript-eslint/no-this-alias
    */
   /**
    * Represents a rendering context by wrapping a view object and
    * maintaining a reference to the parent context.
    */
   class Context {
       /** constructor */
       constructor(view, parentContext) {
           this._view = view;
           this._cache = { '.': this._view };
           this._parent = parentContext;
       }
       ///////////////////////////////////////////////////////////////////////
       // public methods:
       /**
        * View parameter getter.
        */
       get view() {
           return this._view;
       }
       /**
        * Creates a new context using the given view with this context
        * as the parent.
        */
       push(view) {
           return new Context(view, this);
       }
       /**
        * Returns the value of the given name in this context, traversing
        * up the context hierarchy if the value is absent in this context's view.
        */
       lookup(name) {
           const cache = this._cache;
           let value;
           if (Object.prototype.hasOwnProperty.call(cache, name)) {
               value = cache[name];
           }
           else {
               let context = this;
               let intermediateValue;
               let names;
               let index;
               let lookupHit = false;
               while (context) {
                   if (0 < name.indexOf('.')) {
                       intermediateValue = context._view;
                       names = name.split('.');
                       index = 0;
                       /**
                        * Using the dot notion path in `name`, we descend through the
                        * nested objects.
                        *
                        * To be certain that the lookup has been successful, we have to
                        * check if the last object in the path actually has the property
                        * we are looking for. We store the result in `lookupHit`.
                        *
                        * This is specially necessary for when the value has been set to
                        * `undefined` and we want to avoid looking up parent contexts.
                        *
                        * In the case where dot notation is used, we consider the lookup
                        * to be successful even if the last "object" in the path is
                        * not actually an object but a primitive (e.g., a string, or an
                        * integer), because it is sometimes useful to access a property
                        * of an autoboxed primitive, such as the length of a string.
                        **/
                       while (null != intermediateValue && index < names.length) {
                           if (index === names.length - 1) {
                               lookupHit = (has(intermediateValue, names[index]) ||
                                   primitiveHasOwnProperty(intermediateValue, names[index]));
                           }
                           intermediateValue = intermediateValue[names[index++]];
                       }
                   }
                   else {
                       intermediateValue = context._view[name];
                       /**
                        * Only checking against `hasProperty`, which always returns `false` if
                        * `context.view` is not an object. Deliberately omitting the check
                        * against `primitiveHasOwnProperty` if dot notation is not used.
                        *
                        * Consider this example:
                        * ```
                        * Mustache.render("The length of a football field is {{#length}}{{length}}{{/length}}.", {length: "100 yards"})
                        * ```
                        *
                        * If we were to check also against `primitiveHasOwnProperty`, as we do
                        * in the dot notation case, then render call would return:
                        *
                        * "The length of a football field is 9."
                        *
                        * rather than the expected:
                        *
                        * "The length of a football field is 100 yards."
                        **/
                       lookupHit = has(context._view, name);
                   }
                   if (lookupHit) {
                       value = intermediateValue;
                       break;
                   }
                   context = context._parent;
               }
               cache[name] = value;
           }
           if (isFunction(value)) {
               value = value.call(this._view);
           }
           return value;
       }
   }

   /** @internal */
   const _regexp = {
       white: /\s*/,
       space: /\s+/,
       equals: /\s*=/,
       curly: /\s*\}/,
       tag: /#|\^|\/|>|\{|&|=|!/,
   };
   /**
    * @internal
    * Combines the values of consecutive text tokens in the given `tokens` array to a single token.
    */
   function squashTokens(tokens) {
       const squashedTokens = [];
       let lastToken;
       for (const token of tokens) {
           if (token) {
               if ('text' === token[0 /* TYPE */] && lastToken && 'text' === lastToken[0 /* TYPE */]) {
                   lastToken[1 /* VALUE */] += token[1 /* VALUE */];
                   lastToken[3 /* END */] = token[3 /* END */];
               }
               else {
                   squashedTokens.push(token);
                   lastToken = token;
               }
           }
       }
       return squashedTokens;
   }
   /**
    * @internal
    * Forms the given array of `tokens` into a nested tree structure where
    * tokens that represent a section have two additional items: 1) an array of
    * all tokens that appear in that section and 2) the index in the original
    * template that represents the end of that section.
    */
   function nestTokens(tokens) {
       const nestedTokens = [];
       let collector = nestedTokens;
       const sections = [];
       let section;
       for (const token of tokens) {
           switch (token[0 /* TYPE */]) {
               case '#':
               case '^':
                   collector.push(token);
                   sections.push(token);
                   collector = token[4 /* TOKEN_LIST */] = [];
                   break;
               case '/':
                   section = sections.pop();
                   section[5 /* TAG_INDEX */] = token[2 /* START */];
                   collector = sections.length > 0 ? sections[sections.length - 1][4 /* TOKEN_LIST */] : nestedTokens;
                   break;
               default:
                   collector.push(token);
                   break;
           }
       }
       return nestedTokens;
   }
   /**
    * Breaks up the given `template` string into a tree of tokens. If the `tags`
    * argument is given here it must be an array with two string values: the
    * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
    * course, the default is to use mustaches (i.e. mustache.tags).
    *
    * A token is an array with at least 4 elements. The first element is the
    * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
    * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
    * all text that appears outside a symbol this element is "text".
    *
    * The second element of a token is its "value". For mustache tags this is
    * whatever else was inside the tag besides the opening symbol. For text tokens
    * this is the text itself.
    *
    * The third and fourth elements of the token are the start and end indices,
    * respectively, of the token in the original template.
    *
    * Tokens that are the root node of a subtree contain two more elements: 1) an
    * array of tokens in the subtree and 2) the index in the original template at
    * which the closing tag for that section begins.
    *
    * Tokens for partials also contain two more elements: 1) a string value of
    * indendation prior to that tag and 2) the index of that tag on that line -
    * eg a value of 2 indicates the partial is the third tag on this line.
    *
    * @param template template string
    * @param tags delimiters ex) ['{{','}}'] or '{{ }}'
    */
   function parseTemplate(template, tags) {
       if (!template) {
           return [];
       }
       let lineHasNonSpace = false;
       const sections = []; // Stack to hold section tokens
       const tokens = []; // Buffer to hold the tokens
       const spaces = []; // Indices of whitespace tokens on the current line
       let hasTag = false; // Is there a {{tag}} on the current line?
       let nonSpace = false; // Is there a non-space char on the current line?
       let indentation = ''; // Tracks indentation for tags that use it
       let tagIndex = 0; // Stores a count of number of tags encountered on a line
       // Strips all whitespace tokens array for the current line
       // if there was a {{#tag}} on it and otherwise only space.
       const stripSpace = () => {
           if (hasTag && !nonSpace) {
               while (spaces.length) {
                   delete tokens[spaces.pop()];
               }
           }
           else {
               spaces.length = 0;
           }
           hasTag = false;
           nonSpace = false;
       };
       const compileTags = (tagsToCompile) => {
           if (isString(tagsToCompile)) {
               tagsToCompile = tagsToCompile.split(_regexp.space, 2);
           }
           if (!isArray(tagsToCompile) || 2 !== tagsToCompile.length) {
               throw new Error(`Invalid tags: ${JSON.stringify(tagsToCompile)}`);
           }
           return {
               openingTag: new RegExp(`${escapeTemplateExp(tagsToCompile[0 /* OPEN */])}\\s*`),
               closingTag: new RegExp(`\\s*${escapeTemplateExp(tagsToCompile[1 /* CLOSE */])}`),
               closingCurly: new RegExp(`\\s*${escapeTemplateExp(`}${tagsToCompile[1 /* CLOSE */]}`)}`),
           };
       };
       const { tag: reTag, white: reWhite, equals: reEquals, curly: reCurly } = _regexp;
       let _regxpTags = compileTags(tags || globalSettings.tags);
       const scanner = new Scanner(template);
       let openSection;
       while (!scanner.eos) {
           const { openingTag: reOpeningTag, closingTag: reClosingTag, closingCurly: reClosingCurly } = _regxpTags;
           let token;
           let start = scanner.pos;
           // Match any text between tags.
           let value = scanner.scanUntil(reOpeningTag);
           if (value) {
               for (let i = 0, valueLength = value.length; i < valueLength; ++i) {
                   const chr = value.charAt(i);
                   if (isWhitespace(chr)) {
                       spaces.push(tokens.length);
                       indentation += chr;
                   }
                   else {
                       nonSpace = true;
                       lineHasNonSpace = true;
                       indentation += ' ';
                   }
                   tokens.push(['text', chr, start, start + 1]);
                   start += 1;
                   // Check for whitespace on the current line.
                   if ('\n' === chr) {
                       stripSpace();
                       indentation = '';
                       tagIndex = 0;
                       lineHasNonSpace = false;
                   }
               }
           }
           // Match the opening tag.
           if (!scanner.scan(reOpeningTag)) {
               break;
           }
           hasTag = true;
           // Get the tag type.
           let type = scanner.scan(reTag) || 'name';
           scanner.scan(reWhite);
           // Get the tag value.
           if ('=' === type) {
               value = scanner.scanUntil(reEquals);
               scanner.scan(reEquals);
               scanner.scanUntil(reClosingTag);
           }
           else if ('{' === type) {
               value = scanner.scanUntil(reClosingCurly);
               scanner.scan(reCurly);
               scanner.scanUntil(reClosingTag);
               type = '&';
           }
           else {
               value = scanner.scanUntil(reClosingTag);
           }
           // Match the closing tag.
           if (!scanner.scan(reClosingTag)) {
               throw new Error(`Unclosed tag at ${scanner.pos}`);
           }
           if ('>' === type) {
               token = [type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace];
           }
           else {
               token = [type, value, start, scanner.pos];
           }
           tagIndex++;
           tokens.push(token);
           if ('#' === type || '^' === type) {
               sections.push(token);
           }
           else if ('/' === type) {
               // Check section nesting.
               openSection = sections.pop();
               if (!openSection) {
                   throw new Error(`Unopened section "${value}" at ${start}`);
               }
               if (openSection[1] !== value) {
                   throw new Error(`Unclosed section "${openSection[1 /* VALUE */]}" at ${start}`);
               }
           }
           else if ('name' === type || '{' === type || '&' === type) {
               nonSpace = true;
           }
           else if ('=' === type) {
               // Set the tags for the next time around.
               _regxpTags = compileTags(value);
           }
       }
       stripSpace();
       // Make sure there are no open sections when we're done.
       openSection = sections.pop();
       if (openSection) {
           throw new Error(`Unclosed section "${openSection[1 /* VALUE */]}" at ${scanner.pos}`);
       }
       return nestTokens(squashTokens(tokens));
   }

   /**
    * A Writer knows how to take a stream of tokens and render them to a
    * string, given a context. It also maintains a cache of templates to
    * avoid the need to parse the same template twice.
    */
   class Writer {
       ///////////////////////////////////////////////////////////////////////
       // public methods:
       /**
        * Parses and caches the given `template` according to the given `tags` or
        * `mustache.tags` if `tags` is omitted,  and returns the array of tokens
        * that is generated from the parse.
        */
       parse(template, tags) {
           const cacheKey = buildCacheKey(template, tags || globalSettings.tags);
           let tokens = cache[cacheKey];
           if (null == tokens) {
               tokens = cache[cacheKey] = parseTemplate(template, tags);
           }
           return { tokens, cacheKey };
       }
       /**
        * High-level method that is used to render the given `template` with
        * the given `view`.
        *
        * The optional `partials` argument may be an object that contains the
        * names and templates of partials that are used in the template. It may
        * also be a function that is used to load partial templates on the fly
        * that takes a single argument: the name of the partial.
        *
        * If the optional `tags` argument is given here it must be an array with two
        * string values: the opening and closing tags used in the template (e.g.
        * [ "<%", "%>" ]). The default is to mustache.tags.
        */
       render(template, view, partials, tags) {
           const { tokens } = this.parse(template, tags);
           return this.renderTokens(tokens, view, partials, template, tags);
       }
       /**
        * Low-level method that renders the given array of `tokens` using
        * the given `context` and `partials`.
        *
        * Note: The `originalTemplate` is only ever used to extract the portion
        * of the original template that was contained in a higher-order section.
        * If the template doesn't use higher-order sections, this argument may
        * be omitted.
        */
       renderTokens(tokens, view, partials, originalTemplate, tags) {
           const context = (view instanceof Context) ? view : new Context(view);
           let buffer = '';
           for (const token of tokens) {
               let value;
               switch (token[0 /* TYPE */]) {
                   case '#':
                       value = this.renderSection(token, context, partials, originalTemplate);
                       break;
                   case '^':
                       value = this.renderInverted(token, context, partials, originalTemplate);
                       break;
                   case '>':
                       value = this.renderPartial(token, context, partials, tags);
                       break;
                   case '&':
                       value = this.unescapedValue(token, context);
                       break;
                   case 'name':
                       value = this.escapedValue(token, context);
                       break;
                   case 'text':
                       value = this.rawValue(token);
                       break;
               }
               if (null != value) {
                   buffer += value;
               }
           }
           return buffer;
       }
       ///////////////////////////////////////////////////////////////////////
       // private methods:
       /** @internal */
       renderSection(token, context, partials, originalTemplate) {
           const self = this;
           let buffer = '';
           let value = context.lookup(token[1 /* VALUE */]);
           // This function is used to render an arbitrary template
           // in the current context by higher-order sections.
           const subRender = (template) => {
               return self.render(template, context, partials);
           };
           if (!value) {
               return;
           }
           if (isArray(value)) {
               for (const v of value) {
                   buffer += this.renderTokens(token[4 /* TOKEN_LIST */], context.push(v), partials, originalTemplate);
               }
           }
           else if ('object' === typeof value || 'string' === typeof value || 'number' === typeof value) {
               buffer += this.renderTokens(token[4 /* TOKEN_LIST */], context.push(value), partials, originalTemplate);
           }
           else if (isFunction(value)) {
               if ('string' !== typeof originalTemplate) {
                   throw new Error('Cannot use higher-order sections without the original template');
               }
               // Extract the portion of the original template that the section contains.
               value = value.call(context.view, originalTemplate.slice(token[3 /* END */], token[5 /* TAG_INDEX */]), subRender);
               if (null != value) {
                   buffer += value;
               }
           }
           else {
               buffer += this.renderTokens(token[4 /* TOKEN_LIST */], context, partials, originalTemplate);
           }
           return buffer;
       }
       /** @internal */
       renderInverted(token, context, partials, originalTemplate) {
           const value = context.lookup(token[1 /* VALUE */]);
           if (!value || (isArray(value) && 0 === value.length)) {
               return this.renderTokens(token[4 /* TOKEN_LIST */], context, partials, originalTemplate);
           }
       }
       /** @internal */
       indentPartial(partial, indentation, lineHasNonSpace) {
           const filteredIndentation = indentation.replace(/[^ \t]/g, '');
           const partialByNl = partial.split('\n');
           for (let i = 0; i < partialByNl.length; i++) {
               if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
                   partialByNl[i] = filteredIndentation + partialByNl[i];
               }
           }
           return partialByNl.join('\n');
       }
       /** @internal */
       renderPartial(token, context, partials, tags) {
           if (!partials) {
               return;
           }
           const value = isFunction(partials) ? partials(token[1 /* VALUE */]) : partials[token[1 /* VALUE */]];
           if (null != value) {
               const lineHasNonSpace = token[6 /* HAS_NO_SPACE */];
               const tagIndex = token[5 /* TAG_INDEX */];
               const indentation = token[4 /* TOKEN_LIST */];
               let indentedValue = value;
               if (0 === tagIndex && indentation) {
                   indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
               }
               const { tokens } = this.parse(indentedValue, tags);
               return this.renderTokens(tokens, context, partials, indentedValue);
           }
       }
       /** @internal */
       unescapedValue(token, context) {
           const value = context.lookup(token[1 /* VALUE */]);
           if (null != value) {
               return value;
           }
       }
       /** @internal */
       escapedValue(token, context) {
           const value = context.lookup(token[1 /* VALUE */]);
           if (null != value) {
               return globalSettings.escape(value);
           }
       }
       /** @internal */
       rawValue(token) {
           return token[1 /* VALUE */];
       }
   }

   /** [[TemplateEngine]] common settings */
   globalSettings.writer = new Writer();
   /**
    * @en TemplateEngine utility class.
    * @ja TemplateEngine ユーティリティクラス
    */
   class TemplateEngine {
       ///////////////////////////////////////////////////////////////////////
       // public static methods:
       /**
        * @en Get [[JST]] from template source.
        * @ja テンプレート文字列から [[JST]] を取得
        *
        * @package template
        *  - `en` template source string
        *  - `ja` テンプレート文字列
        * @package options
        *  - `en` compile options
        *  - `ja` コンパイルオプション
        */
       static compile(template, options) {
           if (!isString(template)) {
               throw new TypeError(`Invalid template! the first argument should be a "string" but "${typeString(template)}" was given for TemplateEngine.compile(template, options)`);
           }
           const { tags } = options || globalSettings;
           const { writer } = globalSettings;
           const jst = (view, partials) => {
               return writer.render(template, view || {}, partials, tags);
           };
           const { tokens, cacheKey } = writer.parse(template, tags);
           jst.tokens = tokens;
           jst.cacheKey = cacheKey;
           jst.cacheLocation = ["CDP_DECLARE" /* NAMESPACE */, "TEMPLATE_CACHE" /* ROOT */];
           return jst;
       }
       /**
        * @en Clears all cached templates in the default [[TemplateWriter]].
        * @ja 既定の [[TemplateWriter]] のすべてのキャッシュを削除
        */
       static clearCache() {
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
       static setGlobalSettings(setiings) {
           const oldSettings = { ...globalSettings };
           const { writer, tags, escape } = setiings;
           writer && (globalSettings.writer = writer);
           tags && (globalSettings.tags = tags);
           escape && (globalSettings.escape = escape);
           return oldSettings;
       }
       ///////////////////////////////////////////////////////////////////////
       // public static methods: for debug
       /** @internal Create [[TemplateScanner]] instance */
       static createScanner(src) {
           return new Scanner(src);
       }
       /** @internal Create [[TemplateContext]] instance */
       static createContext(view, parentContext) {
           return new Context(view, parentContext);
       }
       /** @internal Create [[TemplateWriter]] instance */
       static createWriter() {
           return new Writer();
       }
   }

   exports.$cdp = $cdp;
   exports.ASSIGN_RESULT_CODE = ASSIGN_RESULT_CODE;
   exports.CancelToken = CancelToken;
   exports.CancelablePromise = CancelablePromise;
   exports.DECLARE_ERROR_CODE = DECLARE_ERROR_CODE;
   exports.DECLARE_SUCCESS_CODE = DECLARE_SUCCESS_CODE;
   exports.EventBroker = EventBroker;
   exports.EventPublisher = EventPublisher;
   exports.EventRevceiver = EventRevceiver;
   exports.EventSource = EventSourceBase;
   exports.FAILED = FAILED;
   exports.MemoryStorage = MemoryStorage;
   exports.ObservableArray = ObservableArray;
   exports.ObservableObject = ObservableObject;
   exports.Promise = CancelablePromise;
   exports.PromiseManager = PromiseManager;
   exports.RESULT_CODE = RESULT_CODE;
   exports.Registry = Registry;
   exports.Result = Result;
   exports.SUCCEEDED = SUCCEEDED;
   exports.TemplateEngine = TemplateEngine;
   exports.camelize = camelize;
   exports.capitalize = capitalize;
   exports.checkCanceled = checkCanceled;
   exports.className = className;
   exports.classify = classify;
   exports.clearInterval = _clearInterval;
   exports.clearTimeout = _clearTimeout;
   exports.computeDate = computeDate;
   exports.createEscaper = createEscaper;
   exports.dasherize = dasherize;
   exports.debounce = debounce;
   exports.decapitalize = decapitalize;
   exports.deepCopy = deepCopy;
   exports.deepEqual = deepEqual;
   exports.deepMerge = deepMerge;
   exports.diff = diff;
   exports.dropUndefined = dropUndefined;
   exports.ensureObject = ensureObject;
   exports.escapeHTML = escapeHTML;
   exports.every = every;
   exports.exists = exists;
   exports.extendPromise = extendPromise;
   exports.filter = filter;
   exports.find = find;
   exports.findIndex = findIndex;
   exports.fromTypedData = fromTypedData;
   exports.getConfig = getConfig;
   exports.getGlobal = getGlobal;
   exports.getGlobalNamespace = getGlobalNamespace;
   exports.groupBy = groupBy;
   exports.has = has;
   exports.indices = indices;
   exports.instanceOf = instanceOf;
   exports.invert = invert;
   exports.isArray = isArray;
   exports.isBoolean = isBoolean;
   exports.isChancelLikeError = isChancelLikeError;
   exports.isEmptyObject = isEmptyObject;
   exports.isFunction = isFunction;
   exports.isIterable = isIterable;
   exports.isNil = isNil;
   exports.isNumber = isNumber;
   exports.isObject = isObject;
   exports.isObservable = isObservable;
   exports.isPlainObject = isPlainObject;
   exports.isPrimitive = isPrimitive;
   exports.isResult = isResult;
   exports.isString = isString;
   exports.isSymbol = isSymbol;
   exports.isTypedArray = isTypedArray;
   exports.luid = luid;
   exports.makeCanceledResult = makeCanceledResult;
   exports.makeResult = makeResult;
   exports.map = map;
   exports.memoryStorage = memoryStorage;
   exports.mixins = mixins;
   exports.noop = noop;
   exports.omit = omit;
   exports.once = once;
   exports.ownInstanceOf = ownInstanceOf;
   exports.pick = pick;
   exports.post = post;
   exports.reduce = reduce;
   exports.restoreNil = restoreNil;
   exports.result = result;
   exports.safe = safe;
   exports.sameClass = sameClass;
   exports.sameType = sameType;
   exports.setInterval = _setInterval;
   exports.setMixClassAttribute = setMixClassAttribute;
   exports.setTimeout = _setTimeout;
   exports.shuffle = shuffle;
   exports.sleep = sleep;
   exports.some = some;
   exports.sort = sort;
   exports.throttle = throttle;
   exports.toHelpString = toHelpString;
   exports.toNameString = toNameString;
   exports.toResult = toResult;
   exports.toTypedData = toTypedData;
   exports.typeOf = typeOf;
   exports.underscored = underscored;
   exports.unescapeHTML = unescapeHTML;
   exports.union = union;
   exports.unique = unique;
   exports.verify = verify;
   exports.wait = wait;

   Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWV3b3JrLWNvcmUuanMiLCJzb3VyY2VzIjpbImNvcmUtdXRpbHMvY29uZmlnLnRzIiwiY29yZS11dGlscy90eXBlcy50cyIsImNvcmUtdXRpbHMvdmVyaWZ5LnRzIiwiY29yZS11dGlscy9kZWVwLWNpcmN1aXQudHMiLCJjb3JlLXV0aWxzL21peGlucy50cyIsImNvcmUtdXRpbHMvYXJyYXkudHMiLCJjb3JlLXV0aWxzL29iamVjdC50cyIsImNvcmUtdXRpbHMvZGF0ZS50cyIsImNvcmUtdXRpbHMvc2FmZS50cyIsImNvcmUtdXRpbHMvdGltZXIudHMiLCJjb3JlLXV0aWxzL21pc2MudHMiLCJldmVudHMvcHVibGlzaGVyLnRzIiwiZXZlbnRzL2Jyb2tlci50cyIsImV2ZW50cy9yZWNlaXZlci50cyIsImV2ZW50cy9zb3VyY2UudHMiLCJwcm9taXNlL2ludGVybmFsLnRzIiwicHJvbWlzZS9jYW5jZWwtdG9rZW4udHMiLCJwcm9taXNlL2NhbmNlbGFibGUtcHJvbWlzZS50cyIsInByb21pc2UvdXRpbHMudHMiLCJvYnNlcnZhYmxlL2ludGVybmFsLnRzIiwib2JzZXJ2YWJsZS9jb21tb24udHMiLCJvYnNlcnZhYmxlL29iamVjdC50cyIsIm9ic2VydmFibGUvYXJyYXkudHMiLCJyZXN1bHQvcmVzdWx0LWNvZGUtZGVmcy50cyIsInJlc3VsdC9yZXN1bHQtY29kZS50cyIsInJlc3VsdC9yZXN1bHQudHMiLCJjb3JlLXN0b3JhZ2UvbWVtb3J5LXN0b3JhZ2UudHMiLCJjb3JlLXN0b3JhZ2UvcmVnaXN0cnkudHMiLCJjb3JlLXRlbXBsYXRlL2ludGVybmFsLnRzIiwiY29yZS10ZW1wbGF0ZS9jYWNoZS50cyIsImNvcmUtdGVtcGxhdGUvdXRpbHMudHMiLCJjb3JlLXRlbXBsYXRlL3NjYW5uZXIudHMiLCJjb3JlLXRlbXBsYXRlL2NvbnRleHQudHMiLCJjb3JlLXRlbXBsYXRlL3BhcnNlLnRzIiwiY29yZS10ZW1wbGF0ZS93cml0ZXIudHMiLCJjb3JlLXRlbXBsYXRlL2NsYXNzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGVuIFNhZmUgYGdsb2JhbGAgYWNjZXNzb3IuXG4gKiBAamEgYGdsb2JhbGAg44Ki44Kv44K744OD44K1XG4gKiBcbiAqIEByZXR1cm5zXG4gKiAgLSBgZW5gIGBnbG9iYWxgIG9iamVjdCBvZiB0aGUgcnVudGltZSBlbnZpcm9ubWVudFxuICogIC0gYGphYCDnkrDlooPjgavlv5zjgZjjgZ8gYGdsb2JhbGAg44Kq44OW44K444Kn44Kv44OIXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRHbG9iYWwoKTogdHlwZW9mIGdsb2JhbFRoaXMge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xuICAgIHJldHVybiAoJ29iamVjdCcgPT09IHR5cGVvZiBnbG9iYWxUaGlzKSA/IGdsb2JhbFRoaXMgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xufVxuXG4vKipcbiAqIEBlbiBFbnN1cmUgbmFtZWQgb2JqZWN0IGFzIHBhcmVudCdzIHByb3BlcnR5LlxuICogQGphIOimquOCquODluOCuOOCp+OCr+ODiOOCkuaMh+WumuOBl+OBpiwg5ZCN5YmN44Gr5oyH5a6a44GX44Gf44Kq44OW44K444Kn44Kv44OI44Gu5a2Y5Zyo44KS5L+d6Ki8XG4gKlxuICogQHBhcmFtIHBhcmVudFxuICogIC0gYGVuYCBwYXJlbnQgb2JqZWN0LiBJZiBudWxsIGdpdmVuLCBgZ2xvYmFsVGhpc2AgaXMgYXNzaWduZWQuXG4gKiAgLSBgamFgIOimquOCquODluOCuOOCp+OCr+ODiC4gbnVsbCDjga7loLTlkIjjga8gYGdsb2JhbFRoaXNgIOOBjOS9v+eUqOOBleOCjOOCi1xuICogQHBhcmFtIG5hbWVzXG4gKiAgLSBgZW5gIG9iamVjdCBuYW1lIGNoYWluIGZvciBlbnN1cmUgaW5zdGFuY2UuXG4gKiAgLSBgamFgIOS/neiovOOBmeOCi+OCquODluOCuOOCp+OCr+ODiOOBruWQjeWJjVxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlT2JqZWN0PFQgZXh0ZW5kcyB7fSA9IHt9PihwYXJlbnQ6IG9iamVjdCB8IG51bGwsIC4uLm5hbWVzOiBzdHJpbmdbXSk6IFQge1xuICAgIGxldCByb290ID0gcGFyZW50IHx8IGdldEdsb2JhbCgpO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcykge1xuICAgICAgICByb290W25hbWVdID0gcm9vdFtuYW1lXSB8fCB7fTtcbiAgICAgICAgcm9vdCA9IHJvb3RbbmFtZV07XG4gICAgfVxuICAgIHJldHVybiByb290IGFzIFQ7XG59XG5cbi8qKlxuICogQGVuIEdsb2JhbCBuYW1lc3BhY2UgYWNjZXNzb3IuXG4gKiBAamEg44Kw44Ot44O844OQ44Or44ON44O844Og44K544Oa44O844K544Ki44Kv44K744OD44K1XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRHbG9iYWxOYW1lc3BhY2U8VCBleHRlbmRzIHt9ID0ge30+KG5hbWVzcGFjZTogc3RyaW5nKTogVCB7XG4gICAgcmV0dXJuIGVuc3VyZU9iamVjdDxUPihudWxsLCBuYW1lc3BhY2UpO1xufVxuXG4vKipcbiAqIEBlbiBHbG9iYWwgY29uZmlnIGFjY2Vzc29yLlxuICogQGphIOOCsOODreODvOODkOODq+OCs+ODs+ODleOCo+OCsOOCouOCr+OCu+ODg+OCtVxuICpcbiAqIEByZXR1cm5zIGRlZmF1bHQ6IGBDRFAuQ29uZmlnYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnPFQgZXh0ZW5kcyB7fSA9IHt9PihuYW1lc3BhY2UgPSAnQ0RQJywgY29uZmlnTmFtZSA9ICdDb25maWcnKTogVCB7XG4gICAgcmV0dXJuIGVuc3VyZU9iamVjdDxUPihnZXRHbG9iYWxOYW1lc3BhY2UobmFtZXNwYWNlKSwgY29uZmlnTmFtZSk7XG59XG4iLCIvKiBlc2xpbnQtZGlzYWJsZVxuICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICovXG5cbi8qKlxuICogQGVuIFRoZSBnZW5lcmFsIG51bGwgdHlwZS5cbiAqIEBqYSDnqbrjgpLnpLrjgZnlnovlrprnvqlcbiAqL1xuZXhwb3J0IHR5cGUgTmlsID0gdm9pZCB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbi8qKlxuICogQGVuIFRoZSB0eXBlIG9mIG9iamVjdCBvciBbW05pbF1dLlxuICogQGphIFtbTmlsXV0g44Gr44Gq44KK44GI44KL44Kq44OW44K444Kn44Kv44OI5Z6L5a6a576pXG4gKi9cbmV4cG9ydCB0eXBlIE5pbGxhYmxlPFQgZXh0ZW5kcyB7fT4gPSBUIHwgTmlsO1xuXG4vKipcbiAqIEBlbiBQcmltaXRpdmUgdHlwZSBvZiBKYXZhU2NyaXB0LlxuICogQGphIEphdmFTY3JpcHQg44Gu44OX44Oq44Of44OG44Kj44OW5Z6LXG4gKi9cbmV4cG9ydCB0eXBlIFByaW1pdGl2ZSA9IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBzeW1ib2wgfCBudWxsIHwgdW5kZWZpbmVkO1xuXG4vKipcbiAqIEBlbiBKYXZhU2NyaXB0IHR5cGUgc2V0IGludGVyZmFjZS5cbiAqIEBqYSBKYXZhU2NyaXB0IOOBruWei+OBrumbhuWQiFxuICovXG5pbnRlcmZhY2UgVHlwZUxpc3Qge1xuICAgIHN0cmluZzogc3RyaW5nO1xuICAgIG51bWJlcjogbnVtYmVyO1xuICAgIGJvb2xlYW46IGJvb2xlYW47XG4gICAgc3ltYm9sOiBzeW1ib2w7XG4gICAgdW5kZWZpbmVkOiB2b2lkIHwgdW5kZWZpbmVkO1xuICAgIG9iamVjdDogb2JqZWN0IHwgbnVsbDtcbiAgICBmdW5jdGlvbiguLi5hcmdzOiB1bmtub3duW10pOiB1bmtub3duO1xufVxuXG4vKipcbiAqIEBlbiBUaGUga2V5IGxpc3Qgb2YgW1tUeXBlTGlzdF1dLlxuICogQGphIFtbVHlwZUxpc3RdXSDjgq3jg7zkuIDopqdcbiAqL1xuZXhwb3J0IHR5cGUgVHlwZUtleXMgPSBrZXlvZiBUeXBlTGlzdDtcblxuLyoqXG4gKiBAZW4gVHlwZSBiYXNlIGRlZmluaXRpb24uXG4gKiBAamEg5Z6L44Gu6KaP5a6a5a6a576pXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHlwZTxUIGV4dGVuZHMge30+IGV4dGVuZHMgRnVuY3Rpb24ge1xuICAgIHJlYWRvbmx5IHByb3RvdHlwZTogVDtcbn1cblxuLyoqXG4gKiBAZW4gVHlwZSBvZiBjb25zdHJ1Y3Rvci5cbiAqIEBqYSDjgrPjg7Pjgrnjg4jjg6njgq/jgr/lnotcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb25zdHJ1Y3RvcjxUPiBleHRlbmRzIFR5cGU8VD4ge1xuICAgIG5ldyguLi5hcmdzOiB1bmtub3duW10pOiBUO1xufVxuXG4vKipcbiAqIEBlbiBUeXBlIG9mIGNsYXNzLlxuICogQGphIOOCr+ODqeOCueWei1xuICovXG5leHBvcnQgdHlwZSBDbGFzczxUID0gYW55PiA9IENvbnN0cnVjdG9yPFQ+O1xuXG4vKipcbiAqIEBlbiBFbnN1cmUgZm9yIGZ1bmN0aW9uIHBhcmFtZXRlcnMgdG8gdHVwbGUuXG4gKiBAamEg6Zai5pWw44OR44Op44Oh44O844K/44Go44GX44GmIHR1cGxlIOOCkuS/neiovFxuICovXG5leHBvcnQgdHlwZSBBcmd1bWVudHM8VD4gPSBUIGV4dGVuZHMgYW55W10gPyBUIDogW1RdO1xuXG4vKipcbiAqIEBlbiBSbW92ZSBgcmVhZG9ubHlgIGF0dHJpYnV0ZXMgZnJvbSBpbnB1dCB0eXBlLlxuICogQGphIGByZWFkb25seWAg5bGe5oCn44KS6Kej6ZmkXG4gKi9cbmV4cG9ydCB0eXBlIFdyaXRhYmxlPFQ+ID0geyAtcmVhZG9ubHkgW0sgaW4ga2V5b2YgVF06IFRbS10gfTtcblxuLyoqXG4gKiBAZW4gRXh0cmFjdCBmdW5jdGlvbmFsIHByb3BlcnR5IG5hbWVzLlxuICogQGphIOmWouaVsOODl+ODreODkeODhuOCo+WQjeOBruaKveWHulxuICovXG5leHBvcnQgdHlwZSBGdW5jdGlvblByb3BlcnR5TmFtZXM8VD4gPSB7IFtLIGluIGtleW9mIFRdOiBUW0tdIGV4dGVuZHMgRnVuY3Rpb24gPyBLIDogbmV2ZXIgfVtrZXlvZiBUXTtcblxuLyoqXG4gKiBAZW4gRXh0cmFjdCBmdW5jdGlvbmFsIHByb3BlcnRpZXMuXG4gKiBAamEg6Zai5pWw44OX44Ot44OR44OG44Kj44Gu5oq95Ye6XG4gKi9cbmV4cG9ydCB0eXBlIEZ1bmN0aW9uUHJvcGVydGllczxUPiA9IFBpY2s8VCwgRnVuY3Rpb25Qcm9wZXJ0eU5hbWVzPFQ+PjtcblxuLyoqXG4gKiBAZW4gRXh0cmFjdCBub24tZnVuY3Rpb25hbCBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBqYSDpnZ7plqLmlbDjg5fjg63jg5Hjg4bjgqPlkI3jga7mir3lh7pcbiAqL1xuZXhwb3J0IHR5cGUgTm9uRnVuY3Rpb25Qcm9wZXJ0eU5hbWVzPFQ+ID0geyBbSyBpbiBrZXlvZiBUXTogVFtLXSBleHRlbmRzIEZ1bmN0aW9uID8gbmV2ZXIgOiBLIH1ba2V5b2YgVF07XG5cbi8qKlxuICogQGVuIEV4dHJhY3Qgbm9uLWZ1bmN0aW9uYWwgcHJvcGVydGllcy5cbiAqIEBqYSDpnZ7plqLmlbDjg5fjg63jg5Hjg4bjgqPjga7mir3lh7pcbiAqL1xuZXhwb3J0IHR5cGUgTm9uRnVuY3Rpb25Qcm9wZXJ0aWVzPFQ+ID0gUGljazxULCBOb25GdW5jdGlvblByb3BlcnR5TmFtZXM8VD4+O1xuXG4vKipcbiAqIEBlbiBFeHRyYWN0IG9iamVjdCBrZXkgbGlzdC4gKGBrZXlvZmAgYWxpYXMpXG4gKiBAamEg44Kq44OW44K444Kn44Kv44OI44Gu44Kt44O85LiA6Kan44KS5oq95Ye6IChga2V5b2ZgIGFsaWFzKVxuICovXG5leHBvcnQgdHlwZSBLZXlzPFQgZXh0ZW5kcyB7fT4gPSBrZXlvZiBUO1xuXG4vKipcbiAqIEBlbiBFeHRyYWN0IG9iamVjdCB0eXBlIGxpc3QuXG4gKiBAamEg44Kq44OW44K444Kn44Kv44OI44Gu5Z6L5LiA6Kan44KS5oq95Ye6XG4gKi9cbmV4cG9ydCB0eXBlIFR5cGVzPFQgZXh0ZW5kcyB7fT4gPSBUW2tleW9mIFRdO1xuXG4vKipcbiAqIEBlbiBDb252ZXJ0IG9iamVjdCBrZXkgdG8gdHlwZS5cbiAqIEBqYSDjgqrjg5bjgrjjgqfjgq/jg4jjgq3jg7zjgYvjgonlnovjgbjlpInmj5tcbiAqL1xuZXhwb3J0IHR5cGUgS2V5VG9UeXBlPE8gZXh0ZW5kcyB7fSwgSyBleHRlbmRzIGtleW9mIE8+ID0gSyBleHRlbmRzIGtleW9mIE8gPyBPW0tdIDogbmV2ZXI7XG5cbi8qKlxuICogQGVuIENvbnZlcnQgb2JqZWN0IHR5cGUgdG8ga2V5LlxuICogQGphIOOCquODluOCuOOCp+OCr+ODiOWei+OBi+OCieOCreODvOOBuOWkieaPm1xuICovXG5leHBvcnQgdHlwZSBUeXBlVG9LZXk8TyBleHRlbmRzIHt9LCBUIGV4dGVuZHMgVHlwZXM8Tz4+ID0geyBbSyBpbiBrZXlvZiBPXTogT1tLXSBleHRlbmRzIFQgPyBLIDogbmV2ZXIgfVtrZXlvZiBPXTtcblxuLyoqXG4gKiBAZW4gVGhlIFtbUGxhaW5PYmplY3RdXSB0eXBlIGlzIGEgSmF2YVNjcmlwdCBvYmplY3QgY29udGFpbmluZyB6ZXJvIG9yIG1vcmUga2V5LXZhbHVlIHBhaXJzLiA8YnI+XG4gKiAgICAgJ1BsYWluJyBtZWFucyBpdCBmcm9tIG90aGVyIGtpbmRzIG9mIEphdmFTY3JpcHQgb2JqZWN0cy4gZXg6IG51bGwsIHVzZXItZGVmaW5lZCBhcnJheXMsIGFuZCBob3N0IG9iamVjdHMgc3VjaCBhcyBgZG9jdW1lbnRgLlxuICogQGphIDAg5Lul5LiK44GuIGtleS12YWx1ZSDjg5rjgqLjgpLmjIHjgaQgW1tQbGFpbk9iamVjdF1dIOWumue+qSA8YnI+VGhlIFBsYWluT2JqZWN0IHR5cGUgaXMgYSBKYXZhU2NyaXB0IG9iamVjdCBjb250YWluaW5nIHplcm8gb3IgbW9yZSBrZXktdmFsdWUgcGFpcnMuIDxicj5cbiAqICAgICAnUGxhaW4nIOOBqOOBr+S7luOBrueorumhnuOBriBKYXZhU2NyaXB0IOOCquODluOCuOOCp+OCr+ODiOOCkuWQq+OBvuOBquOBhOOCquODluOCuOOCp+OCr+ODiOOCkuaEj+WRs+OBmeOCiy4g5L6LOiAgbnVsbCwg44Om44O844K244O85a6a576p6YWN5YiXLCDjgb7jgZ/jga8gYGRvY3VtZW50YCDjga7jgojjgYbjgarntYTjgb/ovrzjgb/jgqrjg5bjgrjjgqfjgq/jg4hcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQbGFpbk9iamVjdDxUID0gYW55PiB7XG4gICAgW2tleTogc3RyaW5nXTogVDtcbn1cblxuLyoqXG4gKiBAZW4gVGhlIGRhdGEgdHlwZSBsaXN0IGJ5IHdoaWNoIHN0eWxlIGNvbXB1bHNpb24gaXMgcG9zc2libGUuXG4gKiBAamEg5Z6L5by35Yi25Y+v6IO944Gq44OH44O844K/5Z6L5LiA6KanXG4gKi9cbmV4cG9ydCB0eXBlIFR5cGVkRGF0YSA9IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBudWxsIHwgb2JqZWN0O1xuXG4vKipcbiAqIEBlbiBUaGUgZGF0YSB0eXBlIGxpc3Qgb2YgVHlwZWRBcnJheS5cbiAqIEBqYSBUeXBlZEFycmF5IOS4gOimp1xuICovXG5leHBvcnQgdHlwZSBUeXBlZEFycmF5ID0gSW50OEFycmF5IHwgVWludDhBcnJheSB8IFVpbnQ4Q2xhbXBlZEFycmF5IHwgSW50MTZBcnJheSB8IFVpbnQxNkFycmF5IHwgSW50MzJBcnJheSB8IFVpbnQzMkFycmF5IHwgRmxvYXQzMkFycmF5IHwgRmxvYXQ2NEFycmF5O1xuXG4vL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fLy9cblxuLyoqXG4gKiBAZW4gQ2hlY2sgdGhlIHZhbHVlIGV4aXN0cy5cbiAqIEBqYSDlgKTjgYzlrZjlnKjjgZnjgovjgYvliKTlrppcbiAqXG4gKiBAcGFyYW0geFxuICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGlzdHM8TyBleHRlbmRzIHt9Pih4OiBOaWxsYWJsZTxPPik6IHggaXMgTztcbmV4cG9ydCBmdW5jdGlvbiBleGlzdHMoeDogdW5rbm93bik6IHggaXMgdW5rbm93bjtcbmV4cG9ydCBmdW5jdGlvbiBleGlzdHMoeDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbnVsbCAhPSB4O1xufVxuXG4vKipcbiAqIEBlbiBDaGVjayB0aGUgdmFsdWUtdHlwZSBpcyBbW05pbF1dLlxuICogQGphIFtbTmlsXV0g5Z6L44Gn44GC44KL44GL5Yik5a6aXG4gKlxuICogQHBhcmFtIHhcbiAqICAtIGBlbmAgZXZhbHVhdGVkIHZhbHVlXG4gKiAgLSBgamFgIOipleS+oeOBmeOCi+WApFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOaWwoeDogdW5rbm93bik6IHggaXMgTmlsIHtcbiAgICByZXR1cm4gbnVsbCA9PSB4O1xufVxuXG4vKipcbiAqIEBlbiBDaGVjayB0aGUgdmFsdWUtdHlwZSBpcyBTdHJpbmcuXG4gKiBAamEgU3RyaW5nIOWei+OBp+OBguOCi+OBi+WIpOWumlxuICpcbiAqIEBwYXJhbSB4XG4gKiAgLSBgZW5gIGV2YWx1YXRlZCB2YWx1ZVxuICogIC0gYGphYCDoqZXkvqHjgZnjgovlgKRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nKHg6IHVua25vd24pOiB4IGlzIHN0cmluZyB7XG4gICAgcmV0dXJuICdzdHJpbmcnID09PSB0eXBlb2YgeDtcbn1cblxuLyoqXG4gKiBAZW4gQ2hlY2sgdGhlIHZhbHVlLXR5cGUgaXMgTnVtYmVyLlxuICogQGphIE51bWJlciDlnovjgafjgYLjgovjgYvliKTlrppcbiAqXG4gKiBAcGFyYW0geFxuICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc051bWJlcih4OiB1bmtub3duKTogeCBpcyBudW1iZXIge1xuICAgIHJldHVybiAnbnVtYmVyJyA9PT0gdHlwZW9mIHg7XG59XG5cbi8qKlxuICogQGVuIENoZWNrIHRoZSB2YWx1ZS10eXBlIGlzIEJvb2xlYW4uXG4gKiBAamEgQm9vbGVhbiDlnovjgafjgYLjgovjgYvliKTlrppcbiAqXG4gKiBAcGFyYW0geFxuICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Jvb2xlYW4oeDogdW5rbm93bik6IHggaXMgYm9vbGVhbiB7XG4gICAgcmV0dXJuICdib29sZWFuJyA9PT0gdHlwZW9mIHg7XG59XG5cbi8qKlxuICogQGVuIENoZWNrIHRoZSB2YWx1ZS10eXBlIGlzIFN5bWJsZS5cbiAqIEBqYSBTeW1ib2wg5Z6L44Gn44GC44KL44GL5Yik5a6aXG4gKlxuICogQHBhcmFtIHhcbiAqICAtIGBlbmAgZXZhbHVhdGVkIHZhbHVlXG4gKiAgLSBgamFgIOipleS+oeOBmeOCi+WApFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTeW1ib2woeDogdW5rbm93bik6IHggaXMgc3ltYm9sIHtcbiAgICByZXR1cm4gJ3N5bWJvbCcgPT09IHR5cGVvZiB4O1xufVxuXG4vKipcbiAqIEBlbiBDaGVjayB0aGUgdmFsdWUtdHlwZSBpcyBwcmltaXRpdmUgdHlwZS5cbiAqIEBqYSDjg5fjg6rjg5/jg4bjgqPjg5blnovjgafjgYLjgovjgYvliKTlrppcbiAqXG4gKiBAcGFyYW0geFxuICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ByaW1pdGl2ZSh4OiB1bmtub3duKTogeCBpcyBQcmltaXRpdmUge1xuICAgIHJldHVybiAheCB8fCAoJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIHgpICYmICgnb2JqZWN0JyAhPT0gdHlwZW9mIHgpO1xufVxuXG4vKipcbiAqIEBlbiBDaGVjayB0aGUgdmFsdWUtdHlwZSBpcyBBcnJheS5cbiAqIEBqYSBBcnJheSDlnovjgafjgYLjgovjgYvliKTlrppcbiAqXG4gKiBAcGFyYW0geFxuICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gKi9cbmV4cG9ydCBjb25zdCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvdW5ib3VuZC1tZXRob2RcblxuLyoqXG4gKiBAZW4gQ2hlY2sgdGhlIHZhbHVlLXR5cGUgaXMgT2JqZWN0LlxuICogQGphIE9iamVjdCDlnovjgafjgYLjgovjgYvliKTlrppcbiAqXG4gKiBAcGFyYW0geFxuICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdCh4OiB1bmtub3duKTogeCBpcyBvYmplY3Qge1xuICAgIHJldHVybiBCb29sZWFuKHgpICYmICdvYmplY3QnID09PSB0eXBlb2YgeDtcbn1cblxuLyoqXG4gKiBAZW4gQ2hlY2sgdGhlIHZhbHVlLXR5cGUgaXMgW1tQbGFpbk9iamVjdF1dLlxuICogQGphIFtbUGxhaW5PYmplY3RdXSDlnovjgafjgYLjgovjgYvliKTlrppcbiAqXG4gKiBAcGFyYW0geFxuICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KHg6IHVua25vd24pOiB4IGlzIFBsYWluT2JqZWN0IHtcbiAgICBpZiAoIWlzT2JqZWN0KHgpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBjcmVhdGUgZnJvbSBgT2JqZWN0LmNyZWF0ZSggbnVsbCApYCBpcyBwbGFpblxuICAgIGlmICghT2JqZWN0LmdldFByb3RvdHlwZU9mKHgpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBvd25JbnN0YW5jZU9mKE9iamVjdCwgeCk7XG59XG5cbi8qKlxuICogQGVuIENoZWNrIHRoZSB2YWx1ZS10eXBlIGlzIGVtcHR5IG9iamVjdC5cbiAqIEBqYSDnqbrjgqrjg5bjgrjjgqfjgq/jg4jjgafjgYLjgovjgYvliKTlrppcbiAqXG4gKiBAcGFyYW0geFxuICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5T2JqZWN0KHg6IHVua25vd24pOiB4IGlzIG9iamVjdCB7XG4gICAgaWYgKCFpc1BsYWluT2JqZWN0KHgpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBuYW1lIGluIHgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBAZW4gQ2hlY2sgdGhlIHZhbHVlLXR5cGUgaXMgRnVuY3Rpb24uXG4gKiBAamEgRnVuY3Rpb24g5Z6L44Gn44GC44KL44GL5Yik5a6aXG4gKlxuICogQHBhcmFtIHhcbiAqICAtIGBlbmAgZXZhbHVhdGVkIHZhbHVlXG4gKiAgLSBgamFgIOipleS+oeOBmeOCi+WApFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbih4OiB1bmtub3duKTogeCBpcyBUeXBlTGlzdFsnZnVuY3Rpb24nXSB7XG4gICAgcmV0dXJuICdmdW5jdGlvbicgPT09IHR5cGVvZiB4O1xufVxuXG4vKipcbiAqIEBlbiBDaGVjayB0aGUgdmFsdWUtdHlwZSBpcyBpbnB1dC5cbiAqIEBqYSDmjIflrprjgZfjgZ/lnovjgafjgYLjgovjgYvliKTlrppcbiAqXG4gKiBAcGFyYW0gdHlwZVxuICogIC0gYGVuYCBldmFsdWF0ZWQgdHlwZVxuICogIC0gYGphYCDoqZXkvqHjgZnjgovlnotcbiAqIEBwYXJhbSB4XG4gKiAgLSBgZW5gIGV2YWx1YXRlZCB2YWx1ZVxuICogIC0gYGphYCDoqZXkvqHjgZnjgovlgKRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHR5cGVPZjxLIGV4dGVuZHMgVHlwZUtleXM+KHR5cGU6IEssIHg6IHVua25vd24pOiB4IGlzIFR5cGVMaXN0W0tdIHtcbiAgICByZXR1cm4gdHlwZW9mIHggPT09IHR5cGU7XG59XG5cbi8qKlxuICogQGVuIENoZWNrIHRoZSB2YWx1ZSBoYXMgaXRlcmF0b3IuXG4gKiBAamEgaXRlcmF0b3Ig44KS5omA5pyJ44GX44Gm44GE44KL44GL5Yik5a6aXG4gKlxuICogQHBhcmFtIHhcbiAqICAtIGBlbmAgZXZhbHVhdGVkIHZhbHVlXG4gKiAgLSBgamFgIOipleS+oeOBmeOCi+WApFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNJdGVyYWJsZTxUPih4OiBOaWxsYWJsZTxJdGVyYWJsZTxUPj4pOiB4IGlzIEl0ZXJhYmxlPFQ+O1xuZXhwb3J0IGZ1bmN0aW9uIGlzSXRlcmFibGUoeDogdW5rbm93bik6IHggaXMgSXRlcmFibGU8dW5rbm93bj47XG5leHBvcnQgZnVuY3Rpb24gaXNJdGVyYWJsZSh4OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KHgpO1xufVxuXG5jb25zdCBfdHlwZWRBcnJheU5hbWVzID0ge1xuICAgICdJbnQ4QXJyYXknOiB0cnVlLFxuICAgICdVaW50OEFycmF5JzogdHJ1ZSxcbiAgICAnVWludDhDbGFtcGVkQXJyYXknOiB0cnVlLFxuICAgICdJbnQxNkFycmF5JzogdHJ1ZSxcbiAgICAnVWludDE2QXJyYXknOiB0cnVlLFxuICAgICdJbnQzMkFycmF5JzogdHJ1ZSxcbiAgICAnVWludDMyQXJyYXknOiB0cnVlLFxuICAgICdGbG9hdDMyQXJyYXknOiB0cnVlLFxuICAgICdGbG9hdDY0QXJyYXknOiB0cnVlLFxufTtcblxuLyoqXG4gKiBAZW4gQ2hlY2sgdGhlIHZhbHVlIGlzIG9uZSBvZiBbW1R5cGVkQXJyYXldXS5cbiAqIEBqYSDmjIflrprjgZfjgZ/jgqTjg7Pjgrnjgr/jg7PjgrnjgYwgW1tUeXBlZEFycmF5XV0g44Gu5LiA56iu44Gn44GC44KL44GL5Yik5a6aXG4gKlxuICogQHBhcmFtIHhcbiAqICAtIGBlbmAgZXZhbHVhdGVkIHZhbHVlXG4gKiAgLSBgamFgIOipleS+oeOBmeOCi+WApFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNUeXBlZEFycmF5KHg6IHVua25vd24pOiB4IGlzIFR5cGVkQXJyYXkge1xuICAgIHJldHVybiAhIV90eXBlZEFycmF5TmFtZXNbY2xhc3NOYW1lKHgpXTtcbn1cblxuLyoqXG4gKiBAZW4gQ2hlY2sgdGhlIHZhbHVlIGluc3RhbmNlIG9mIGlucHV0LlxuICogQGphIOaMh+WumuOBl+OBn+OCpOODs+OCueOCv+ODs+OCueOBp+OBguOCi+OBi+WIpOWumlxuICpcbiAqIEBwYXJhbSBjdG9yXG4gKiAgLSBgZW5gIGV2YWx1YXRlZCBjb25zdHJ1Y3RvclxuICogIC0gYGphYCDoqZXkvqHjgZnjgovjgrPjg7Pjgrnjg4jjg6njgq/jgr9cbiAqIEBwYXJhbSB4XG4gKiAgLSBgZW5gIGV2YWx1YXRlZCB2YWx1ZVxuICogIC0gYGphYCDoqZXkvqHjgZnjgovlgKRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbmNlT2Y8VCBleHRlbmRzIHt9PihjdG9yOiBOaWxsYWJsZTxUeXBlPFQ+PiwgeDogdW5rbm93bik6IHggaXMgVCB7XG4gICAgcmV0dXJuICgnZnVuY3Rpb24nID09PSB0eXBlb2YgY3RvcikgJiYgKHggaW5zdGFuY2VvZiBjdG9yKTtcbn1cblxuLyoqXG4gKiBAZW4gQ2hlY2sgdGhlIHZhbHVlIGluc3RhbmNlIG9mIGlucHV0IGNvbnN0cnVjdG9yIChleGNlcHQgc3ViIGNsYXNzKS5cbiAqIEBqYSDmjIflrprjgrPjg7Pjgrnjg4jjg6njgq/jgr/jga7jgqTjg7Pjgrnjgr/jg7PjgrnjgafjgYLjgovjgYvliKTlrpogKOa0vueUn+OCr+ODqeOCueOBr+WQq+OCgeOBquOBhClcbiAqXG4gKiBAcGFyYW0gY3RvclxuICogIC0gYGVuYCBldmFsdWF0ZWQgY29uc3RydWN0b3JcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL44Kz44Oz44K544OI44Op44Kv44K/XG4gKiBAcGFyYW0geFxuICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvd25JbnN0YW5jZU9mPFQgZXh0ZW5kcyB7fT4oY3RvcjogTmlsbGFibGU8VHlwZTxUPj4sIHg6IHVua25vd24pOiB4IGlzIFQge1xuICAgIHJldHVybiAobnVsbCAhPSB4KSAmJiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGN0b3IpICYmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YoeCkgPT09IE9iamVjdChjdG9yLnByb3RvdHlwZSkpO1xufVxuXG4vKipcbiAqIEBlbiBHZXQgdGhlIHZhbHVlJ3MgY2xhc3MgbmFtZS5cbiAqIEBqYSDjgq/jg6njgrnlkI3jgpLlj5blvpdcbiAqXG4gKiBAcGFyYW0geFxuICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc05hbWUoeDogYW55KTogc3RyaW5nIHtcbiAgICBpZiAoeCAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHRvU3RyaW5nVGFnTmFtZSA9IHhbU3ltYm9sLnRvU3RyaW5nVGFnXTtcbiAgICAgICAgaWYgKGlzU3RyaW5nKHRvU3RyaW5nVGFnTmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0b1N0cmluZ1RhZ05hbWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNGdW5jdGlvbih4KSAmJiB4LnByb3RvdHlwZSAmJiBudWxsICE9IHgubmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHgubmFtZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGN0b3IgPSB4LmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24oY3RvcikgJiYgY3RvciA9PT0gKE9iamVjdChjdG9yLnByb3RvdHlwZSkgYXMgb2JqZWN0KS5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdG9yLm5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeCkgYXMgc3RyaW5nKS5zbGljZSg4LCAtMSk7XG59XG5cbi8qKlxuICogQGVuIENoZWNrIGlucHV0IHZhbHVlcyBhcmUgc2FtZSB2YWx1ZS10eXBlLlxuICogQGphIOWFpeWKm+OBjOWQjOS4gOWei+OBp+OBguOCi+OBi+WIpOWumlxuICpcbiAqIEBwYXJhbSBsaHNcbiAqICAtIGBlbmAgZXZhbHVhdGVkIHZhbHVlXG4gKiAgLSBgamFgIOipleS+oeOBmeOCi+WApFxuICogQHBhcmFtIHJoc1xuICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW1lVHlwZShsaHM6IHVua25vd24sIHJoczogdW5rbm93bik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0eXBlb2YgbGhzID09PSB0eXBlb2YgcmhzO1xufVxuXG4vKipcbiAqIEBlbiBDaGVjayBpbnB1dCB2YWx1ZXMgYXJlIHNhbWUgY2xhc3MuXG4gKiBAamEg5YWl5Yqb44GM5ZCM5LiA44Kv44Op44K544Gn44GC44KL44GL5Yik5a6aXG4gKlxuICogQHBhcmFtIGxoc1xuICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gKiBAcGFyYW0gcmhzXG4gKiAgLSBgZW5gIGV2YWx1YXRlZCB2YWx1ZVxuICogIC0gYGphYCDoqZXkvqHjgZnjgovlgKRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbWVDbGFzcyhsaHM6IHVua25vd24sIHJoczogdW5rbm93bik6IGJvb2xlYW4ge1xuICAgIGlmIChudWxsID09IGxocyAmJiBudWxsID09IHJocykge1xuICAgICAgICByZXR1cm4gY2xhc3NOYW1lKGxocykgPT09IGNsYXNzTmFtZShyaHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAobnVsbCAhPSBsaHMpICYmIChudWxsICE9IHJocykgJiYgKE9iamVjdC5nZXRQcm90b3R5cGVPZihsaHMpID09PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YocmhzKSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBlbiBDb21tb24gU3ltYmxlIGZvciBmcmFtZXdvcmsuXG4gKiBAamEg44OV44Os44O844Og44Ov44O844Kv44GM5YWx6YCa44Gn5L2/55So44GZ44KLIFN5bWJsZVxuICovXG5leHBvcnQgY29uc3QgJGNkcCA9IFN5bWJvbCgnQGNkcCcpO1xuIiwiaW1wb3J0IHtcbiAgICBUeXBlS2V5cyxcbiAgICBpc0FycmF5LFxuICAgIGV4aXN0cyxcbiAgICBjbGFzc05hbWUsXG59IGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqIEBlbiBUeXBlIHZlcmlmaWVyIGludGVyZmFjZSBkZWZpbml0aW9uLiA8YnI+XG4gKiAgICAgSWYgaW52YWxpZCB2YWx1ZSByZWNlaXZlZCwgdGhlIG1ldGhvZCB0aHJvd3MgYFR5cGVFcnJvcmAuXG4gKiBAamEg5Z6L5qSc6Ki844Gu44Kk44Oz44K/44O844OV44Kn44Kk44K55a6a576pIDxicj5cbiAqICAgICDpgZXlj43jgZfjgZ/loLTlkIjjga8gYFR5cGVFcnJvcmAg44KS55m655SfXG4gKlxuICpcbiAqL1xuaW50ZXJmYWNlIFZlcmlmaWVyIHtcbiAgICAvKipcbiAgICAgKiBAZW4gVmVyaWZpY2F0aW9uIGZvciB0aGUgaW5wdXQgdmFsdWUgaXMgbm90IFtbTmlsXV0uXG4gICAgICogQGphIFtbTmlsXV0g44Gn44Gq44GE44GT44Go44KS5qSc6Ki8XG4gICAgICpcbiAgICAgKiBAcGFyYW0gbm90TmlsLnhcbiAgICAgKiAgLSBgZW5gIGV2YWx1YXRlZCB2YWx1ZVxuICAgICAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gICAgICogQHBhcmFtIG5vdE5pbC5tZXNzYWdlXG4gICAgICogIC0gYGVuYCBjdXN0b20gZXJyb3IgbWVzc2FnZVxuICAgICAqICAtIGBqYWAg44Kr44K544K/44Og44Ko44Op44O844Oh44OD44K744O844K4XG4gICAgICovXG4gICAgbm90TmlsOiAoeDogdW5rbm93biwgbWVzc2FnZT86IHN0cmluZyB8IG51bGwpID0+IHZvaWQgfCBuZXZlcjtcblxuICAgIC8qKlxuICAgICAqIEBlbiBWZXJpZmljYXRpb24gZm9yIHRoZSBpbnB1dCBpcyBbW1R5cGVLZXlzXV0uXG4gICAgICogQGphIOaMh+WumuOBl+OBnyBbW1R5cGVLZXlzXV0g44Gn44GC44KL44GL5qSc6Ki8XG4gICAgICpcbiAgICAgKiBAcGFyYW0gdHlwZU9mLnR5cGVcbiAgICAgKiAgLSBgZW5gIG9uZSBvZiBbW1R5cGVLZXlzXV1cbiAgICAgKiAgLSBgamFgIFtbVHlwZUtleXNdXSDjgpLmjIflrppcbiAgICAgKiBAcGFyYW0gdHlwZU9mLnhcbiAgICAgKiAgLSBgZW5gIGV2YWx1YXRlZCB2YWx1ZVxuICAgICAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gICAgICogQHBhcmFtIHR5cGVPZi5tZXNzYWdlXG4gICAgICogIC0gYGVuYCBjdXN0b20gZXJyb3IgbWVzc2FnZVxuICAgICAqICAtIGBqYWAg44Kr44K544K/44Og44Ko44Op44O844Oh44OD44K744O844K4XG4gICAgICovXG4gICAgdHlwZU9mOiAodHlwZTogVHlwZUtleXMsIHg6IHVua25vd24sIG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsKSA9PiB2b2lkIHwgbmV2ZXI7XG5cbiAgICAvKipcbiAgICAgKiBAZW4gVmVyaWZpY2F0aW9uIGZvciB0aGUgaW5wdXQgdmFsdWUgaXMgYEFycmF5YC5cbiAgICAgKiBAamEgYEFycmF5YCDjgafjgYLjgovjgYvmpJzoqLxcbiAgICAgKlxuICAgICAqIEBwYXJhbSBhcnJheS54XG4gICAgICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAgICAgKiAgLSBgamFgIOipleS+oeOBmeOCi+WApFxuICAgICAqIEBwYXJhbSBhcnJheS5tZXNzYWdlXG4gICAgICogIC0gYGVuYCBjdXN0b20gZXJyb3IgbWVzc2FnZVxuICAgICAqICAtIGBqYWAg44Kr44K544K/44Og44Ko44Op44O844Oh44OD44K744O844K4XG4gICAgICovXG4gICAgYXJyYXk6ICh4OiB1bmtub3duLCBtZXNzYWdlPzogc3RyaW5nIHwgbnVsbCkgPT4gdm9pZCB8IG5ldmVyO1xuXG4gICAgLyoqXG4gICAgICogQGVuIFZlcmlmaWNhdGlvbiBmb3IgdGhlIGlucHV0IHZhbHVlIGlzIGBJdGVyYWJsZWAuXG4gICAgICogQGphIGBJdGVyYWJsZWAg44Gn44GC44KL44GL5qSc6Ki8XG4gICAgICpcbiAgICAgKiBAcGFyYW0gaXRlcmFibGUueFxuICAgICAqICAtIGBlbmAgZXZhbHVhdGVkIHZhbHVlXG4gICAgICogIC0gYGphYCDoqZXkvqHjgZnjgovlgKRcbiAgICAgKiBAcGFyYW0gaXRlcmFibGUubWVzc2FnZVxuICAgICAqICAtIGBlbmAgY3VzdG9tIGVycm9yIG1lc3NhZ2VcbiAgICAgKiAgLSBgamFgIOOCq+OCueOCv+ODoOOCqOODqeODvOODoeODg+OCu+ODvOOCuFxuICAgICAqL1xuICAgIGl0ZXJhYmxlOiAoeDogdW5rbm93biwgbWVzc2FnZT86IHN0cmluZyB8IG51bGwpID0+IHZvaWQgfCBuZXZlcjtcblxuICAgIC8qKlxuICAgICAqIEBlbiBWZXJpZmljYXRpb24gZm9yIHRoZSBpbnB1dCBpbnN0YW5jZSBpcyBlcXVhbCBjb21wYXJhdGl2ZSB0YXJnZXQgY29uc3RydWN0b3IuXG4gICAgICogQGphIOaMh+WumuOCs+ODs+OCueODiOODqeOCr+OCv+OBruOCpOODs+OCueOCv+ODs+OCueOBp+OBguOCi+OBi+aknOiovFxuICAgICAqXG4gICAgICogQHBhcmFtIGluc3RhbmNlT2YuY3RvclxuICAgICAqICAtIGBlbmAgY29tcGFyYXRpdmUgdGFyZ2V0IGNvbnN0cnVjdG9yXG4gICAgICogIC0gYGphYCDmr5TovIPlr77osaHjga7jgrPjg7Pjgrnjg4jjg6njgq/jgr9cbiAgICAgKiBAcGFyYW0gaW5zdGFuY2VPZi54XG4gICAgICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAgICAgKiAgLSBgamFgIOipleS+oeOBmeOCi+WApFxuICAgICAqIEBwYXJhbSBpbnN0YW5jZU9mLm1lc3NhZ2VcbiAgICAgKiAgLSBgZW5gIGN1c3RvbSBlcnJvciBtZXNzYWdlXG4gICAgICogIC0gYGphYCDjgqvjgrnjgr/jg6Djgqjjg6njg7zjg6Hjg4Pjgrvjg7zjgrhcbiAgICAgKi9cbiAgICBpbnN0YW5jZU9mOiAoY3RvcjogRnVuY3Rpb24sIHg6IHVua25vd24sIG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsKSA9PiB2b2lkIHwgbmV2ZXI7XG5cbiAgICAvKipcbiAgICAgKiBAZW4gVmVyaWZpY2F0aW9uIGZvciB0aGUgaW5wdXQgaW5zdGFuY2UgaGFzIGBzdHJpY3RseWAgY29tcGFyYXRpdmUgdGFyZ2V0IGNvbnN0cnVjdG9yLlxuICAgICAqIEBqYSDmjIflrprjgrPjg7Pjgrnjg4jjg6njgq/jgr/jga7ljrPlr4bkuIDoh7TjgZfjgZ/jgqTjg7Pjgrnjgr/jg7PjgrnjgafjgYLjgovjgYvmpJzoqLxcbiAgICAgKlxuICAgICAqIEBwYXJhbSBvd25JbnN0YW5jZU9mLmN0b3JcbiAgICAgKiAgLSBgZW5gIGNvbXBhcmF0aXZlIHRhcmdldCBjb25zdHJ1Y3RvclxuICAgICAqICAtIGBqYWAg5q+U6LyD5a++6LGh44Gu44Kz44Oz44K544OI44Op44Kv44K/XG4gICAgICogQHBhcmFtIG93bkluc3RhbmNlT2YueFxuICAgICAqICAtIGBlbmAgZXZhbHVhdGVkIHZhbHVlXG4gICAgICogIC0gYGphYCDoqZXkvqHjgZnjgovlgKRcbiAgICAgKiBAcGFyYW0gb3duSW5zdGFuY2VPZi5tZXNzYWdlXG4gICAgICogIC0gYGVuYCBjdXN0b20gZXJyb3IgbWVzc2FnZVxuICAgICAqICAtIGBqYWAg44Kr44K544K/44Og44Ko44Op44O844Oh44OD44K744O844K4XG4gICAgICovXG4gICAgb3duSW5zdGFuY2VPZjogKGN0b3I6IEZ1bmN0aW9uLCB4OiB1bmtub3duLCBtZXNzYWdlPzogc3RyaW5nIHwgbnVsbCkgPT4gdm9pZCB8IG5ldmVyO1xuXG4gICAgLyoqXG4gICAgICogQGVuIFZlcmlmaWNhdGlvbiBmb3IgdGhlIGlucHV0IGluc3RhbmNlIGhhcyBub3QgYHN0cmljdGx5YCBlcXVhbCBjb21wYXJhdGl2ZSB0YXJnZXQgY29uc3RydWN0b3IuXG4gICAgICogQGphIOaMh+WumuOCs+ODs+OCueODiOODqeOCr+OCv+OCkuaMgeOBpOOCpOODs+OCueOCv+ODs+OCueOBp+OBquOBhOOBk+OBqOOCkuaknOiovFxuICAgICAqXG4gICAgICogQHBhcmFtIG5vdE93bkluc3RhbmNlT2YuY3RvclxuICAgICAqICAtIGBlbmAgY29tcGFyYXRpdmUgdGFyZ2V0IGNvbnN0cnVjdG9yXG4gICAgICogIC0gYGphYCDmr5TovIPlr77osaHjga7jgrPjg7Pjgrnjg4jjg6njgq/jgr9cbiAgICAgKiBAcGFyYW0gbm90T3duSW5zdGFuY2VPZi54XG4gICAgICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAgICAgKiAgLSBgamFgIOipleS+oeOBmeOCi+WApFxuICAgICAqIEBwYXJhbSBub3RPd25JbnN0YW5jZU9mLm1lc3NhZ2VcbiAgICAgKiAgLSBgZW5gIGN1c3RvbSBlcnJvciBtZXNzYWdlXG4gICAgICogIC0gYGphYCDjgqvjgrnjgr/jg6Djgqjjg6njg7zjg6Hjg4Pjgrvjg7zjgrhcbiAgICAgKi9cbiAgICBub3RPd25JbnN0YW5jZU9mOiAoY3RvcjogRnVuY3Rpb24sIHg6IHVua25vd24sIG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsKSA9PiB2b2lkIHwgbmV2ZXI7XG5cbiAgICAvKipcbiAgICAgKiBAZW4gVmVyaWZpY2F0aW9uIGZvciB0aGUgaW5wdXQgdmFsdWUgaGFzIHNwZWNpZmllZCBwcm9wZXJ0eS5cbiAgICAgKiBAamEg5oyH5a6a44OX44Ot44OR44OG44Kj44KS5oyB44Gj44Gm44GE44KL44GL5qSc6Ki8XG4gICAgICpcbiAgICAgKiBAcGFyYW0gaGFzUHJvcGVydHkucHJvcFxuICAgICAqICAtIGBlbmAgc3BlY2lmaWVkIHByb3BlcnR5XG4gICAgICogIC0gYGphYCDlr77osaHjga7jg5fjg63jg5Hjg4bjgqNcbiAgICAgKiBAcGFyYW0gaGFzUHJvcGVydHkueFxuICAgICAqICAtIGBlbmAgZXZhbHVhdGVkIHZhbHVlXG4gICAgICogIC0gYGphYCDoqZXkvqHjgZnjgovlgKRcbiAgICAgKiBAcGFyYW0gaGFzUHJvcGVydHkubWVzc2FnZVxuICAgICAqICAtIGBlbmAgY3VzdG9tIGVycm9yIG1lc3NhZ2VcbiAgICAgKiAgLSBgamFgIOOCq+OCueOCv+ODoOOCqOODqeODvOODoeODg+OCu+ODvOOCuFxuICAgICAqL1xuICAgIGhhc1Byb3BlcnR5OiAoeDogdW5rbm93biwgcHJvcDogUHJvcGVydHlLZXksIG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsKSA9PiB2b2lkIHwgbmV2ZXI7XG5cbiAgICAvKipcbiAgICAgKiBAZW4gVmVyaWZpY2F0aW9uIGZvciB0aGUgaW5wdXQgdmFsdWUgaGFzIG93biBzcGVjaWZpZWQgcHJvcGVydHkuXG4gICAgICogQGphIOaMh+WumuODl+ODreODkeODhuOCo+OCkuWFpeWKm+WApOiHqui6q+aMgeOBo+OBpuOBhOOCi+OBi+aknOiovFxuICAgICAqXG4gICAgICogQHBhcmFtIGhhc093blByb3BlcnR5LnByb3BcbiAgICAgKiAgLSBgZW5gIHNwZWNpZmllZCBwcm9wZXJ0eVxuICAgICAqICAtIGBqYWAg5a++6LGh44Gu44OX44Ot44OR44OG44KjXG4gICAgICogQHBhcmFtIGhhc093blByb3BlcnR5LnhcbiAgICAgKiAgLSBgZW5gIGV2YWx1YXRlZCB2YWx1ZVxuICAgICAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gICAgICogQHBhcmFtIGhhc093blByb3BlcnR5Lm1lc3NhZ2VcbiAgICAgKiAgLSBgZW5gIGN1c3RvbSBlcnJvciBtZXNzYWdlXG4gICAgICogIC0gYGphYCDjgqvjgrnjgr/jg6Djgqjjg6njg7zjg6Hjg4Pjgrvjg7zjgrhcbiAgICAgKi9cbiAgICBoYXNPd25Qcm9wZXJ0eTogKHg6IHVua25vd24sIHByb3A6IFByb3BlcnR5S2V5LCBtZXNzYWdlPzogc3RyaW5nIHwgbnVsbCkgPT4gdm9pZCB8IG5ldmVyO1xufVxuXG4vKipcbiAqIEBlbiBMaXN0IG9mIG1ldGhvZCBmb3IgdHlwZSB2ZXJpZnkuXG4gKiBAamEg5Z6L5qSc6Ki844GM5o+Q5L6b44GZ44KL44Oh44K944OD44OJ5LiA6KanXG4gKi9cbnR5cGUgVmVyaWZ5TWV0aG9kID0ga2V5b2YgVmVyaWZpZXI7XG5cbi8qKlxuICogQGVuIENvbmNyZXRlIHR5cGUgdmVyaWZpZXIgb2JqZWN0LlxuICogQGphIOWei+aknOiovOWun+ijheOCquODluOCuOOCp+OCr+ODiFxuICpcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBfdmVyaWZpZXI6IFZlcmlmaWVyID0ge1xuICAgIG5vdE5pbDogKHg6IHVua25vd24sIG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsKTogdm9pZCB8IG5ldmVyID0+IHtcbiAgICAgICAgaWYgKG51bGwgPT0geCkge1xuICAgICAgICAgICAgZXhpc3RzKG1lc3NhZ2UpIHx8IChtZXNzYWdlID0gYCR7Y2xhc3NOYW1lKHgpfSBpcyBub3QgYSB2YWxpZCB2YWx1ZS5gKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgdHlwZU9mOiAodHlwZTogVHlwZUtleXMsIHg6IHVua25vd24sIG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsKTogdm9pZCB8IG5ldmVyID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB4ICE9PSB0eXBlKSB7XG4gICAgICAgICAgICBleGlzdHMobWVzc2FnZSkgfHwgKG1lc3NhZ2UgPSBgVHlwZSBvZiAke2NsYXNzTmFtZSh4KX0gaXMgbm90ICR7dHlwZX0uYCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFycmF5OiAoeDogdW5rbm93biwgbWVzc2FnZT86IHN0cmluZyB8IG51bGwpOiB2b2lkIHwgbmV2ZXIgPT4ge1xuICAgICAgICBpZiAoIWlzQXJyYXkoeCkpIHtcbiAgICAgICAgICAgIGV4aXN0cyhtZXNzYWdlKSB8fCAobWVzc2FnZSA9IGAke2NsYXNzTmFtZSh4KX0gaXMgbm90IGFuIEFycmF5LmApO1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBpdGVyYWJsZTogKHg6IHVua25vd24sIG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsKTogdm9pZCB8IG5ldmVyID0+IHtcbiAgICAgICAgaWYgKCEoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh4KSkpIHtcbiAgICAgICAgICAgIGV4aXN0cyhtZXNzYWdlKSB8fCAobWVzc2FnZSA9IGAke2NsYXNzTmFtZSh4KX0gaXMgbm90IGFuIGl0ZXJhYmxlIG9iamVjdC5gKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgaW5zdGFuY2VPZjogKGN0b3I6IEZ1bmN0aW9uLCB4OiB1bmtub3duLCBtZXNzYWdlPzogc3RyaW5nIHwgbnVsbCk6IHZvaWQgfCBuZXZlciA9PiB7XG4gICAgICAgIGlmICghKHggaW5zdGFuY2VvZiBjdG9yKSkge1xuICAgICAgICAgICAgZXhpc3RzKG1lc3NhZ2UpIHx8IChtZXNzYWdlID0gYCR7Y2xhc3NOYW1lKHgpfSBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgJHtjdG9yLm5hbWV9LmApO1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvd25JbnN0YW5jZU9mOiAoY3RvcjogRnVuY3Rpb24sIHg6IHVua25vd24sIG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsKTogdm9pZCB8IG5ldmVyID0+IHtcbiAgICAgICAgaWYgKG51bGwgPT0geCB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoeCkgIT09IE9iamVjdChjdG9yLnByb3RvdHlwZSkpIHtcbiAgICAgICAgICAgIGV4aXN0cyhtZXNzYWdlKSB8fCAobWVzc2FnZSA9IGBUaGUgb2JqZWN0IGlzIG5vdCBvd24gaW5zdGFuY2Ugb2YgJHtjdG9yLm5hbWV9LmApO1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBub3RPd25JbnN0YW5jZU9mOiAoY3RvcjogRnVuY3Rpb24sIHg6IHVua25vd24sIG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsKTogdm9pZCB8IG5ldmVyID0+IHtcbiAgICAgICAgaWYgKG51bGwgIT0geCAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoeCkgPT09IE9iamVjdChjdG9yLnByb3RvdHlwZSkpIHtcbiAgICAgICAgICAgIGV4aXN0cyhtZXNzYWdlKSB8fCAobWVzc2FnZSA9IGBUaGUgb2JqZWN0IGlzIG93biBpbnN0YW5jZSBvZiAke2N0b3IubmFtZX0uYCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGhhc1Byb3BlcnR5OiAoeDogYW55LCBwcm9wOiBQcm9wZXJ0eUtleSwgbWVzc2FnZT86IHN0cmluZyB8IG51bGwpOiB2b2lkIHwgbmV2ZXIgPT4geyAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgaWYgKG51bGwgPT0geCB8fCAhKHByb3AgaW4geCkpIHtcbiAgICAgICAgICAgIGV4aXN0cyhtZXNzYWdlKSB8fCAobWVzc2FnZSA9IGBUaGUgb2JqZWN0IGRvZXMgbm90IGhhdmUgcHJvcGVydHkgJHtTdHJpbmcocHJvcCl9LmApO1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBoYXNPd25Qcm9wZXJ0eTogKHg6IHVua25vd24sIHByb3A6IFByb3BlcnR5S2V5LCBtZXNzYWdlPzogc3RyaW5nIHwgbnVsbCk6IHZvaWQgfCBuZXZlciA9PiB7XG4gICAgICAgIGlmIChudWxsID09IHggfHwgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh4LCBwcm9wKSkge1xuICAgICAgICAgICAgZXhpc3RzKG1lc3NhZ2UpIHx8IChtZXNzYWdlID0gYFRoZSBvYmplY3QgZG9lcyBub3QgaGF2ZSBvd24gcHJvcGVydHkgJHtTdHJpbmcocHJvcCl9LmApO1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH0sXG59O1xuXG4vKipcbiAqIEBlbiBWZXJpZnkgbWV0aG9kLlxuICogQGphIOaknOiovOODoeOCveODg+ODiVxuICpcbiAqIEBwYXJhbSBtZXRob2RcbiAqICAtIGBlbmAgbWV0aG9kIG5hbWUgd2hpY2ggdXNpbmdcbiAqICAtIGBqYWAg5L2/55So44GZ44KL44Oh44K944OD44OJ5ZCNXG4gKiBAcGFyYW0gYXJnc1xuICogIC0gYGVuYCBhcmd1bWVudHMgd2hpY2ggY29ycmVzcG9uZHMgdG8gdGhlIG1ldGhvZCBuYW1lXG4gKiAgLSBgamFgIOODoeOCveODg+ODieWQjeOBq+WvvuW/nOOBmeOCi+W8leaVsFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5PFRNZXRob2QgZXh0ZW5kcyBWZXJpZnlNZXRob2Q+KG1ldGhvZDogVE1ldGhvZCwgLi4uYXJnczogUGFyYW1ldGVyczxWZXJpZmllcltUTWV0aG9kXT4pOiB2b2lkIHwgbmV2ZXIge1xuICAgIChfdmVyaWZpZXJbbWV0aG9kXSBhcyBhbnkpKC4uLmFyZ3MpOyAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbn1cblxuZXhwb3J0IHsgdmVyaWZ5IGFzIGRlZmF1bHQgfTtcbiIsIi8qIGVzbGludC1kaXNhYmxlXG4gICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gKi9cblxuaW1wb3J0IHtcbiAgICBUeXBlZEFycmF5LFxuICAgIGlzRnVuY3Rpb24sXG4gICAgaXNBcnJheSxcbiAgICBpc09iamVjdCxcbiAgICBpc0l0ZXJhYmxlLFxuICAgIGlzVHlwZWRBcnJheSxcbiAgICBzYW1lQ2xhc3MsXG59IGZyb20gJy4vdHlwZXMnO1xuXG4vKiogQGludGVybmFsIGhlbHBlciBmb3IgZGVlcEVxdWFsKCkgKi9cbmZ1bmN0aW9uIGFycmF5RXF1YWwobGhzOiB1bmtub3duW10sIHJoczogdW5rbm93bltdKTogYm9vbGVhbiB7XG4gICAgY29uc3QgbGVuID0gbGhzLmxlbmd0aDtcbiAgICBpZiAobGVuICE9PSByaHMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoIWRlZXBFcXVhbChsaHNbaV0sIHJoc1tpXSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqIEBpbnRlcm5hbCBoZWxwZXIgZm9yIGRlZXBFcXVhbCgpICovXG5mdW5jdGlvbiBidWZmZXJFcXVhbChsaHM6IFNoYXJlZEFycmF5QnVmZmVyIHwgQXJyYXlCdWZmZXIsIHJoczogU2hhcmVkQXJyYXlCdWZmZXIgfCBBcnJheUJ1ZmZlcik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHNpemUgPSBsaHMuYnl0ZUxlbmd0aDtcbiAgICBpZiAoc2l6ZSAhPT0gcmhzLmJ5dGVMZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBsZXQgcG9zID0gMDtcbiAgICBpZiAoc2l6ZSAtIHBvcyA+PSA4KSB7XG4gICAgICAgIGNvbnN0IGxlbiA9IHNpemUgPj4+IDM7XG4gICAgICAgIGNvbnN0IGY2NEwgPSBuZXcgRmxvYXQ2NEFycmF5KGxocywgMCwgbGVuKTtcbiAgICAgICAgY29uc3QgZjY0UiA9IG5ldyBGbG9hdDY0QXJyYXkocmhzLCAwLCBsZW4pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoIU9iamVjdC5pcyhmNjRMW2ldLCBmNjRSW2ldKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwb3MgPSBsZW4gPDwgMztcbiAgICB9XG4gICAgaWYgKHBvcyA9PT0gc2l6ZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY29uc3QgTCA9IG5ldyBEYXRhVmlldyhsaHMpO1xuICAgIGNvbnN0IFIgPSBuZXcgRGF0YVZpZXcocmhzKTtcbiAgICBpZiAoc2l6ZSAtIHBvcyA+PSA0KSB7XG4gICAgICAgIGlmICghT2JqZWN0LmlzKEwuZ2V0VWludDMyKHBvcyksIFIuZ2V0VWludDMyKHBvcykpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcG9zICs9IDQ7XG4gICAgfVxuICAgIGlmIChzaXplIC0gcG9zID49IDIpIHtcbiAgICAgICAgaWYgKCFPYmplY3QuaXMoTC5nZXRVaW50MTYocG9zKSwgUi5nZXRVaW50MTYocG9zKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBwb3MgKz0gMjtcbiAgICB9XG4gICAgaWYgKHNpemUgPiBwb3MpIHtcbiAgICAgICAgaWYgKCFPYmplY3QuaXMoTC5nZXRVaW50OChwb3MpLCBSLmdldFVpbnQ4KHBvcykpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcG9zICs9IDE7XG4gICAgfVxuICAgIHJldHVybiBwb3MgPT09IHNpemU7XG59XG5cbi8qKlxuICogQGVuIFBlcmZvcm1zIGEgZGVlcCBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqIEBqYSAy5YCk44Gu6Kmz57Sw5q+U6LyD44KS44GXLCDnrYnjgZfjgYTjgYvjganjgYbjgYvliKTlrppcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZXBFcXVhbChsaHM6IHVua25vd24sIHJoczogdW5rbm93bik6IGJvb2xlYW4ge1xuICAgIGlmIChsaHMgPT09IHJocykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGlzRnVuY3Rpb24obGhzKSAmJiBpc0Z1bmN0aW9uKHJocykpIHtcbiAgICAgICAgcmV0dXJuIGxocy5sZW5ndGggPT09IHJocy5sZW5ndGggJiYgbGhzLm5hbWUgPT09IHJocy5uYW1lO1xuICAgIH1cbiAgICBpZiAoIWlzT2JqZWN0KGxocykgfHwgIWlzT2JqZWN0KHJocykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB7IC8vIFByaW1pdGl2ZSBXcmFwcGVyIE9iamVjdHMgLyBEYXRlXG4gICAgICAgIGNvbnN0IHZhbHVlTCA9IGxocy52YWx1ZU9mKCk7XG4gICAgICAgIGNvbnN0IHZhbHVlUiA9IHJocy52YWx1ZU9mKCk7XG4gICAgICAgIGlmIChsaHMgIT09IHZhbHVlTCB8fCByaHMgIT09IHZhbHVlUikge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlTCA9PT0gdmFsdWVSO1xuICAgICAgICB9XG4gICAgfVxuICAgIHsgLy8gUmVnRXhwXG4gICAgICAgIGNvbnN0IGlzUmVnRXhwTCA9IGxocyBpbnN0YW5jZW9mIFJlZ0V4cDtcbiAgICAgICAgY29uc3QgaXNSZWdFeHBSID0gcmhzIGluc3RhbmNlb2YgUmVnRXhwO1xuICAgICAgICBpZiAoaXNSZWdFeHBMIHx8IGlzUmVnRXhwUikge1xuICAgICAgICAgICAgcmV0dXJuIGlzUmVnRXhwTCA9PT0gaXNSZWdFeHBSICYmIFN0cmluZyhsaHMpID09PSBTdHJpbmcocmhzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB7IC8vIEFycmF5XG4gICAgICAgIGNvbnN0IGlzQXJyYXlMID0gaXNBcnJheShsaHMpO1xuICAgICAgICBjb25zdCBpc0FycmF5UiA9IGlzQXJyYXkocmhzKTtcbiAgICAgICAgaWYgKGlzQXJyYXlMIHx8IGlzQXJyYXlSKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNBcnJheUwgPT09IGlzQXJyYXlSICYmIGFycmF5RXF1YWwobGhzIGFzIGFueSwgcmhzIGFzIGFueSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgeyAvLyBBcnJheUJ1ZmZlclxuICAgICAgICBjb25zdCBpc0J1ZmZlckwgPSBsaHMgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcjtcbiAgICAgICAgY29uc3QgaXNCdWZmZXJSID0gcmhzIGluc3RhbmNlb2YgQXJyYXlCdWZmZXI7XG4gICAgICAgIGlmIChpc0J1ZmZlckwgfHwgaXNCdWZmZXJSKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNCdWZmZXJMID09PSBpc0J1ZmZlclIgJiYgYnVmZmVyRXF1YWwobGhzIGFzIGFueSwgcmhzIGFzIGFueSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgeyAvLyBBcnJheUJ1ZmZlclZpZXdcbiAgICAgICAgY29uc3QgaXNCdWZmZXJWaWV3TCA9IEFycmF5QnVmZmVyLmlzVmlldyhsaHMpO1xuICAgICAgICBjb25zdCBpc0J1ZmZlclZpZXdSID0gQXJyYXlCdWZmZXIuaXNWaWV3KHJocyk7XG4gICAgICAgIGlmIChpc0J1ZmZlclZpZXdMIHx8IGlzQnVmZmVyVmlld1IpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0J1ZmZlclZpZXdMID09PSBpc0J1ZmZlclZpZXdSICYmIHNhbWVDbGFzcyhsaHMsIHJocylcbiAgICAgICAgICAgICAgICAmJiBidWZmZXJFcXVhbCgobGhzIGFzIEFycmF5QnVmZmVyVmlldykuYnVmZmVyLCAocmhzIGFzIEFycmF5QnVmZmVyVmlldykuYnVmZmVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB7IC8vIG90aGVyIEl0ZXJhYmxlXG4gICAgICAgIGNvbnN0IGlzSXRlcmFibGVMID0gaXNJdGVyYWJsZShsaHMpO1xuICAgICAgICBjb25zdCBpc0l0ZXJhYmxlUiA9IGlzSXRlcmFibGUocmhzKTtcbiAgICAgICAgaWYgKGlzSXRlcmFibGVMIHx8IGlzSXRlcmFibGVSKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNJdGVyYWJsZUwgPT09IGlzSXRlcmFibGVSICYmIGFycmF5RXF1YWwoWy4uLihsaHMgYXMgYW55KV0sIFsuLi4ocmhzIGFzIGFueSldKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoc2FtZUNsYXNzKGxocywgcmhzKSkge1xuICAgICAgICBjb25zdCBrZXlzTCA9IG5ldyBTZXQoT2JqZWN0LmtleXMobGhzKSk7XG4gICAgICAgIGNvbnN0IGtleXNSID0gbmV3IFNldChPYmplY3Qua2V5cyhyaHMpKTtcbiAgICAgICAgaWYgKGtleXNMLnNpemUgIT09IGtleXNSLnNpemUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzTCkge1xuICAgICAgICAgICAgaWYgKCFrZXlzUi5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzTCkge1xuICAgICAgICAgICAgaWYgKCFkZWVwRXF1YWwobGhzW2tleV0sIHJoc1trZXldKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGxocykge1xuICAgICAgICAgICAgaWYgKCEoa2V5IGluIHJocykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qga2V5cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiByaHMpIHtcbiAgICAgICAgICAgIGlmICghKGtleSBpbiBsaHMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAga2V5cy5hZGQoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgICAgICBpZiAoIWRlZXBFcXVhbChsaHNba2V5XSwgcmhzW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG4vL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fLy9cblxuLyoqIEBpbnRlcm5hbCBjbG9uZSBSZWdFeHAgKi9cbmZ1bmN0aW9uIGNsb25lUmVnRXhwKHJlZ2V4cDogUmVnRXhwKTogUmVnRXhwIHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgUmVnRXhwKHJlZ2V4cC5zb3VyY2UsIHJlZ2V4cC5mbGFncyk7XG4gICAgcmVzdWx0Lmxhc3RJbmRleCA9IHJlZ2V4cC5sYXN0SW5kZXg7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqIEBpbnRlcm5hbCBjbG9uZSBBcnJheUJ1ZmZlciAqL1xuZnVuY3Rpb24gY2xvbmVBcnJheUJ1ZmZlcihhcnJheUJ1ZmZlcjogQXJyYXlCdWZmZXIpOiBBcnJheUJ1ZmZlciB7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5QnVmZmVyKGFycmF5QnVmZmVyLmJ5dGVMZW5ndGgpO1xuICAgIG5ldyBVaW50OEFycmF5KHJlc3VsdCkuc2V0KG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqIEBpbnRlcm5hbCBjbG9uZSBEYXRhVmlldyAqL1xuZnVuY3Rpb24gY2xvbmVEYXRhVmlldyhkYXRhVmlldzogRGF0YVZpZXcpOiBEYXRhVmlldyB7XG4gICAgY29uc3QgYnVmZmVyID0gY2xvbmVBcnJheUJ1ZmZlcihkYXRhVmlldy5idWZmZXIpO1xuICAgIHJldHVybiBuZXcgRGF0YVZpZXcoYnVmZmVyLCBkYXRhVmlldy5ieXRlT2Zmc2V0LCBkYXRhVmlldy5ieXRlTGVuZ3RoKTtcbn1cblxuLyoqIEBpbnRlcm5hbCBjbG9uZSBUeXBlZEFycmF5ICovXG5mdW5jdGlvbiBjbG9uZVR5cGVkQXJyYXk8VCBleHRlbmRzIFR5cGVkQXJyYXk+KHR5cGVkQXJyYXk6IFQpOiBUIHtcbiAgICBjb25zdCBidWZmZXIgPSBjbG9uZUFycmF5QnVmZmVyKHR5cGVkQXJyYXkuYnVmZmVyKTtcbiAgICByZXR1cm4gbmV3ICh0eXBlZEFycmF5IGFzIGFueSkuY29uc3RydWN0b3IoYnVmZmVyLCB0eXBlZEFycmF5LmJ5dGVPZmZzZXQsIHR5cGVkQXJyYXkubGVuZ3RoKTtcbn1cblxuLyoqIEBpbnRlcm5hbCBjaGVjayBuZWNlc3NhcnkgdG8gdXBkYXRlICovXG5mdW5jdGlvbiBuZWVkVXBkYXRlKG9sZFZhbHVlOiB1bmtub3duLCBuZXdWYWx1ZTogdW5rbm93biwgZXhjZXB0VW5kZWZpbmVkOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKGV4Y2VwdFVuZGVmaW5lZCAmJiB1bmRlZmluZWQgPT09IG9sZFZhbHVlKTtcbiAgICB9XG59XG5cbi8qKiBAaW50ZXJuYWwgbWVyZ2UgQXJyYXkgKi9cbmZ1bmN0aW9uIG1lcmdlQXJyYXkodGFyZ2V0OiBhbnlbXSwgc291cmNlOiBhbnlbXSk6IGFueVtdIHtcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gc291cmNlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGFyZ2V0W2ldO1xuICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IG1lcmdlKG9sZFZhbHVlLCBzb3VyY2VbaV0pO1xuICAgICAgICAhbmVlZFVwZGF0ZShvbGRWYWx1ZSwgbmV3VmFsdWUsIGZhbHNlKSB8fCAodGFyZ2V0W2ldID0gbmV3VmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuXG4vKiogQGludGVybmFsIG1lcmdlIFNldCAqL1xuZnVuY3Rpb24gbWVyZ2VTZXQodGFyZ2V0OiBTZXQ8YW55Piwgc291cmNlOiBTZXQ8YW55Pik6IFNldDxhbnk+IHtcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2Ygc291cmNlKSB7XG4gICAgICAgIHRhcmdldC5oYXMoaXRlbSkgfHwgdGFyZ2V0LmFkZChtZXJnZSh1bmRlZmluZWQsIGl0ZW0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbn1cblxuLyoqIEBpbnRlcm5hbCBtZXJnZSBNYXAgKi9cbmZ1bmN0aW9uIG1lcmdlTWFwKHRhcmdldDogTWFwPGFueSwgYW55Piwgc291cmNlOiBNYXA8YW55LCBhbnk+KTogTWFwPGFueSwgYW55PiB7XG4gICAgZm9yIChjb25zdCBbaywgdl0gb2Ygc291cmNlKSB7XG4gICAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGFyZ2V0LmdldChrKTtcbiAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBtZXJnZShvbGRWYWx1ZSwgdik7XG4gICAgICAgICFuZWVkVXBkYXRlKG9sZFZhbHVlLCBuZXdWYWx1ZSwgZmFsc2UpIHx8IHRhcmdldC5zZXQoaywgbmV3VmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuXG4vKiogQGludGVybmFsIGhlbHBlciBmb3IgZGVlcE1lcmdlKCkgKi9cbmZ1bmN0aW9uIG1lcmdlKHRhcmdldDogdW5rbm93biwgc291cmNlOiB1bmtub3duKTogYW55IHtcbiAgICBpZiAodW5kZWZpbmVkID09PSBzb3VyY2UgfHwgdGFyZ2V0ID09PSBzb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgaWYgKCFpc09iamVjdChzb3VyY2UpKSB7XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfVxuICAgIC8vIFByaW1pdGl2ZSBXcmFwcGVyIE9iamVjdHMgLyBEYXRlXG4gICAgaWYgKHNvdXJjZS52YWx1ZU9mKCkgIT09IHNvdXJjZSkge1xuICAgICAgICByZXR1cm4gZGVlcEVxdWFsKHRhcmdldCwgc291cmNlKSA/IHRhcmdldCA6IG5ldyAoc291cmNlIGFzIGFueSkuY29uc3RydWN0b3Ioc291cmNlLnZhbHVlT2YoKSk7XG4gICAgfVxuICAgIC8vIFJlZ0V4cFxuICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgcmV0dXJuIGRlZXBFcXVhbCh0YXJnZXQsIHNvdXJjZSkgPyB0YXJnZXQgOiBjbG9uZVJlZ0V4cChzb3VyY2UpO1xuICAgIH1cbiAgICAvLyBBcnJheUJ1ZmZlclxuICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgICByZXR1cm4gZGVlcEVxdWFsKHRhcmdldCwgc291cmNlKSA/IHRhcmdldCA6IGNsb25lQXJyYXlCdWZmZXIoc291cmNlKTtcbiAgICB9XG4gICAgLy8gQXJyYXlCdWZmZXJWaWV3XG4gICAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhzb3VyY2UpKSB7XG4gICAgICAgIHJldHVybiBkZWVwRXF1YWwodGFyZ2V0LCBzb3VyY2UpID8gdGFyZ2V0IDogaXNUeXBlZEFycmF5KHNvdXJjZSkgPyBjbG9uZVR5cGVkQXJyYXkoc291cmNlKSA6IGNsb25lRGF0YVZpZXcoc291cmNlIGFzIERhdGFWaWV3KTtcbiAgICB9XG4gICAgLy8gQXJyYXlcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICAgIHJldHVybiBtZXJnZUFycmF5KGlzQXJyYXkodGFyZ2V0KSA/IHRhcmdldCA6IFtdLCBzb3VyY2UpO1xuICAgIH1cbiAgICAvLyBTZXRcbiAgICBpZiAoc291cmNlIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgIHJldHVybiBtZXJnZVNldCh0YXJnZXQgaW5zdGFuY2VvZiBTZXQgPyB0YXJnZXQgOiBuZXcgU2V0KCksIHNvdXJjZSk7XG4gICAgfVxuICAgIC8vIE1hcFxuICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgcmV0dXJuIG1lcmdlTWFwKHRhcmdldCBpbnN0YW5jZW9mIE1hcCA/IHRhcmdldCA6IG5ldyBNYXAoKSwgc291cmNlKTtcbiAgICB9XG5cbiAgICBjb25zdCBvYmogPSBpc09iamVjdCh0YXJnZXQpID8gdGFyZ2V0IDoge307XG4gICAgaWYgKHNhbWVDbGFzcyh0YXJnZXQsIHNvdXJjZSkpIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc291cmNlKSkge1xuICAgICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBvYmpba2V5XTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gbWVyZ2Uob2xkVmFsdWUsIHNvdXJjZVtrZXldKTtcbiAgICAgICAgICAgICFuZWVkVXBkYXRlKG9sZFZhbHVlLCBuZXdWYWx1ZSwgdHJ1ZSkgfHwgKG9ialtrZXldID0gbmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IG9ialtrZXldO1xuICAgICAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBtZXJnZShvbGRWYWx1ZSwgc291cmNlW2tleV0pO1xuICAgICAgICAgICAgIW5lZWRVcGRhdGUob2xkVmFsdWUsIG5ld1ZhbHVlLCB0cnVlKSB8fCAob2JqW2tleV0gPSBuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBAZW4gUmVjdXJzaXZlbHkgbWVyZ2VzIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgc3RyaW5nIGtleWVkIHByb3BlcnRpZXMgb2Ygc291cmNlIG9iamVjdHMgaW50byB0aGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQGphIOOCquODluOCuOOCp+OCr+ODiOOBruWGjeW4sOeahOODnuODvOOCuOOCkuWun+ihjFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVlcE1lcmdlPFQsIFMxLCBTMiwgUzMsIFM0LCBTNSwgUzYsIFM3LCBTOCwgUzk+KFxuICAgIHRhcmdldDogVCxcbiAgICAuLi5zb3VyY2VzOiBbUzEsIFMyPywgUzM/LCBTND8sIFM1PywgUzY/LCBTNz8sIFM4PywgUzk/LCAuLi5hbnlbXV1cbik6IFQgJiBTMSAmIFMyICYgUzMgJiBTNCAmIFM1ICYgUzYgJiBTNyAmIFM4ICYgUzk7XG5leHBvcnQgZnVuY3Rpb24gZGVlcE1lcmdlPFg+KHRhcmdldDogYW55LCAuLi5zb3VyY2VzOiBhbnlbXSk6IFg7XG5leHBvcnQgZnVuY3Rpb24gZGVlcE1lcmdlKHRhcmdldDogYW55LCAuLi5zb3VyY2VzOiBhbnlbXSk6IGFueSB7XG4gICAgbGV0IHJlc3VsdCA9IHRhcmdldDtcbiAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBzb3VyY2VzKSB7XG4gICAgICAgIHJlc3VsdCA9IG1lcmdlKHJlc3VsdCwgc291cmNlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbi8qKlxuICogQGVuIENyZWF0ZSBkZWVwIGNvcHkgaW5zdGFuY2Ugb2Ygc291cmNlIG9iamVjdC5cbiAqIEBqYSDjg4fjgqPjg7zjg5fjgrPjg5Tjg7zjgqrjg5bjgrjjgqfjgq/jg4jjga7nlJ/miJBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZXBDb3B5PFQ+KHNyYzogVCk6IFQge1xuICAgIHJldHVybiBkZWVwTWVyZ2UodW5kZWZpbmVkLCBzcmMpO1xufVxuIiwiLyogZXNsaW50LWRpc2FibGVcbiAgIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAqL1xuXG5pbXBvcnQge1xuICAgIE5pbCxcbiAgICBUeXBlLFxuICAgIENsYXNzLFxuICAgIENvbnN0cnVjdG9yLFxufSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBAZW4gTWl4aW4gY2xhc3MncyBiYXNlIGludGVyZmFjZS5cbiAqIEBqYSBNaXhpbiDjgq/jg6njgrnjga7ln7rlupXjgqTjg7Pjgr/jg7zjg5XjgqfjgqTjgrnlrprnvqlcbiAqL1xuZXhwb3J0IGRlY2xhcmUgY2xhc3MgTWl4aW5DbGFzcyB7XG4gICAgLyoqXG4gICAgICogQGVuIGNhbGwgbWl4aW4gc291cmNlIGNsYXNzJ3MgYHN1cGVyKClgLiA8YnI+XG4gICAgICogICAgIFRoaXMgbWV0aG9kIHNob3VsZCBiZSBjYWxsZWQgZnJvbSBjb25zdHJ1Y3Rvci5cbiAgICAgKiBAamEgTWl4aW4g44Kv44Op44K544Gu5Z+65bqV44Kk44Oz44K/44O844OV44Kn44Kk44K55a6a576pIDxicj5cbiAgICAgKiAgICAg44Kz44Oz44K544OI44Op44Kv44K/44GL44KJ5ZG844G244GT44Go44KS5oOz5a6aXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3JjQ2xhc3NcbiAgICAgKiAgLSBgZW5gIGNvbnN0cnVjdGlvbiB0YXJnZXQgY2xhc3MgbmFtZS4gZXgpIGZyb20gUzEgYXZhaWxhYmxlXG4gICAgICogIC0gYGphYCDjgrPjg7Pjgrnjg4jjg6njgq/jg4jjgZnjgovjgq/jg6njgrnlkI3jgpLmjIflrpogZXgpIFMxIOOBi+OCieaMh+WumuWPr+iDvVxuICAgICAqIEBwYXJhbSBhcmdzXG4gICAgICogIC0gYGVuYCBjb25zdHJ1Y3Rpb24gcGFyYW1ldGVyc1xuICAgICAqICAtIGBqYWAg44Kz44Oz44K544OI44Op44Kv44OI44Gr5L2/55So44GZ44KL5byV5pWwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHN1cGVyPFQgZXh0ZW5kcyBDbGFzcz4oc3JjQ2xhc3M6IFQsIC4uLmFyZ3M6IENvbnN0cnVjdG9yUGFyYW1ldGVyczxUPik6IHRoaXM7XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQ2hlY2sgdGhlIGlucHV0IGNsYXNzIGlzIG1peGluZWQgKGV4Y2x1ZGluZyBvd24gY2xhc3MpLlxuICAgICAqIEBqYSDmjIflrprjgq/jg6njgrnjgYwgTWl4aW4g44GV44KM44Gm44GE44KL44GL56K66KqNICjoh6rouqvjga7jgq/jg6njgrnjga/lkKvjgb7jgozjgarjgYQpXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbWl4ZWRDbGFzc1xuICAgICAqICAtIGBlbmAgc2V0IHRhcmdldCBjbGFzcyBjb25zdHJ1Y3RvclxuICAgICAqICAtIGBqYWAg5a++6LGh44Kv44Op44K544Gu44Kz44Oz44K544OI44Op44Kv44K/44KS5oyH5a6aXG4gICAgICovXG4gICAgcHVibGljIGlzTWl4ZWRXaXRoPFQ+KG1peGVkQ2xhc3M6IENvbnN0cnVjdG9yPFQ+KTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBAZW4gTWl4ZWQgc3ViIGNsYXNzIGNvbnN0cnVjdG9yIGRlZmluaXRpb25zLlxuICogQGphIOWQiOaIkOOBl+OBn+OCteODluOCr+ODqeOCueOBruOCs+ODs+OCueODiOODqeOCr+OCv+Wumue+qVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1peGluQ29uc3RydWN0b3I8QiBleHRlbmRzIENsYXNzLCBVPiBleHRlbmRzIFR5cGU8VT4ge1xuICAgIC8qKlxuICAgICAqIEBlbiBjb25zdHJ1Y3RvclxuICAgICAqIEBqYSDjgrPjg7Pjgrnjg4jjg6njgq/jgr9cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhcmdzXG4gICAgICogIC0gYGVuYCBiYXNlIGNsYXNzIGFyZ3VtZW50c1xuICAgICAqICAtIGBqYWAg5Z+65bqV44Kv44Op44K544Gr5oyH5a6a44GX44Gf5byV5pWwXG4gICAgICogQHJldHVybnNcbiAgICAgKiAgLSBgZW5gIHVuaW9uIHR5cGUgb2YgY2xhc3NlcyB3aGVuIGNhbGxpbmcgW1ttaXhpbnNdXSgpXG4gICAgICogIC0gYGphYCBbW21peGluc11dKCkg44Gr5rih44GX44Gf44Kv44Op44K544Gu6ZuG5ZCIXG4gICAgICovXG4gICAgbmV3KC4uLmFyZ3M6IENvbnN0cnVjdG9yUGFyYW1ldGVyczxCPik6IFU7XG59XG5cbi8qKlxuICogQGVuIERlZmluaXRpb24gb2YgW1tzZXRNaXhDbGFzc0F0dHJpYnV0ZV1dIGZ1bmN0aW9uJ3MgYXJndW1lbnRzLlxuICogQGphIFtbc2V0TWl4Q2xhc3NBdHRyaWJ1dGVdXSDjga7lj5bjgorjgYbjgovlvJXmlbDlrprnvqlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNaXhDbGFzc0F0dHJpYnV0ZSB7XG4gICAgLyoqXG4gICAgICogQGVuIFN1cHByZXNzIHByb3ZpZGluZyBjb25zdHJ1Y3Rvci10cmFwIGZvciB0aGUgbWl4aW4gc291cmNlIGNsYXNzLiBJbiB0aGlzIGNhc2UsIGBpc01peGVkV2l0aGAsIGBpbnN0YW5jZW9mYCBhbHNvIGJlY29tZXMgaW52YWxpZC4gKGZvciBpbXByb3ZpbmcgcGVyZm9ybWFuY2UpXG4gICAgICogQGphIE1peGluIFNvdXJjZSDjgq/jg6njgrnjgavlr77jgZfjgaYsIOOCs+ODs+OCueODiOODqeOCr+OCv+ODiOODqeODg+ODl+OCkuaKkeatoi4g44GT44KM44KS5oyH5a6a44GX44Gf5aC05ZCILCBgaXNNaXhlZFdpdGhgLCBgaW5zdGFuY2VvZmAg44KC54Sh5Yq544Gr44Gq44KLLiAo44OR44OV44Kp44O844Oe44Oz44K55pS55ZaEKVxuICAgICAqL1xuICAgIHByb3RvRXh0ZW5kc09ubHk6IHZvaWQ7XG5cbiAgICAvKipcbiAgICAgKiBAZW4gU2V0dXAgW1N5bWJvbC5oYXNJbnN0YW5jZV0gcHJvcGVydHkuIDxicj5cbiAgICAgKiAgICAgVGhlIGNsYXNzIGRlc2lnbmF0ZWQgYXMgYSBzb3VyY2Ugb2YgW1ttaXhpbnNdXSgpIGhhcyBbU3ltYm9sLmhhc0luc3RhbmNlXSBwcm9wZXJ0eSBpbXBsaWNpdGx5LiA8YnI+XG4gICAgICogICAgIEl0J3MgdXNlZCB0byBhdm9pZCBiZWNvbWluZyB0aGUgYmVoYXZpb3IgYGluc3RhbmNlb2ZgIGRvZXNuJ3QgaW50ZW5kIHdoZW4gdGhlIGNsYXNzIGlzIGV4dGVuZGVkIGZyb20gdGhlIG1peGluZWQgY2xhc3MgdGhlIG90aGVyIHBsYWNlLlxuICAgICAqIEBqYSBbU3ltYm9sLmhhc0luc3RhbmNlXSDjg5fjg63jg5Hjg4bjgqPoqK3lrpo8YnI+XG4gICAgICogICAgIFtbbWl4aW5zXV0oKSDjga7jgr3jg7zjgrnjgavmjIflrprjgZXjgozjgZ/jgq/jg6njgrnjga8gW1N5bWJvbC5oYXNJbnN0YW5jZV0g44KS5pqX6buZ55qE44Gr5YKZ44GI44KL44Gf44KBPGJyPlxuICAgICAqICAgICDjgZ3jga7jgq/jg6njgrnjgYzku5bjgafntpnmib/jgZXjgozjgabjgYTjgovloLTlkIggYGluc3RhbmNlb2ZgIOOBjOaEj+Wbs+OBl+OBquOBhOaMr+OCi+iInuOBhOOBqOOBquOCi+OBruOCkumBv+OBkeOCi+OBn+OCgeOBq+S9v+eUqOOBmeOCiy5cbiAgICAgKi9cbiAgICBpbnN0YW5jZU9mOiAoKGluc3Q6IG9iamVjdCkgPT4gYm9vbGVhbikgfCBOaWw7XG59XG5cbi8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18vL1xuXG5jb25zdCBfb2JqUHJvdG90eXBlICAgICA9IE9iamVjdC5wcm90b3R5cGU7XG5jb25zdCBfaW5zdGFuY2VPZiAgICAgICA9IEZ1bmN0aW9uLnByb3RvdHlwZVtTeW1ib2wuaGFzSW5zdGFuY2VdO1xuY29uc3QgX292ZXJyaWRlICAgICAgICAgPSBTeW1ib2woJ292ZXJyaWRlJyk7XG5jb25zdCBfaXNJbmhlcml0ZWQgICAgICA9IFN5bWJvbCgnaXNJbmhlcml0ZWQnKTtcbmNvbnN0IF9jb25zdHJ1Y3RvcnMgICAgID0gU3ltYm9sKCdjb25zdHJ1Y3RvcnMnKTtcbmNvbnN0IF9jbGFzc0Jhc2UgICAgICAgID0gU3ltYm9sKCdjbGFzc0Jhc2UnKTtcbmNvbnN0IF9jbGFzc1NvdXJjZXMgICAgID0gU3ltYm9sKCdjbGFzc1NvdXJjZXMnKTtcbmNvbnN0IF9wcm90b0V4dGVuZHNPbmx5ID0gU3ltYm9sKCdwcm90b0V4dGVuZHNPbmx5Jyk7XG5cbi8vIGNvcHkgcHJvcGVydGllcyBjb3JlXG5mdW5jdGlvbiByZWZsZWN0UHJvcGVydGllcyh0YXJnZXQ6IG9iamVjdCwgc291cmNlOiBvYmplY3QsIGtleTogc3RyaW5nIHwgc3ltYm9sKTogdm9pZCB7XG4gICAgaWYgKG51bGwgPT0gdGFyZ2V0W2tleV0pIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSBhcyBQcm9wZXJ0eURlY29yYXRvcik7XG4gICAgfVxufVxuXG4vLyBvYmplY3QgcHJvcGVydGllcyBjb3B5IG1ldGhvZFxuZnVuY3Rpb24gY29weVByb3BlcnRpZXModGFyZ2V0OiBvYmplY3QsIHNvdXJjZTogb2JqZWN0KTogdm9pZCB7XG4gICAgc291cmNlICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHNvdXJjZSlcbiAgICAgICAgLmZpbHRlcihrZXkgPT4gIS8ocHJvdG90eXBlfG5hbWV8Y29uc3RydWN0b3IpLy50ZXN0KGtleSkpXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICByZWZsZWN0UHJvcGVydGllcyh0YXJnZXQsIHNvdXJjZSwga2V5KTtcbiAgICAgICAgfSk7XG4gICAgc291cmNlICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoc291cmNlKVxuICAgICAgICAuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgcmVmbGVjdFByb3BlcnRpZXModGFyZ2V0LCBzb3VyY2UsIGtleSk7XG4gICAgICAgIH0pO1xufVxuXG4vLyBoZWxwZXIgZm9yIHNldE1peENsYXNzQXR0cmlidXRlKHRhcmdldCwgJ2luc3RhbmNlT2YnKVxuZnVuY3Rpb24gc2V0SW5zdGFuY2VPZjxUIGV4dGVuZHMge30+KHRhcmdldDogQ29uc3RydWN0b3I8VD4sIG1ldGhvZDogKChpbnN0OiBvYmplY3QpID0+IGJvb2xlYW4pIHwgTmlsKTogdm9pZCB7XG4gICAgY29uc3QgYmVoYXZpb3VyID0gbWV0aG9kIHx8IChudWxsID09PSBtZXRob2QgPyB1bmRlZmluZWQgOiAoKGk6IG9iamVjdCkgPT4gT2JqZWN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mLmNhbGwodGFyZ2V0LnByb3RvdHlwZSwgaSkpKTtcbiAgICBjb25zdCBhcHBsaWVkID0gYmVoYXZpb3VyICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBfb3ZlcnJpZGUpO1xuICAgIGlmICghYXBwbGllZCkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHtcbiAgICAgICAgICAgIFtTeW1ib2wuaGFzSW5zdGFuY2VdOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGJlaGF2aW91cixcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbX292ZXJyaWRlXToge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBiZWhhdmlvdXIgPyB0cnVlIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBlbiBTZXQgdGhlIE1peGluIGNsYXNzIGF0dHJpYnV0ZS5cbiAqIEBqYSBNaXhpbiDjgq/jg6njgrnjgavlr77jgZfjgablsZ7mgKfjgpLoqK3lrppcbiAqXG4gKiBAZXhhbXBsZSA8YnI+XG4gKlxuICogYGBgdHNcbiAqIC8vICdwcm90b0V4dGVuZE9ubHknXG4gKiBjbGFzcyBCYXNlIHsgY29uc3RydWN0b3IoYSwgYikge30gfTtcbiAqIGNsYXNzIE1peEEgeyB9O1xuICogc2V0TWl4Q2xhc3NBdHRyaWJ1dGUoTWl4QSwgJ3Byb3RvRXh0ZW5kc09ubHknKTsgIC8vIGZvciBpbXByb3ZpbmcgY29uc3RydWN0aW9uIHBlcmZvcm1hbmNlXG4gKiBjbGFzcyBNaXhCIHsgY29uc3RydWN0b3IoYywgZCkge30gfTtcbiAqXG4gKiBjbGFzcyBNaXhpbkNsYXNzIGV4dGVuZHMgbWl4aW5zKEJhc2UsIE1peEEsIE1peEIpIHtcbiAqICAgICBjb25zdHJ1Y3RvcihhLCBiLCBjLCBkKXtcbiAqICAgICAgICAgLy8gY2FsbGluZyBgQmFzZWAgY29uc3RydWN0b3JcbiAqICAgICAgICAgc3VwZXIoYSwgYik7XG4gKlxuICogICAgICAgICAvLyBjYWxsaW5nIE1peGluIGNsYXNzJ3MgY29uc3RydWN0b3JcbiAqICAgICAgICAgdGhpcy5zdXBlcihNaXhBKTsgICAgICAgIC8vIG5vIGFmZmVjdFxuICogICAgICAgICB0aGlzLnN1cGVyKE1peEIsIGMsIGQpO1xuICogICAgIH1cbiAqIH1cbiAqXG4gKiBjb25zdCBtaXhlZCA9IG5ldyBNaXhpbkNsYXNzKCk7XG4gKiBjb25zb2xlLmxvZyhtaXhlZCBpbnN0YW5jZW9mIE1peEEpOyAgICAvLyBmYWxzZVxuICogY29uc29sZS5sb2cobWl4ZWQuaXNNaXhlZFdpdGgoTWl4QSkpOyAgLy8gZmFsc2VcbiAqXG4gKiAvLyAnaW5zdGFuY2VPZidcbiAqIGNsYXNzIEJhc2Uge307XG4gKiBjbGFzcyBTb3VyY2Uge307XG4gKiBjbGFzcyBNaXhpbkNsYXNzIGV4dGVuZHMgbWl4aW5zKEJhc2UsIFNvdXJjZSkge307XG4gKlxuICogY2xhc3MgT3RoZXIgZXh0ZW5kcyBTb3VyY2Uge307XG4gKlxuICogY29uc3QgbWl4ZWQgPSBuZXcgTWl4aW5DbGFzcygpO1xuICogY29uc29sZS5sb2cobWl4ZWQgaW5zdGFuY2VvZiBNaXhpbkNsYXNzKTsgICAgLy8gdHJ1ZVxuICogY29uc29sZS5sb2cobWl4ZWQgaW5zdGFuY2VvZiBCYXNlKTsgICAgICAgICAgLy8gdHJ1ZVxuICogY29uc29sZS5sb2cobWl4ZWQgaW5zdGFuY2VvZiBTb3VyY2UpOyAgICAgICAgLy8gdHJ1ZVxuICogY29uc29sZS5sb2cobWl4ZWQgaW5zdGFuY2VvZiBPdGhlcik7ICAgICAgICAgLy8gdHJ1ZSA/Pz9cbiAqXG4gKiBzZXRNaXhDbGFzc0F0dHJpYnV0ZShPdGhlciwgJ2luc3RhbmNlT2YnKTsgLy8gb3Igc2V0TWl4Q2xhc3NBdHRyaWJ1dGUoT3RoZXIsICdpbnN0YW5jZU9mJywgbnVsbCk7XG4gKiBjb25zb2xlLmxvZyhtaXhlZCBpbnN0YW5jZW9mIE90aGVyKTsgICAgICAgICAvLyBmYWxzZSAhXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gdGFyZ2V0XG4gKiAgLSBgZW5gIHNldCB0YXJnZXQgY29uc3RydWN0b3JcbiAqICAtIGBqYWAg6Kit5a6a5a++6LGh44Gu44Kz44Oz44K544OI44Op44Kv44K/XG4gKiBAcGFyYW0gYXR0clxuICogIC0gYGVuYDpcbiAqICAgIC0gYHByb3RvRXh0ZW5kc09ubHlgOiBTdXBwcmVzcyBwcm92aWRpbmcgY29uc3RydWN0b3ItdHJhcCBmb3IgdGhlIG1peGluIHNvdXJjZSBjbGFzcy4gKGZvciBpbXByb3ZpbmcgcGVyZm9ybWFuY2UpXG4gKiAgICAtIGBpbnN0YW5jZU9mYCAgICAgIDogZnVuY3Rpb24gYnkgdXNpbmcgW1N5bWJvbC5oYXNJbnN0YW5jZV0gPGJyPlxuICogICAgICAgICAgICAgICAgICAgICAgICAgIERlZmF1bHQgYmVoYXZpb3VyIGlzIGB7IHJldHVybiB0YXJnZXQucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5zdGFuY2UpIH1gXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgSWYgc2V0IGBudWxsYCwgZGVsZXRlIFtTeW1ib2wuaGFzSW5zdGFuY2VdIHByb3BlcnR5LlxuICogIC0gYGphYDpcbiAqICAgIC0gYHByb3RvRXh0ZW5kc09ubHlgOiBNaXhpbiBTb3VyY2Ug44Kv44Op44K544Gr5a++44GX44GmLCDjgrPjg7Pjgrnjg4jjg6njgq/jgr/jg4jjg6njg4Pjg5fjgpLmipHmraIgKOODkeODleOCqeODvOODnuODs+OCueaUueWWhClcbiAqICAgIC0gYGluc3RhbmNlT2ZgICAgICAgOiBbU3ltYm9sLmhhc0luc3RhbmNlXSDjgYzkvb/nlKjjgZnjgovplqLmlbDjgpLmjIflrpogPGJyPlxuICogICAgICAgICAgICAgICAgICAgICAgICAgIOaXouWumuOBp+OBryBgeyByZXR1cm4gdGFyZ2V0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGluc3RhbmNlKSB9YCDjgYzkvb/nlKjjgZXjgozjgotcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIGBudWxsYCDmjIflrprjgpLjgZnjgovjgaggW1N5bWJvbC5oYXNJbnN0YW5jZV0g44OX44Ot44OR44OG44Kj44KS5YmK6Zmk44GZ44KLXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRNaXhDbGFzc0F0dHJpYnV0ZTxUIGV4dGVuZHMge30sIFUgZXh0ZW5kcyBrZXlvZiBNaXhDbGFzc0F0dHJpYnV0ZT4oXG4gICAgdGFyZ2V0OiBDb25zdHJ1Y3RvcjxUPixcbiAgICBhdHRyOiBVLFxuICAgIG1ldGhvZD86IE1peENsYXNzQXR0cmlidXRlW1VdXG4pOiB2b2lkIHtcbiAgICBzd2l0Y2ggKGF0dHIpIHtcbiAgICAgICAgY2FzZSAncHJvdG9FeHRlbmRzT25seSc6XG4gICAgICAgICAgICB0YXJnZXRbX3Byb3RvRXh0ZW5kc09ubHldID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdpbnN0YW5jZU9mJzpcbiAgICAgICAgICAgIHNldEluc3RhbmNlT2YodGFyZ2V0LCBtZXRob2QpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG5cbi8qKlxuICogQGVuIE1peGluIGZ1bmN0aW9uIGZvciBtdWx0aXBsZSBpbmhlcml0YW5jZS4gPGJyPlxuICogICAgIFJlc29sdmluZyB0eXBlIHN1cHBvcnQgZm9yIG1heGltdW0gMTAgY2xhc3Nlcy5cbiAqIEBqYSDlpJrph43ntpnmib/jga7jgZ/jgoHjga4gTWl4aW4gPGJyPlxuICogICAgIOacgOWkpyAxMCDjgq/jg6njgrnjga7lnovop6PmsbrjgpLjgrXjg53jg7zjg4hcbiAqXG4gKiBAZXhhbXBsZSA8YnI+XG4gKlxuICogYGBgdHNcbiAqIGNsYXNzIEJhc2UgeyBjb25zdHJ1Y3RvcihhLCBiKSB7fSB9O1xuICogY2xhc3MgTWl4QSB7IGNvbnN0cnVjdG9yKGEsIGIpIHt9IH07XG4gKiBjbGFzcyBNaXhCIHsgY29uc3RydWN0b3IoYywgZCkge30gfTtcbiAqXG4gKiBjbGFzcyBNaXhpbkNsYXNzIGV4dGVuZHMgbWl4aW5zKEJhc2UsIE1peEEsIE1peEIpIHtcbiAqICAgICBjb25zdHJ1Y3RvcihhLCBiLCBjLCBkKXtcbiAqICAgICAgICAgLy8gY2FsbGluZyBgQmFzZWAgY29uc3RydWN0b3JcbiAqICAgICAgICAgc3VwZXIoYSwgYik7XG4gKlxuICogICAgICAgICAvLyBjYWxsaW5nIE1peGluIGNsYXNzJ3MgY29uc3RydWN0b3JcbiAqICAgICAgICAgdGhpcy5zdXBlcihNaXhBLCBhLCBiKTtcbiAqICAgICAgICAgdGhpcy5zdXBlcihNaXhCLCBjLCBkKTtcbiAqICAgICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gYmFzZVxuICogIC0gYGVuYCBwcmltYXJ5IGJhc2UgY2xhc3MuIHN1cGVyKGFyZ3MpIGlzIHRoaXMgY2xhc3MncyBvbmUuXG4gKiAgLSBgamFgIOWfuuW6leOCr+ODqeOCueOCs+ODs+OCueODiOODqeOCr+OCvy4g5ZCM5ZCN44OX44Ot44OR44OG44KjLCDjg6Hjgr3jg4Pjg4njga/mnIDlhKrlhYjjgZXjgozjgosuIHN1cGVyKGFyZ3MpIOOBr+OBk+OBruOCr+ODqeOCueOBruOCguOBruOBjOaMh+WumuWPr+iDvS5cbiAqIEBwYXJhbSBzb3VyY2VzXG4gKiAgLSBgZW5gIG11bHRpcGxlIGV4dGVuZHMgY2xhc3NcbiAqICAtIGBqYWAg5ouh5by144Kv44Op44K544Kz44Oz44K544OI44Op44Kv44K/XG4gKiBAcmV0dXJuc1xuICogIC0gYGVuYCBtaXhpbmVkIGNsYXNzIGNvbnN0cnVjdG9yXG4gKiAgLSBgamFgIOWQiOaIkOOBleOCjOOBn+OCr+ODqeOCueOCs+ODs+OCueODiOODqeOCr+OCv1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWl4aW5zPEIgZXh0ZW5kcyBDbGFzcywgUzEsIFMyLCBTMywgUzQsIFM1LCBTNiwgUzcsIFM4LCBTOT4oXG4gICAgYmFzZTogQixcbiAgICAuLi5zb3VyY2VzOiBbXG4gICAgICAgIENvbnN0cnVjdG9yPFMxPixcbiAgICAgICAgQ29uc3RydWN0b3I8UzI+PyxcbiAgICAgICAgQ29uc3RydWN0b3I8UzM+PyxcbiAgICAgICAgQ29uc3RydWN0b3I8UzQ+PyxcbiAgICAgICAgQ29uc3RydWN0b3I8UzU+PyxcbiAgICAgICAgQ29uc3RydWN0b3I8UzY+PyxcbiAgICAgICAgQ29uc3RydWN0b3I8Uzc+PyxcbiAgICAgICAgQ29uc3RydWN0b3I8Uzg+PyxcbiAgICAgICAgQ29uc3RydWN0b3I8Uzk+PyxcbiAgICAgICAgLi4uYW55W11cbiAgICBdKTogTWl4aW5Db25zdHJ1Y3RvcjxCLCBNaXhpbkNsYXNzICYgSW5zdGFuY2VUeXBlPEI+ICYgUzEgJiBTMiAmIFMzICYgUzQgJiBTNSAmIFM2ICYgUzcgJiBTOCAmIFM5PiB7XG5cbiAgICBsZXQgX2hhc1NvdXJjZUNvbnN0cnVjdG9yID0gZmFsc2U7XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2NsYXNzLW5hbWUtY2FzaW5nXG4gICAgY2xhc3MgX01peGluQmFzZSBleHRlbmRzIChiYXNlIGFzIGFueSBhcyBDb25zdHJ1Y3RvcjxNaXhpbkNsYXNzPikge1xuXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgW19jb25zdHJ1Y3RvcnNdOiBNYXA8Q29uc3RydWN0b3I8YW55PiwgRnVuY3Rpb24gfCBudWxsPjtcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBbX2NsYXNzQmFzZV06IENvbnN0cnVjdG9yPGFueT47XG5cbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJnczogYW55W10pIHtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zdHJ1Y3Rvci1zdXBlclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbnN0cnVjdG9ycyA9IG5ldyBNYXA8Q29uc3RydWN0b3I8YW55PiwgRnVuY3Rpb24+KCk7XG4gICAgICAgICAgICB0aGlzW19jb25zdHJ1Y3RvcnNdID0gY29uc3RydWN0b3JzO1xuICAgICAgICAgICAgdGhpc1tfY2xhc3NCYXNlXSA9IGJhc2U7XG5cbiAgICAgICAgICAgIGlmIChfaGFzU291cmNlQ29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHNyY0NsYXNzIG9mIHNvdXJjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzcmNDbGFzc1tfcHJvdG9FeHRlbmRzT25seV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHk6ICh0YXJnZXQ6IGFueSwgdGhpc29iajogYW55LCBhcmdsaXN0OiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvYmogPSBuZXcgc3JjQ2xhc3MoLi4uYXJnbGlzdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlQcm9wZXJ0aWVzKHRoaXMsIG9iaik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByb3h5IGZvciAnY29uc3RydWN0JyBhbmQgY2FjaGUgY29uc3RydWN0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9ycy5zZXQoc3JjQ2xhc3MsIG5ldyBQcm94eShzcmNDbGFzcywgaGFuZGxlcikpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIHN1cGVyPFQgZXh0ZW5kcyBDbGFzcz4oc3JjQ2xhc3M6IFQsIC4uLmFyZ3M6IENvbnN0cnVjdG9yUGFyYW1ldGVyczxUPik6IHRoaXMge1xuICAgICAgICAgICAgY29uc3QgbWFwID0gdGhpc1tfY29uc3RydWN0b3JzXTtcbiAgICAgICAgICAgIGNvbnN0IGN0b3IgPSBtYXAuZ2V0KHNyY0NsYXNzKTtcbiAgICAgICAgICAgIGlmIChjdG9yKSB7XG4gICAgICAgICAgICAgICAgY3Rvci5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgICAgICAgICAgICAgIG1hcC5zZXQoc3JjQ2xhc3MsIG51bGwpOyAgICAvLyBwcmV2ZW50IGNhbGxpbmcgdHdpY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGlzTWl4ZWRXaXRoPFQ+KHNyY0NsYXNzOiBDb25zdHJ1Y3RvcjxUPik6IGJvb2xlYW4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29uc3RydWN0b3IgPT09IHNyY0NsYXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzW19jbGFzc0Jhc2VdID09PSBzcmNDbGFzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1tfY2xhc3NTb3VyY2VzXS5yZWR1Y2UoKHAsIGMpID0+IHAgfHwgKHNyY0NsYXNzID09PSBjKSwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBbU3ltYm9sLmhhc0luc3RhbmNlXShpbnN0YW5jZTogYW55KTogYm9vbGVhbiB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mLmNhbGwoX01peGluQmFzZS5wcm90b3R5cGUsIGluc3RhbmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBbX2lzSW5oZXJpdGVkXTxUPihzcmNDbGFzczogQ29uc3RydWN0b3I8VD4pOiBib29sZWFuIHtcbiAgICAgICAgICAgIGNvbnN0IGN0b3JzID0gdGhpc1tfY29uc3RydWN0b3JzXTtcbiAgICAgICAgICAgIGlmIChjdG9ycy5oYXMoc3JjQ2xhc3MpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGN0b3Igb2YgY3RvcnMua2V5cygpKSB7XG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZi5jYWxsKHNyY0NsYXNzLCBjdG9yKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIGdldCBbX2NsYXNzU291cmNlc10oKTogQ29uc3RydWN0b3I8YW55PltdIHtcbiAgICAgICAgICAgIHJldHVybiBbLi4udGhpc1tfY29uc3RydWN0b3JzXS5rZXlzKCldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBzcmNDbGFzcyBvZiBzb3VyY2VzKSB7XG4gICAgICAgIC8vIHByb3ZpZGUgY3VzdG9tIGluc3RhbmNlb2ZcbiAgICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc3JjQ2xhc3MsIFN5bWJvbC5oYXNJbnN0YW5jZSk7XG4gICAgICAgIGlmICghZGVzYyB8fCBkZXNjLndyaXRhYmxlKSB7XG4gICAgICAgICAgICBjb25zdCBvcmdJbnN0YW5jZU9mID0gZGVzYyA/IHNyY0NsYXNzW1N5bWJvbC5oYXNJbnN0YW5jZV0gOiBfaW5zdGFuY2VPZjtcbiAgICAgICAgICAgIHNldEluc3RhbmNlT2Yoc3JjQ2xhc3MsIChpbnN0OiBvYmplY3QpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JnSW5zdGFuY2VPZi5jYWxsKHNyY0NsYXNzLCBpbnN0KSB8fCAoKG51bGwgIT0gaW5zdCAmJiBpbnN0W19pc0luaGVyaXRlZF0pID8gaW5zdFtfaXNJbmhlcml0ZWRdKHNyY0NsYXNzKSA6IGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIHByb3ZpZGUgcHJvdG90eXBlXG4gICAgICAgIGNvcHlQcm9wZXJ0aWVzKF9NaXhpbkJhc2UucHJvdG90eXBlLCBzcmNDbGFzcy5wcm90b3R5cGUpO1xuICAgICAgICBsZXQgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHNyY0NsYXNzLnByb3RvdHlwZSk7XG4gICAgICAgIHdoaWxlIChfb2JqUHJvdG90eXBlICE9PSBwYXJlbnQpIHtcbiAgICAgICAgICAgIGNvcHlQcm9wZXJ0aWVzKF9NaXhpbkJhc2UucHJvdG90eXBlLCBwYXJlbnQpO1xuICAgICAgICAgICAgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHBhcmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2hlY2sgY29uc3RydWN0b3JcbiAgICAgICAgaWYgKCFfaGFzU291cmNlQ29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgIF9oYXNTb3VyY2VDb25zdHJ1Y3RvciA9ICFzcmNDbGFzc1tfcHJvdG9FeHRlbmRzT25seV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX01peGluQmFzZSBhcyBhbnk7XG59XG4iLCIvKiBlc2xpbnQtZGlzYWJsZVxuICAgbm8taW52YWxpZC10aGlzXG4gLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gKi9cblxuY29uc3QgcmFuZG9tID0gTWF0aC5yYW5kb20uYmluZChNYXRoKTtcblxuLyoqXG4gKiBAZW4gRXhlY3V0ZSBzaHVmZmxlIG9mIGFuIGFycmF5IGVsZW1lbnRzLlxuICogQGphIOmFjeWIl+imgee0oOOBruOCt+ODo+ODg+ODleODq1xuICpcbiAqIEBwYXJhbSBhcnJheVxuICogIC0gYGVuYCBzb3VyY2UgYXJyYXlcbiAqICAtIGBqYWAg5YWl5Yqb6YWN5YiXXG4gKiBAcGFyYW0gZGVzdHJ1Y3RpdmVcbiAqICAtIGBlbmAgdHJ1ZTogZGVzdHJ1Y3RpdmUgLyBmYWxzZTogbm9uLWRlc3RydWN0aXZlIChkZWZhdWx0KVxuICogIC0gYGphYCB0cnVlOiDnoLTlo4rnmoQgLyBmYWxzZTog6Z2e56C05aOK55qEICjml6LlrpopXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaHVmZmxlPFQ+KGFycmF5OiBUW10sIGRlc3RydWN0aXZlID0gZmFsc2UpOiBUW10ge1xuICAgIGNvbnN0IHNvdXJjZSA9IGRlc3RydWN0aXZlID8gYXJyYXkgOiBhcnJheS5zbGljZSgpO1xuICAgIGNvbnN0IGxlbiA9IHNvdXJjZS5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IGxlbiA+IDAgPyBsZW4gPj4+IDAgOiAwOyBpID4gMTspIHtcbiAgICAgICAgY29uc3QgaiA9IGkgKiByYW5kb20oKSA+Pj4gMDtcbiAgICAgICAgY29uc3Qgc3dhcCA9IHNvdXJjZVstLWldO1xuICAgICAgICBzb3VyY2VbaV0gPSBzb3VyY2Vbal07XG4gICAgICAgIHNvdXJjZVtqXSA9IHN3YXA7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG59XG5cbi8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18vL1xuXG4vKipcbiAqIEBlbiBFeGVjdXRlIHN0YWJsZSBzb3J0IGJ5IG1lcmdlLXNvcnQgYWxnb3JpdGhtLlxuICogQGphIGBtZXJnZS1zb3J0YCDjgavjgojjgovlronlrprjgr3jg7zjg4hcbiAqXG4gKiBAcGFyYW0gYXJyYXlcbiAqICAtIGBlbmAgc291cmNlIGFycmF5XG4gKiAgLSBgamFgIOWFpeWKm+mFjeWIl1xuICogQHBhcmFtIGNvbXBhcmF0b3JcbiAqICAtIGBlbmAgc29ydCBjb21wYXJhdG9yIGZ1bmN0aW9uXG4gKiAgLSBgamFgIOOCveODvOODiOmWouaVsOOCkuaMh+WumlxuICogQHBhcmFtIGRlc3RydWN0aXZlXG4gKiAgLSBgZW5gIHRydWU6IGRlc3RydWN0aXZlIC8gZmFsc2U6IG5vbi1kZXN0cnVjdGl2ZSAoZGVmYXVsdClcbiAqICAtIGBqYWAgdHJ1ZTog56C05aOK55qEIC8gZmFsc2U6IOmdnuegtOWjiueahCAo5pei5a6aKVxuICovXG5leHBvcnQgZnVuY3Rpb24gc29ydDxUPihhcnJheTogVFtdLCBjb21wYXJhdG9yOiAobGhzOiBULCByaHM6IFQpID0+IG51bWJlciwgZGVzdHJ1Y3RpdmUgPSBmYWxzZSk6IFRbXSB7XG4gICAgY29uc3Qgc291cmNlID0gZGVzdHJ1Y3RpdmUgPyBhcnJheSA6IGFycmF5LnNsaWNlKCk7XG4gICAgaWYgKHNvdXJjZS5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfVxuICAgIGNvbnN0IGxocyA9IHNvcnQoc291cmNlLnNwbGljZSgwLCBzb3VyY2UubGVuZ3RoID4+PiAxKSwgY29tcGFyYXRvciwgdHJ1ZSk7XG4gICAgY29uc3QgcmhzID0gc29ydChzb3VyY2Uuc3BsaWNlKDApLCBjb21wYXJhdG9yLCB0cnVlKTtcbiAgICB3aGlsZSAobGhzLmxlbmd0aCAmJiByaHMubGVuZ3RoKSB7XG4gICAgICAgIHNvdXJjZS5wdXNoKGNvbXBhcmF0b3IobGhzWzBdLCByaHNbMF0pIDw9IDAgPyBsaHMuc2hpZnQoKSBhcyBUIDogcmhzLnNoaWZ0KCkgYXMgVCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2UuY29uY2F0KGxocywgcmhzKTtcbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbi8qKlxuICogQGVuIE1ha2UgdW5pcXVlIGFycmF5LlxuICogQGphIOmHjeikh+imgee0oOOBruOBquOBhOmFjeWIl+OBruS9nOaIkFxuICpcbiAqIEBwYXJhbSBhcnJheVxuICogIC0gYGVuYCBzb3VyY2UgYXJyYXlcbiAqICAtIGBqYWAg5YWl5Yqb6YWN5YiXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmlxdWU8VD4oYXJyYXk6IFRbXSk6IFRbXSB7XG4gICAgcmV0dXJuIFsuLi5uZXcgU2V0KGFycmF5KV07XG59XG5cbi8qKlxuICogQGVuIE1ha2UgdW5pb24gYXJyYXkuXG4gKiBAamEg6YWN5YiX44Gu5ZKM6ZuG5ZCI44KS6L+U5Y20XG4gKlxuICogQHBhcmFtIGFycmF5c1xuICogIC0gYGVuYCBzb3VyY2UgYXJyYXlzXG4gKiAgLSBgamFgIOWFpeWKm+mFjeWIl+e+pFxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5pb248VD4oLi4uYXJyYXlzOiBUW11bXSk6IFRbXSB7XG4gICAgcmV0dXJuIHVuaXF1ZShhcnJheXMuZmxhdCgpKTtcbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbi8qKlxuICogQGVuIE1ha2UgaW5kZXggYXJyYXkuXG4gKiBAamEg44Kk44Oz44OH44OD44Kv44K56YWN5YiX44Gu5L2c5oiQXG4gKlxuICogQHBhcmFtIGFycmF5XG4gKiAgLSBgZW5gIHNvdXJjZSBhcnJheVxuICogIC0gYGphYCDlhaXlipvphY3liJdcbiAqIEBwYXJhbSBleGNsdWRlc1xuICogIC0gYGVuYCBleGNsdWRlIGluZGV4IGluIHJldHVybiB2YWx1ZS5cbiAqICAtIGBqYWAg5oi744KK5YCk6YWN5YiX44Gr5ZCr44KB44Gq44GE44Kk44Oz44OH44OD44Kv44K544KS5oyH5a6aXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmRpY2VzPFQ+KGFycmF5OiBUW10sIC4uLmV4Y2x1ZGVzOiBudW1iZXJbXSk6IG51bWJlcltdIHtcbiAgICBjb25zdCByZXR2YWwgPSBbLi4uYXJyYXkua2V5cygpXTtcblxuICAgIGNvbnN0IGxlbiA9IGFycmF5Lmxlbmd0aDtcbiAgICBjb25zdCBleExpc3QgPSBbLi4ubmV3IFNldChleGNsdWRlcyldLnNvcnQoKGxocywgcmhzKSA9PiBsaHMgPCByaHMgPyAxIDogLTEpO1xuICAgIGZvciAoY29uc3QgZXggb2YgZXhMaXN0KSB7XG4gICAgICAgIGlmICgwIDw9IGV4ICYmIGV4IDwgbGVuKSB7XG4gICAgICAgICAgICByZXR2YWwuc3BsaWNlKGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXR2YWw7XG59XG5cbi8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18vL1xuXG4vKipcbiAqIEBlbiBbW2dyb3VwQnldXSgpIG9wdGlvbnMgZGVmaW5pdGlvbi5cbiAqIEBqYSBbW2dyb3VwQnldXSgpIOOBq+aMh+WumuOBmeOCi+OCquODl+OCt+ODp+ODs+Wumue+qVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEdyb3VwQnlPcHRpb25zPFxuICAgIFQgZXh0ZW5kcyBvYmplY3QsXG4gICAgVEtFWVMgZXh0ZW5kcyBrZXlvZiBULFxuICAgIFRTVU1LRVlTIGV4dGVuZHMga2V5b2YgVCxcbiAgICBUR1JPVVBLRVkgZXh0ZW5kcyBzdHJpbmdcbj4ge1xuICAgIC8qKlxuICAgICAqIEBlbiBgR1JPVVAgQllgIGtleXMuXG4gICAgICogQGphIGBHUk9VUCBCWWAg44Gr5oyH5a6a44GZ44KL44Kt44O8XG4gICAgICovXG4gICAga2V5czogRXh0cmFjdDxUS0VZUywgc3RyaW5nPltdO1xuXG4gICAgLyoqXG4gICAgICogQGVuIEFnZ3JlZ2F0YWJsZSBrZXlzLlxuICAgICAqIEBqYSDpm4boqIjlj6/og73jgarjgq3jg7zkuIDopqdcbiAgICAgKi9cbiAgICBzdW1LZXlzPzogRXh0cmFjdDxUU1VNS0VZUywgc3RyaW5nPltdO1xuXG4gICAgLyoqXG4gICAgICogQGVuIEdyb3VwZWQgaXRlbSBhY2Nlc3Mga2V5LiBkZWZhdWx0OiAnaXRlbXMnLFxuICAgICAqIEBqYSDjgrDjg6vjg7zjg5Tjg7PjgrDjgZXjgozjgZ/opoHntKDjgbjjga7jgqLjgq/jgrvjgrnjgq3jg7wuIOaXouWumjogJ2l0ZW1zJ1xuICAgICAqL1xuICAgIGdyb3VwS2V5PzogVEdST1VQS0VZO1xufVxuXG4vKipcbiAqIEBlbiBSZXR1cm4gdHlwZSBvZiBbW2dyb3VwQnldXSgpLlxuICogQGphIFtbZ3JvdXBCeV1dKCkg44GM6L+U5Y2044GZ44KL5Z6LXG4gKi9cbmV4cG9ydCB0eXBlIEdyb3VwQnlSZXR1cm5WYWx1ZTxcbiAgICBUIGV4dGVuZHMgb2JqZWN0LFxuICAgIFRLRVlTIGV4dGVuZHMga2V5b2YgVCxcbiAgICBUU1VNS0VZUyBleHRlbmRzIGtleW9mIFQgPSBuZXZlcixcbiAgICBUR1JPVVBLRVkgZXh0ZW5kcyBzdHJpbmcgPSAnaXRlbXMnXG4+ID0gUmVhZG9ubHk8UmVjb3JkPFRLRVlTLCB7fT4gJiBSZWNvcmQ8VFNVTUtFWVMsIHt9PiAmIFJlY29yZDxUR1JPVVBLRVksIFRbXT4+O1xuXG4vKipcbiAqIEBlbiBFeGVjdXRlIGBHUk9VUCBCWWAgZm9yIGFycmF5IGVsZW1lbnRzLlxuICogQGphIOmFjeWIl+OBruimgee0oOOBriBgR1JPVVAgQllgIOmbhuWQiOOCkuaKveWHulxuICpcbiAqIEBwYXJhbSBhcnJheVxuICogIC0gYGVuYCBzb3VyY2UgYXJyYXlcbiAqICAtIGBqYWAg5YWl5Yqb6YWN5YiXXG4gKiBAcGFyYW0gb3B0aW9uc1xuICogIC0gYGVuYCBgR1JPVVAgQllgIG9wdGlvbnNcbiAqICAtIGBqYWAgYEdST1VQIEJZYCDjgqrjg5fjgrfjg6fjg7NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwQnk8XG4gICAgVCBleHRlbmRzIG9iamVjdCxcbiAgICBUS0VZUyBleHRlbmRzIGtleW9mIFQsXG4gICAgVFNVTUtFWVMgZXh0ZW5kcyBrZXlvZiBUID0gbmV2ZXIsXG4gICAgVEdST1VQS0VZIGV4dGVuZHMgc3RyaW5nID0gJ2l0ZW1zJ1xuPihhcnJheTogVFtdLCBvcHRpb25zOiBHcm91cEJ5T3B0aW9uczxULCBUS0VZUywgVFNVTUtFWVMsIFRHUk9VUEtFWT4pOiBHcm91cEJ5UmV0dXJuVmFsdWU8VCwgVEtFWVMsIFRTVU1LRVlTLCBUR1JPVVBLRVk+W10ge1xuICAgIGNvbnN0IHsga2V5cywgc3VtS2V5cywgZ3JvdXBLZXkgfSA9IG9wdGlvbnM7XG4gICAgY29uc3QgX2dyb3VwS2V5ID0gZ3JvdXBLZXkgfHwgJ2l0ZW1zJztcbiAgICBjb25zdCBfc3VtS2V5czogc3RyaW5nW10gPSBzdW1LZXlzIHx8IFtdO1xuICAgIF9zdW1LZXlzLnB1c2goX2dyb3VwS2V5KTtcblxuICAgIGNvbnN0IGhhc2ggPSBhcnJheS5yZWR1Y2UoKHJlczogVCwgZGF0YTogVCkgPT4ge1xuICAgICAgICAvLyBjcmVhdGUgZ3JvdXBCeSBpbnRlcm5hbCBrZXlcbiAgICAgICAgY29uc3QgX2tleSA9IGtleXMucmVkdWNlKChzLCBrKSA9PiBzICsgU3RyaW5nKGRhdGFba10pLCAnJyk7XG5cbiAgICAgICAgLy8gaW5pdCBrZXlzXG4gICAgICAgIGlmICghKF9rZXkgaW4gcmVzKSkge1xuICAgICAgICAgICAgY29uc3Qga2V5TGlzdCA9IGtleXMucmVkdWNlKChoLCBrOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBoW2tdID0gZGF0YVtrXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaDtcbiAgICAgICAgICAgIH0sIHt9KTtcblxuICAgICAgICAgICAgcmVzW19rZXldID0gX3N1bUtleXMucmVkdWNlKChoLCBrOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBoW2tdID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gaDtcbiAgICAgICAgICAgIH0sIGtleUxpc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzS2V5ID0gcmVzW19rZXldO1xuXG4gICAgICAgIC8vIHN1bSBwcm9wZXJ0aWVzXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBfc3VtS2V5cykge1xuICAgICAgICAgICAgaWYgKF9ncm91cEtleSA9PT0gaykge1xuICAgICAgICAgICAgICAgIHJlc0tleVtrXSA9IHJlc0tleVtrXSB8fCBbXTtcbiAgICAgICAgICAgICAgICByZXNLZXlba10ucHVzaChkYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzS2V5W2tdICs9IGRhdGFba107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0sIHt9KTtcblxuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGhhc2gpO1xufVxuXG4vL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fLy9cblxuLyoqXG4gKiBAZW4gU3Vic3RpdHV0aW9uIG1ldGhvZCBvZiBgQXJyYXkucHJvdG90eXBlLm1hcCgpYCB3aGljaCBhbHNvIGFjY2VwdHMgYXN5bmNocm9ub3VzIGNhbGxiYWNrLlxuICogQGphIOmdnuWQjOacn+OCs+ODvOODq+ODkOODg+OCr+OCkuaMh+WumuWPr+iDveOBqiBgQXJyYXkucHJvdG90eXBlLm1hcCgpYCDjga7ku6Pmm7/jg6Hjgr3jg4Pjg4lcbiAqIFxuICogQHBhcmFtIGFycmF5XG4gKiAgLSBgZW5gIEFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqICAtIGBqYWAg5YWl5Yqb6YWN5YiXXG4gKiBAcGFyYW0gY2FsbGJhY2tcbiAqICAtIGBlbmAgRnVuY3Rpb24gdG8gYXBwbHkgZWFjaCBpdGVtIGluIGBhcnJheWAuXG4gKiAgLSBgamFgIOOCpOODhuODrOODvOOCt+ODp+ODs+mBqeeUqOmWouaVsFxuICogQHBhcmFtIHRoaXNBcmdcbiAqICAtIGBlbmAgVmFsdWUgdG8gdXNlIGFzICp0aGlzKiB3aGVuIGV4ZWN1dGluZyB0aGUgYGNhbGxiYWNrYC5cbiAqICAtIGBqYWAgYGNhbGxiYWNrYCDlrp/ooYzjgrPjg7Pjg4bjgq3jgrnjg4hcbiAqIEByZXR1cm5zXG4gKiAgLSBgZW5gIFJldHVybnMgYSBQcm9taXNlIHdpdGggdGhlIHJlc3VsdGFudCAqQXJyYXkqIGFzIHZhbHVlLlxuICogIC0gYGphYCDjgqTjg4bjg6zjg7zjgrfjg6fjg7PntZDmnpzphY3liJfjgpLmoLzntI3jgZfjgZ8gUHJvbWlzZSDjgqrjg5bjgrjjgqfjgq/jg4hcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1hcDxULCBVPih0aGlzOiBhbnksIGFycmF5OiBUW10sIGNhbGxiYWNrOiAodmFsdWU6IFQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBUW10pID0+IFUgfCBQcm9taXNlPFU+LCB0aGlzQXJnPzogYW55KTogUHJvbWlzZTxVW10+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgIGFycmF5Lm1hcChhc3luYyAodiwgaSwgYSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGNhbGxiYWNrLmNhbGwodGhpc0FyZyB8fCB0aGlzLCB2LCBpLCBhKTtcbiAgICAgICAgfSlcbiAgICApO1xufVxuXG4vKipcbiAqIEBlbiBTdWJzdGl0dXRpb24gbWV0aG9kIG9mIGBBcnJheS5wcm90b3R5cGUuZmlsdGVyKClgIHdoaWNoIGFsc28gYWNjZXB0cyBhc3luY2hyb25vdXMgY2FsbGJhY2suXG4gKiBAamEg6Z2e5ZCM5pyf44Kz44O844Or44OQ44OD44Kv44KS5oyH5a6a5Y+v6IO944GqIGBBcnJheS5wcm90b3R5cGUuZmlsdGVyKClgIOOBruS7o+abv+ODoeOCveODg+ODiVxuICpcbiAqIEBwYXJhbSBhcnJheVxuICogIC0gYGVuYCBBcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiAgLSBgamFgIOWFpeWKm+mFjeWIl1xuICogQHBhcmFtIGNhbGxiYWNrXG4gKiAgLSBgZW5gIEZ1bmN0aW9uIHRvIGFwcGx5IGVhY2ggaXRlbSBpbiBgYXJyYXlgLlxuICogIC0gYGphYCDjgqTjg4bjg6zjg7zjgrfjg6fjg7PpgannlKjplqLmlbBcbiAqIEBwYXJhbSB0aGlzQXJnXG4gKiAgLSBgZW5gIFZhbHVlIHRvIHVzZSBhcyAqdGhpcyogd2hlbiBleGVjdXRpbmcgdGhlIGBjYWxsYmFja2AuXG4gKiAgLSBgamFgIGBjYWxsYmFja2Ag5a6f6KGM44Kz44Oz44OG44Kt44K544OIXG4gKiBAcmV0dXJuc1xuICogIC0gYGVuYCBSZXR1cm5zIGEgUHJvbWlzZSB3aXRoIHRoZSByZXN1bHRhbnQgKkFycmF5KiBhcyB2YWx1ZS5cbiAqICAtIGBqYWAg44Kk44OG44Os44O844K344On44Oz57WQ5p6c6YWN5YiX44KS5qC857SN44GX44GfIFByb21pc2Ug44Kq44OW44K444Kn44Kv44OIXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaWx0ZXI8VD4odGhpczogYW55LCBhcnJheTogVFtdLCBjYWxsYmFjazogKHZhbHVlOiBULCBpbmRleDogbnVtYmVyLCBhcnJheTogVFtdKSA9PiBib29sZWFuIHwgUHJvbWlzZTxib29sZWFuPiwgdGhpc0FyZz86IGFueSk6IFByb21pc2U8VFtdPiB7XG4gICAgY29uc3QgYml0czogYm9vbGVhbltdID0gYXdhaXQgbWFwKGFycmF5LCAodiwgaSwgYSkgPT4gY2FsbGJhY2suY2FsbCh0aGlzQXJnIHx8IHRoaXMsIHYsIGksIGEpKTtcbiAgICByZXR1cm4gYXJyYXkuZmlsdGVyKCgpID0+IGJpdHMuc2hpZnQoKSk7XG59XG5cbi8qKlxuICogQGVuIFN1YnN0aXR1dGlvbiBtZXRob2Qgb2YgYEFycmF5LnByb3RvdHlwZS5maW5kKClgIHdoaWNoIGFsc28gYWNjZXB0cyBhc3luY2hyb25vdXMgY2FsbGJhY2suXG4gKiBAamEg6Z2e5ZCM5pyf44Kz44O844Or44OQ44OD44Kv44KS5oyH5a6a5Y+v6IO944GqIGBBcnJheS5wcm90b3R5cGUuZmluZCgpYCDjga7ku6Pmm7/jg6Hjgr3jg4Pjg4lcbiAqXG4gKiBAcGFyYW0gYXJyYXlcbiAqICAtIGBlbmAgQXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogIC0gYGphYCDlhaXlipvphY3liJdcbiAqIEBwYXJhbSBjYWxsYmFja1xuICogIC0gYGVuYCBGdW5jdGlvbiB0byBhcHBseSBlYWNoIGl0ZW0gaW4gYGFycmF5YC5cbiAqICAtIGBqYWAg44Kk44OG44Os44O844K344On44Oz6YGp55So6Zai5pWwXG4gKiBAcGFyYW0gdGhpc0FyZ1xuICogIC0gYGVuYCBWYWx1ZSB0byB1c2UgYXMgKnRoaXMqIHdoZW4gZXhlY3V0aW5nIHRoZSBgY2FsbGJhY2tgLlxuICogIC0gYGphYCBgY2FsbGJhY2tgIOWun+ihjOOCs+ODs+ODhuOCreOCueODiFxuICogQHJldHVybnNcbiAqICAtIGBlbmAgUmV0dXJucyBhIFByb21pc2Ugd2l0aCB0aGUgcmVzdWx0YW50IHZhbHVlLlxuICogIC0gYGphYCDjgqTjg4bjg6zjg7zjgrfjg6fjg7PntZDmnpzjgpLmoLzntI3jgZfjgZ8gUHJvbWlzZSDjgqrjg5bjgrjjgqfjgq/jg4hcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmQ8VD4odGhpczogYW55LCBhcnJheTogVFtdLCBjYWxsYmFjazogKHZhbHVlOiBULCBpbmRleDogbnVtYmVyLCBhcnJheTogVFtdKSA9PiBib29sZWFuIHwgUHJvbWlzZTxib29sZWFuPiwgdGhpc0FyZz86IGFueSk6IFByb21pc2U8VCB8IHVuZGVmaW5lZD4ge1xuICAgIGZvciAoY29uc3QgW2ksIHZdIG9mIGFycmF5LmVudHJpZXMoKSkge1xuICAgICAgICBpZiAoYXdhaXQgY2FsbGJhY2suY2FsbCh0aGlzQXJnIHx8IHRoaXMsIHYsIGksIGFycmF5KSkge1xuICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBAZW4gU3Vic3RpdHV0aW9uIG1ldGhvZCBvZiBgQXJyYXkucHJvdG90eXBlLmZpbmRJbmRleCgpYCB3aGljaCBhbHNvIGFjY2VwdHMgYXN5bmNocm9ub3VzIGNhbGxiYWNrLlxuICogQGphIOmdnuWQjOacn+OCs+ODvOODq+ODkOODg+OCr+OCkuaMh+WumuWPr+iDveOBqiBgQXJyYXkucHJvdG90eXBlLmZpbmRJbmRleCgpYCDjga7ku6Pmm7/jg6Hjgr3jg4Pjg4lcbiAqXG4gKiBAcGFyYW0gYXJyYXlcbiAqICAtIGBlbmAgQXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogIC0gYGphYCDlhaXlipvphY3liJdcbiAqIEBwYXJhbSBjYWxsYmFja1xuICogIC0gYGVuYCBGdW5jdGlvbiB0byBhcHBseSBlYWNoIGl0ZW0gaW4gYGFycmF5YC5cbiAqICAtIGBqYWAg44Kk44OG44Os44O844K344On44Oz6YGp55So6Zai5pWwXG4gKiBAcGFyYW0gdGhpc0FyZ1xuICogIC0gYGVuYCBWYWx1ZSB0byB1c2UgYXMgKnRoaXMqIHdoZW4gZXhlY3V0aW5nIHRoZSBgY2FsbGJhY2tgLlxuICogIC0gYGphYCBgY2FsbGJhY2tgIOWun+ihjOOCs+ODs+ODhuOCreOCueODiFxuICogQHJldHVybnNcbiAqICAtIGBlbmAgUmV0dXJucyBhIFByb21pc2Ugd2l0aCB0aGUgcmVzdWx0YW50IGluZGV4IHZhbHVlLlxuICogIC0gYGphYCDjgqTjg7Pjg4fjg4Pjgq/jgrnjgpLmoLzntI3jgZfjgZ8gUHJvbWlzZSDjgqrjg5bjgrjjgqfjgq/jg4hcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmRJbmRleDxUPih0aGlzOiBhbnksIGFycmF5OiBUW10sIGNhbGxiYWNrOiAodmFsdWU6IFQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBUW10pID0+IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+LCB0aGlzQXJnPzogYW55KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBmb3IgKGNvbnN0IFtpLCB2XSBvZiBhcnJheS5lbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKGF3YWl0IGNhbGxiYWNrLmNhbGwodGhpc0FyZyB8fCB0aGlzLCB2LCBpLCBhcnJheSkpIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBAZW4gU3Vic3RpdHV0aW9uIG1ldGhvZCBvZiBgQXJyYXkucHJvdG90eXBlLnNvbWUoKWAgd2hpY2ggYWxzbyBhY2NlcHRzIGFzeW5jaHJvbm91cyBjYWxsYmFjay5cbiAqIEBqYSDpnZ7lkIzmnJ/jgrPjg7zjg6vjg5Djg4Pjgq/jgpLmjIflrprlj6/og73jgaogYEFycmF5LnByb3RvdHlwZS5zb21lKClgIOOBruS7o+abv+ODoeOCveODg+ODiVxuICpcbiAqIEBwYXJhbSBhcnJheVxuICogIC0gYGVuYCBBcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiAgLSBgamFgIOWFpeWKm+mFjeWIl1xuICogQHBhcmFtIGNhbGxiYWNrXG4gKiAgLSBgZW5gIEZ1bmN0aW9uIHRvIGFwcGx5IGVhY2ggaXRlbSBpbiBgYXJyYXlgLlxuICogIC0gYGphYCDjgqTjg4bjg6zjg7zjgrfjg6fjg7PpgannlKjplqLmlbBcbiAqIEBwYXJhbSB0aGlzQXJnXG4gKiAgLSBgZW5gIFZhbHVlIHRvIHVzZSBhcyAqdGhpcyogd2hlbiBleGVjdXRpbmcgdGhlIGBjYWxsYmFja2AuXG4gKiAgLSBgamFgIGBjYWxsYmFja2Ag5a6f6KGM44Kz44Oz44OG44Kt44K544OIXG4gKiBAcmV0dXJuc1xuICogIC0gYGVuYCBSZXR1cm5zIGEgUHJvbWlzZSB3aXRoIHRoZSByZXN1bHRhbnQgYm9vbGVhbiB2YWx1ZS5cbiAqICAtIGBqYWAg55yf5YG95YCk44KS5qC857SN44GX44GfIFByb21pc2Ug44Kq44OW44K444Kn44Kv44OIXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzb21lPFQ+KHRoaXM6IGFueSwgYXJyYXk6IFRbXSwgY2FsbGJhY2s6ICh2YWx1ZTogVCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IFRbXSkgPT4gdW5rbm93biB8IFByb21pc2U8dW5rbm93bj4sIHRoaXNBcmc/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBmb3IgKGNvbnN0IFtpLCB2XSBvZiBhcnJheS5lbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKGF3YWl0IGNhbGxiYWNrLmNhbGwodGhpc0FyZyB8fCB0aGlzLCB2LCBpLCBhcnJheSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBAZW4gU3Vic3RpdHV0aW9uIG1ldGhvZCBvZiBgQXJyYXkucHJvdG90eXBlLmV2ZXJ5KClgIHdoaWNoIGFsc28gYWNjZXB0cyBhc3luY2hyb25vdXMgY2FsbGJhY2suXG4gKiBAamEg6Z2e5ZCM5pyf44Kz44O844Or44OQ44OD44Kv44KS5oyH5a6a5Y+v6IO944GqIGBBcnJheS5wcm90b3R5cGUuZXZlcnkoKWAg44Gu5Luj5pu/44Oh44K944OD44OJXG4gKlxuICogQHBhcmFtIGFycmF5XG4gKiAgLSBgZW5gIEFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqICAtIGBqYWAg5YWl5Yqb6YWN5YiXXG4gKiBAcGFyYW0gY2FsbGJhY2tcbiAqICAtIGBlbmAgRnVuY3Rpb24gdG8gYXBwbHkgZWFjaCBpdGVtIGluIGBhcnJheWAuXG4gKiAgLSBgamFgIOOCpOODhuODrOODvOOCt+ODp+ODs+mBqeeUqOmWouaVsFxuICogQHBhcmFtIHRoaXNBcmdcbiAqICAtIGBlbmAgVmFsdWUgdG8gdXNlIGFzICp0aGlzKiB3aGVuIGV4ZWN1dGluZyB0aGUgYGNhbGxiYWNrYC5cbiAqICAtIGBqYWAgYGNhbGxiYWNrYCDlrp/ooYzjgrPjg7Pjg4bjgq3jgrnjg4hcbiAqIEByZXR1cm5zXG4gKiAgLSBgZW5gIFJldHVybnMgYSBQcm9taXNlIHdpdGggdGhlIHJlc3VsdGFudCBib29sZWFuIHZhbHVlLlxuICogIC0gYGphYCDnnJ/lgb3lgKTjgpLmoLzntI3jgZfjgZ8gUHJvbWlzZSDjgqrjg5bjgrjjgqfjgq/jg4hcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV2ZXJ5PFQ+KHRoaXM6IGFueSwgYXJyYXk6IFRbXSwgY2FsbGJhY2s6ICh2YWx1ZTogVCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IFRbXSkgPT4gdW5rbm93biB8IFByb21pc2U8dW5rbm93bj4sIHRoaXNBcmc/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBmb3IgKGNvbnN0IFtpLCB2XSBvZiBhcnJheS5lbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKCFhd2FpdCBjYWxsYmFjay5jYWxsKHRoaXNBcmcgfHwgdGhpcywgdiwgaSwgYXJyYXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQGVuIFN1YnN0aXR1dGlvbiBtZXRob2Qgb2YgYEFycmF5LnByb3RvdHlwZS5yZWR1Y2UoKWAgd2hpY2ggYWxzbyBhY2NlcHRzIGFzeW5jaHJvbm91cyBjYWxsYmFjay5cbiAqIEBqYSDpnZ7lkIzmnJ/jgrPjg7zjg6vjg5Djg4Pjgq/jgpLmjIflrprlj6/og73jgaogYEFycmF5LnByb3RvdHlwZS5yZWR1Y2UoKWAg44Gu5Luj5pu/44Oh44K944OD44OJXG4gKlxuICogQHBhcmFtIGFycmF5XG4gKiAgLSBgZW5gIEFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqICAtIGBqYWAg5YWl5Yqb6YWN5YiXXG4gKiBAcGFyYW0gY2FsbGJhY2tcbiAqICAtIGBlbmAgRnVuY3Rpb24gdG8gYXBwbHkgZWFjaCBpdGVtIGluIGBhcnJheWAuXG4gKiAgLSBgamFgIOOCpOODhuODrOODvOOCt+ODp+ODs+mBqeeUqOmWouaVsFxuICogQHBhcmFtIGluaXRpYWxWYWx1ZVxuICogIC0gYGVuYCBVc2VkIGFzIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBmaXJzdCBjYWxsIG9mIGBjYWxsYmFja2AuXG4gKiAgLSBgamFgIGBjYWxsYmFja2Ag44Gr5rih44GV44KM44KL5Yid5pyf5YCkXG4gKiBAcmV0dXJuc1xuICogIC0gYGVuYCBSZXR1cm5zIGEgUHJvbWlzZSB3aXRoIHRoZSByZXN1bHRhbnQgKkFycmF5KiBhcyB2YWx1ZS5cbiAqICAtIGBqYWAg44Kk44OG44Os44O844K344On44Oz57WQ5p6c6YWN5YiX44KS5qC857SN44GX44GfIFByb21pc2Ug44Kq44OW44K444Kn44Kv44OIXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWR1Y2U8VCwgVT4oXG4gICAgYXJyYXk6IFRbXSxcbiAgICBjYWxsYmFjazogKGFjY3VtdWxhdG9yOiBVLCBjdXJyZW50VmFsdWU6IFQsIGN1cnJlbnRJbmRleDogbnVtYmVyLCBhcnJheTogVFtdKSA9PiBVIHwgUHJvbWlzZTxVPixcbiAgICBpbml0aWFsVmFsdWU/OiBVXG4pOiBQcm9taXNlPFU+IHtcbiAgICBpZiAoYXJyYXkubGVuZ3RoIDw9IDAgJiYgdW5kZWZpbmVkID09PSBpbml0aWFsVmFsdWUpIHtcbiAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdSZWR1Y2Ugb2YgZW1wdHkgYXJyYXkgd2l0aCBubyBpbml0aWFsIHZhbHVlJyk7XG4gICAgfVxuXG4gICAgY29uc3QgaGFzSW5pdCA9ICh1bmRlZmluZWQgIT09IGluaXRpYWxWYWx1ZSk7XG4gICAgbGV0IGFjYyA9IChoYXNJbml0ID8gaW5pdGlhbFZhbHVlIDogYXJyYXlbMF0pIGFzIFU7XG5cbiAgICBmb3IgKGNvbnN0IFtpLCB2XSBvZiBhcnJheS5lbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKCEoIWhhc0luaXQgJiYgMCA9PT0gaSkpIHtcbiAgICAgICAgICAgIGFjYyA9IGF3YWl0IGNhbGxiYWNrKGFjYywgdiwgaSwgYXJyYXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjYztcbn1cbiIsIi8qIGVzbGludC1kaXNhYmxlXG4gICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gKi9cblxuaW1wb3J0IHsgZGVlcEVxdWFsIH0gZnJvbSAnLi9kZWVwLWNpcmN1aXQnO1xuaW1wb3J0IHtcbiAgICBOaWwsXG4gICAgV3JpdGFibGUsXG4gICAgaXNBcnJheSxcbiAgICBpc09iamVjdCxcbiAgICBpc0Z1bmN0aW9uLFxuICAgIGNsYXNzTmFtZSxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbi8qKlxuICogQGVuIENoZWNrIHdoZXRoZXIgaW5wdXQgc291cmNlIGhhcyBhIHByb3BlcnR5LlxuICogQGphIOWFpeWKm+WFg+OBjOODl+ODreODkeODhuOCo+OCkuaMgeOBo+OBpuOBhOOCi+OBi+WIpOWumlxuICpcbiAqIEBwYXJhbSBzcmNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhcyhzcmM6IHVua25vd24sIHByb3BOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbnVsbCAhPSBzcmMgJiYgaXNPYmplY3Qoc3JjKSAmJiAocHJvcE5hbWUgaW4gc3JjKTtcbn1cblxuLyoqXG4gKiBAZW4gR2V0IHNoYWxsb3cgY29weSBvZiBgdGFyZ2V0YCB3aGljaCBoYXMgb25seSBgcGlja0tleXNgLlxuICogQGphIGBwaWNrS2V5c2Ag44Gn5oyH5a6a44GV44KM44Gf44OX44Ot44OR44OG44Kj44Gu44G/44KS5oyB44GkIGB0YXJnZXRgIOOBriBTaGFsbG93IENvcHkg44KS5Y+W5b6XXG4gKlxuICogQHBhcmFtIHRhcmdldFxuICogIC0gYGVuYCBjb3B5IHNvdXJjZSBvYmplY3RcbiAqICAtIGBqYWAg44Kz44OU44O85YWD44Kq44OW44K444Kn44Kv44OIXG4gKiBAcGFyYW0gcGlja0tleXNcbiAqICAtIGBlbmAgY29weSB0YXJnZXQga2V5c1xuICogIC0gYGphYCDjgrPjg5Tjg7zlr77osaHjga7jgq3jg7zkuIDopqdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBpY2s8VCBleHRlbmRzIG9iamVjdCwgSyBleHRlbmRzIGtleW9mIFQ+KHRhcmdldDogVCwgLi4ucGlja0tleXM6IEtbXSk6IFdyaXRhYmxlPFBpY2s8VCwgSz4+IHtcbiAgICBpZiAoIXRhcmdldCB8fCAhaXNPYmplY3QodGFyZ2V0KSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGAke2NsYXNzTmFtZSh0YXJnZXQpfSBpcyBub3QgYW4gb2JqZWN0LmApO1xuICAgIH1cbiAgICByZXR1cm4gcGlja0tleXMucmVkdWNlKChvYmosIGtleSkgPT4ge1xuICAgICAgICBrZXkgaW4gdGFyZ2V0ICYmIChvYmpba2V5XSA9IHRhcmdldFtrZXldKTtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9LCB7fSBhcyBXcml0YWJsZTxQaWNrPFQsIEs+Pik7XG59XG5cbi8qKlxuICogQGVuIEdldCBzaGFsbG93IGNvcHkgb2YgYHRhcmdldGAgd2l0aG91dCBgb21pdEtleXNgLlxuICogQGphIGBvbWl0S2V5c2Ag44Gn5oyH5a6a44GV44KM44Gf44OX44Ot44OR44OG44Kj5Lul5aSW44Gu44Kt44O844KS5oyB44GkIGB0YXJnZXRgIOOBriBTaGFsbG93IENvcHkg44KS5Y+W5b6XXG4gKlxuICogQHBhcmFtIHRhcmdldFxuICogIC0gYGVuYCBjb3B5IHNvdXJjZSBvYmplY3RcbiAqICAtIGBqYWAg44Kz44OU44O85YWD44Kq44OW44K444Kn44Kv44OIXG4gKiBAcGFyYW0gb21pdEtleXNcbiAqICAtIGBlbmAgb21pdCB0YXJnZXQga2V5c1xuICogIC0gYGphYCDliYrpmaTlr77osaHjga7jgq3jg7zkuIDopqdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9taXQ8VCBleHRlbmRzIG9iamVjdCwgSyBleHRlbmRzIGtleW9mIFQ+KHRhcmdldDogVCwgLi4ub21pdEtleXM6IEtbXSk6IFdyaXRhYmxlPE9taXQ8VCwgSz4+IHtcbiAgICBpZiAoIXRhcmdldCB8fCAhaXNPYmplY3QodGFyZ2V0KSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGAke2NsYXNzTmFtZSh0YXJnZXQpfSBpcyBub3QgYW4gb2JqZWN0LmApO1xuICAgIH1cbiAgICBjb25zdCBvYmogPSB7fSBhcyBXcml0YWJsZTxPbWl0PFQsIEs+PjtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0YXJnZXQpKSB7XG4gICAgICAgICFvbWl0S2V5cy5pbmNsdWRlcyhrZXkgYXMgSykgJiYgKG9ialtrZXldID0gdGFyZ2V0W2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEBlbiBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gKiBAamEg44Kq44OW44K444Kn44Kv44OI44Gu44Kt44O844Go5YCk44KS6YCG6Lui44GZ44KLLiDjgZnjgbnjgabjga7lgKTjgYzjg6bjg4vjg7zjgq/jgafjgYLjgovjgZPjgajjgYzliY3mj5BcbiAqXG4gKiBAcGFyYW0gdGFyZ2V0XG4gKiAgLSBgZW5gIHRhcmdldCBvYmplY3RcbiAqICAtIGBqYWAg5a++6LGh44Kq44OW44K444Kn44Kv44OIXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQ8VCBleHRlbmRzIG9iamVjdCA9IGFueT4odGFyZ2V0OiBvYmplY3QpOiBUIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0YXJnZXQpKSB7XG4gICAgICAgIHJlc3VsdFt0YXJnZXRba2V5XV0gPSBrZXk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQgYXMgVDtcbn1cblxuLyoqXG4gKiBAZW4gR2V0IHNoYWxsb3cgY29weSBvZiBkaWZmZXJlbmNlIGJldHdlZW4gYGJhc2VgIGFuZCBgc3JjYC5cbiAqIEBqYSBgYmFzZWAg44GoIGBzcmNgIOOBruW3ruWIhuODl+ODreODkeODhuOCo+OCkuOCguOBpOOCquODluOCuOOCp+OCr+ODiOOBriBTaGFsbG93IENvcHkg44KS5Y+W5b6XXG4gKlxuICogQHBhcmFtIGJhc2VcbiAqICAtIGBlbmAgYmFzZSBvYmplY3RcbiAqICAtIGBqYWAg5Z+65rqW44Go44Gq44KL44Kq44OW44K444Kn44Kv44OIXG4gKiBAcGFyYW0gc3JjXG4gKiAgLSBgZW5gIHNvdXJjZSBvYmplY3RcbiAqICAtIGBqYWAg44Kz44OU44O85YWD44Kq44OW44K444Kn44Kv44OIXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaWZmPFQgZXh0ZW5kcyBvYmplY3Q+KGJhc2U6IFQsIHNyYzogUGFydGlhbDxUPik6IFBhcnRpYWw8VD4ge1xuICAgIGlmICghYmFzZSB8fCAhaXNPYmplY3QoYmFzZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgJHtjbGFzc05hbWUoYmFzZSl9IGlzIG5vdCBhbiBvYmplY3QuYCk7XG4gICAgfVxuICAgIGlmICghc3JjIHx8ICFpc09iamVjdChzcmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYCR7Y2xhc3NOYW1lKHNyYyl9IGlzIG5vdCBhbiBvYmplY3QuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgcmV0dmFsOiBQYXJ0aWFsPFQ+ID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhzcmMpKSB7XG4gICAgICAgIGlmICghZGVlcEVxdWFsKGJhc2Vba2V5XSwgc3JjW2tleV0pKSB7XG4gICAgICAgICAgICByZXR2YWxba2V5XSA9IHNyY1trZXldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHZhbDtcbn1cblxuLyoqXG4gKiBAZW4gSWYgdGhlIHZhbHVlIG9mIHRoZSBuYW1lZCBwcm9wZXJ0eSBpcyBhIGZ1bmN0aW9uIHRoZW4gaW52b2tlIGl0OyBvdGhlcndpc2UsIHJldHVybiBpdC5cbiAqIEBqYSBvYmplY3Qg44GuIHByb3BlcnR5IOOBjOODoeOCveODg+ODieOBquOCieOBneOBruWun+ihjOe1kOaenOOCkiwg44OX44Ot44OR44OG44Kj44Gq44KJ44Gd44Gu5YCk44KS6L+U5Y20XG4gKlxuICogQHBhcmFtIHRhcmdldFxuICogLSBgZW5gIE9iamVjdCB0byBtYXliZSBpbnZva2UgZnVuY3Rpb24gYHByb3BlcnR5YCBvbi5cbiAqIC0gYGphYCDoqZXkvqHjgZnjgovjgqrjg5bjgrjjgqfjgq/jg4hcbiAqIEBwYXJhbSBwcm9wZXJ0eVxuICogLSBgZW5gIFRoZSBmdW5jdGlvbiBieSBuYW1lIHRvIGludm9rZSBvbiBgb2JqZWN0YC5cbiAqIC0gYGphYCDoqZXkvqHjgZnjgovjg5fjg63jg5Hjg4bjgqPlkI1cbiAqIEBwYXJhbSBmYWxsYmFja1xuICogLSBgZW5gIFRoZSB2YWx1ZSB0byBiZSByZXR1cm5lZCBpbiBjYXNlIGBwcm9wZXJ0eWAgZG9lc24ndCBleGlzdCBvciBpcyB1bmRlZmluZWQuXG4gKiAtIGBqYWAg5a2Y5Zyo44GX44Gq44GL44Gj44Gf5aC05ZCI44GuIGZhbGxiYWNrIOWApFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzdWx0PFQgPSBhbnk+KHRhcmdldDogb2JqZWN0IHwgTmlsLCBwcm9wZXJ0eTogc3RyaW5nIHwgc3RyaW5nW10sIGZhbGxiYWNrPzogVCk6IFQge1xuICAgIGNvbnN0IHByb3BzID0gaXNBcnJheShwcm9wZXJ0eSkgPyBwcm9wZXJ0eSA6IFtwcm9wZXJ0eV07XG4gICAgaWYgKCFwcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGlzRnVuY3Rpb24oZmFsbGJhY2spID8gZmFsbGJhY2suY2FsbCh0YXJnZXQpIDogZmFsbGJhY2s7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzb2x2ZSA9IChvOiB1bmtub3duLCBwOiB1bmtub3duKTogYW55ID0+IHtcbiAgICAgICAgcmV0dXJuIGlzRnVuY3Rpb24ocCkgPyBwLmNhbGwobykgOiBwO1xuICAgIH07XG5cbiAgICBsZXQgb2JqOiBhbnkgPSB0YXJnZXQ7XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIHByb3BzKSB7XG4gICAgICAgIGNvbnN0IHByb3AgPSBudWxsID09IG9iaiA/IHVuZGVmaW5lZCA6IG9ialtuYW1lXTtcbiAgICAgICAgaWYgKHVuZGVmaW5lZCA9PT0gcHJvcCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUob2JqLCBmYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgICAgb2JqID0gcmVzb2x2ZShvYmosIHByb3ApO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xufVxuIiwiLyoqXG4gKiBAZW4gRGF0ZSB1bml0IGRlZmluaXRpb25zLlxuICogQGphIOaXpeaZguOCquODluOCuOOCp+OCr+ODiOOBruWNmOS9jeWumue+qVxuICovXG5leHBvcnQgdHlwZSBEYXRlVW5pdCA9ICd5ZWFyJyB8ICdtb250aCcgfCAnZGF5JyB8ICdob3VyJyB8ICdtaW4nIHwgJ3NlYycgfCAnbXNlYyc7XG5cbmNvbnN0IF9jb21wdXRlRGF0ZUZ1bmNNYXAgPSB7XG4gICAgeWVhcjogKGRhdGU6IERhdGUsIGJhc2U6IERhdGUsIGFkZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGRhdGUuc2V0VVRDRnVsbFllYXIoYmFzZS5nZXRVVENGdWxsWWVhcigpICsgYWRkKTtcbiAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfSxcbiAgICBtb250aDogKGRhdGU6IERhdGUsIGJhc2U6IERhdGUsIGFkZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGRhdGUuc2V0VVRDTW9udGgoYmFzZS5nZXRVVENNb250aCgpICsgYWRkKTtcbiAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfSxcbiAgICBkYXk6IChkYXRlOiBEYXRlLCBiYXNlOiBEYXRlLCBhZGQ6IG51bWJlcikgPT4ge1xuICAgICAgICBkYXRlLnNldFVUQ0RhdGUoYmFzZS5nZXRVVENEYXRlKCkgKyBhZGQpO1xuICAgICAgICByZXR1cm4gZGF0ZTtcbiAgICB9LFxuICAgIGhvdXI6IChkYXRlOiBEYXRlLCBiYXNlOiBEYXRlLCBhZGQ6IG51bWJlcikgPT4ge1xuICAgICAgICBkYXRlLnNldFVUQ0hvdXJzKGJhc2UuZ2V0VVRDSG91cnMoKSArIGFkZCk7XG4gICAgICAgIHJldHVybiBkYXRlO1xuICAgIH0sXG4gICAgbWluOiAoZGF0ZTogRGF0ZSwgYmFzZTogRGF0ZSwgYWRkOiBudW1iZXIpID0+IHtcbiAgICAgICAgZGF0ZS5zZXRVVENNaW51dGVzKGJhc2UuZ2V0VVRDTWludXRlcygpICsgYWRkKTtcbiAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfSxcbiAgICBzZWM6IChkYXRlOiBEYXRlLCBiYXNlOiBEYXRlLCBhZGQ6IG51bWJlcikgPT4ge1xuICAgICAgICBkYXRlLnNldFVUQ1NlY29uZHMoYmFzZS5nZXRVVENTZWNvbmRzKCkgKyBhZGQpO1xuICAgICAgICByZXR1cm4gZGF0ZTtcbiAgICB9LFxuICAgIG1zZWM6IChkYXRlOiBEYXRlLCBiYXNlOiBEYXRlLCBhZGQ6IG51bWJlcikgPT4ge1xuICAgICAgICBkYXRlLnNldFVUQ01pbGxpc2Vjb25kcyhiYXNlLmdldFVUQ01pbGxpc2Vjb25kcygpICsgYWRkKTtcbiAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfSxcbn07XG5cbi8qKlxuICogQGVuIENhbGN1bGF0ZSBmcm9tIHRoZSBkYXRlIHdoaWNoIGJlY29tZXMgYSBjYXJkaW5hbCBwb2ludCBiZWZvcmUgYSBOIGRhdGUgdGltZSBvciBhZnRlciBhIE4gZGF0ZSB0aW1lIChieSBbW0RhdGVVbml0XV0pLlxuICogQGphIOWfuueCueOBqOOBquOCi+aXpeS7mOOBi+OCieOAgU7ml6XlvozjgIFO5pel5YmN44KS566X5Ye6XG4gKlxuICogQHBhcmFtIGJhc2VcbiAqICAtIGBlbmAgYmFzZSBkYXRlIHRpbWUuXG4gKiAgLSBgamFgIOWfuua6luaXpVxuICogQHBhcmFtIGFkZFxuICogIC0gYGVuYCByZWxhdGl2ZSBkYXRlIHRpbWUuXG4gKiAgLSBgamFgIOWKoOeul+aXpS4g44Oe44Kk44OK44K55oyH5a6a44GnbuaXpeWJjeOCguioreWumuWPr+iDvVxuICogQHBhcmFtIHVuaXQgW1tEYXRlVW5pdF1dXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlRGF0ZShiYXNlOiBEYXRlLCBhZGQ6IG51bWJlciwgdW5pdDogRGF0ZVVuaXQgPSAnZGF5Jyk6IERhdGUge1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShiYXNlLmdldFRpbWUoKSk7XG4gICAgY29uc3QgZnVuYyA9IF9jb21wdXRlRGF0ZUZ1bmNNYXBbdW5pdF07XG4gICAgaWYgKGZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMoZGF0ZSwgYmFzZSwgYWRkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIHVuaXQ6ICR7dW5pdH1gKTtcbiAgICB9XG59XG4iLCIvKiBlc2xpbnQtZGlzYWJsZVxuICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICovXG5cbmZ1bmN0aW9uIGNhbGxhYmxlKCk6IGFueSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11c2UtYmVmb3JlLWRlZmluZVxuICAgIHJldHVybiBhY2Nlc3NpYmxlO1xufVxuXG5jb25zdCBhY2Nlc3NpYmxlOiBhbnkgPSBuZXcgUHJveHkoY2FsbGFibGUsIHtcbiAgICBnZXQ6ICh0YXJnZXQsIG5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgcHJvcCA9IHRhcmdldFtuYW1lXTtcbiAgICAgICAgaWYgKG51bGwgIT0gcHJvcCkge1xuICAgICAgICAgICAgcmV0dXJuIHByb3A7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYWNjZXNzaWJsZTtcbiAgICAgICAgfVxuICAgIH0sXG59KTtcblxuZnVuY3Rpb24gY3JlYXRlKCk6IGFueSB7XG4gICAgY29uc3Qgc3R1YiA9IG5ldyBQcm94eSh7fSwge1xuICAgICAgICBnZXQ6ICh0YXJnZXQsIG5hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb3AgPSB0YXJnZXRbbmFtZV07XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBwcm9wKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb3A7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBhY2Nlc3NpYmxlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHN0dWIsICdzdHViJywge1xuICAgICAgICB2YWx1ZTogdHJ1ZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHN0dWI7XG59XG5cbi8qKlxuICogQGVuIEdldCBzYWZlIGFjY2Vzc2libGUgb2JqZWN0LlxuICogQGphIOWuieWFqOOBq+OCouOCr+OCu+OCueWPr+iDveOBquOCquODluOCuOOCp+OCr+ODiOOBruWPluW+l1xuICpcbiAqIEBleGFtcGxlIDxicj5cbiAqXG4gKiBgYGB0c1xuICogY29uc3Qgc2FmZVdpbmRvdyA9IHNhZmUoZ2xvYmFsVGhpcy53aW5kb3cpO1xuICogY29uc29sZS5sb2cobnVsbCAhPSBzYWZlV2luZG93LmRvY3VtZW50KTsgICAgLy8gdHJ1ZVxuICogY29uc3QgZGl2ID0gc2FmZVdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAqIGNvbnNvbGUubG9nKG51bGwgIT0gZGl2KTsgICAgLy8gdHJ1ZVxuICogYGBgXG4gKlxuICogQHBhcmFtIHRhcmdldFxuICogIC0gYGVuYCBBIHJlZmVyZW5jZSBvZiBhbiBvYmplY3Qgd2l0aCBhIHBvc3NpYmlsaXR5IHdoaWNoIGV4aXN0cy5cbiAqICAtIGBqYWAg5a2Y5Zyo44GX44GG44KL44Kq44OW44K444Kn44Kv44OI44Gu5Y+C54WnXG4gKiBAcmV0dXJuc1xuICogIC0gYGVuYCBSZWFsaXR5IG9yIHN0dWIgaW5zdGFuY2UuXG4gKiAgLSBgamFgIOWun+S9k+OBvuOBn+OBr+OCueOCv+ODluOCpOODs+OCueOCv+ODs+OCuVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FmZTxUPih0YXJnZXQ6IFQpOiBUIHtcbiAgICByZXR1cm4gdGFyZ2V0IHx8IGNyZWF0ZSgpO1xufVxuIiwiLyogZXNsaW50LWRpc2FibGVcbiAgIEB0eXBlc2NyaXB0LWVzbGludC9uby1lbXB0eS1pbnRlcmZhY2VcbiAsIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAqL1xuXG5pbXBvcnQgeyBnZXRHbG9iYWwgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBzYWZlIH0gZnJvbSAnLi9zYWZlJztcblxuLyoqXG4gKiBAZW4gVHlwZSBvZiBoYW5kbGUgZm9yIHRpbWVyIGZ1bmN0aW9ucy5cbiAqIEBqYSDjgr/jgqTjg57jg7zplqLmlbDjgavkvb/nlKjjgZnjgovjg4/jg7Pjg4njg6vlnotcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUaW1lckhhbmRsZSB7IH1cblxuLyoqXG4gKiBAZW4gVHlwZSBvZiB0aW1lciBzdGFydCBmdW5jdGlvbnMuXG4gKiBAamEg44K/44Kk44Oe44O86ZaL5aeL6Zai5pWw44Gu5Z6LXG4gKi9cbmV4cG9ydCB0eXBlIFRpbWVyU3RhcnRGdW5jdGlvbiA9IChoYW5kbGVyOiBGdW5jdGlvbiwgdGltZW91dD86IG51bWJlciwgLi4uYXJnczogYW55W10pID0+IFRpbWVySGFuZGxlO1xuXG4vKipcbiAqIEBlbiBUeXBlIG9mIHRpbWVyIHN0b3AgZnVuY3Rpb25zLlxuICogQGphIOOCv+OCpOODnuODvOWBnOatoumWouaVsOOBruWei1xuICovXG5leHBvcnQgdHlwZSBUaW1lclN0b3BGdW5jdGlvbiA9IChoYW5kbGU6IFRpbWVySGFuZGxlKSA9PiB2b2lkO1xuXG5jb25zdCByb290OiBhbnkgPSBnZXRHbG9iYWwoKTtcbmNvbnN0IF9zZXRUaW1lb3V0OiBUaW1lclN0YXJ0RnVuY3Rpb24gPSBzYWZlKHJvb3Quc2V0VGltZW91dCk7XG5jb25zdCBfY2xlYXJUaW1lb3V0OiBUaW1lclN0b3BGdW5jdGlvbiA9IHNhZmUocm9vdC5jbGVhclRpbWVvdXQpO1xuY29uc3QgX3NldEludGVydmFsOiBUaW1lclN0YXJ0RnVuY3Rpb24gPSBzYWZlKHJvb3Quc2V0SW50ZXJ2YWwpO1xuY29uc3QgX2NsZWFySW50ZXJ2YWw6IFRpbWVyU3RvcEZ1bmN0aW9uID0gc2FmZShyb290LmNsZWFySW50ZXJ2YWwpO1xuXG5leHBvcnQge1xuICAgIF9zZXRUaW1lb3V0IGFzIHNldFRpbWVvdXQsXG4gICAgX2NsZWFyVGltZW91dCBhcyBjbGVhclRpbWVvdXQsXG4gICAgX3NldEludGVydmFsIGFzIHNldEludGVydmFsLFxuICAgIF9jbGVhckludGVydmFsIGFzIGNsZWFySW50ZXJ2YWwsXG59O1xuIiwiLyogZXNsaW50LWRpc2FibGVcbiAgIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAqL1xuXG5pbXBvcnQge1xuICAgIFByaW1pdGl2ZSxcbiAgICBUeXBlZERhdGEsXG4gICAgaXNTdHJpbmcsXG4gICAgaXNPYmplY3QsXG59IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgaW52ZXJ0IH0gZnJvbSAnLi9vYmplY3QnO1xuaW1wb3J0IHtcbiAgICBUaW1lckhhbmRsZSxcbiAgICBzZXRUaW1lb3V0LFxuICAgIGNsZWFyVGltZW91dCxcbn0gZnJvbSAnLi90aW1lcic7XG5cbi8qKlxuICogQGVuIEVuc3VyZSBhc3luY2hyb25vdXMgZXhlY3V0aW9uLlxuICogQGphIOmdnuWQjOacn+Wun+ihjOOCkuS/neiovFxuICpcbiAqIEBleGFtcGxlIDxicj5cbiAqXG4gKiBgYGB0c1xuICogcG9zdCgoKSA9PiBleGVjKGFyZykpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIGV4ZWN1dG9yXG4gKiAgLSBgZW5gIGltcGxlbWVudCBhcyBmdW5jdGlvbiBzY29wZS5cbiAqICAtIGBqYWAg6Zai5pWw44K544Kz44O844OX44Go44GX44Gm5a6f6KOFXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBvc3Q8VD4oZXhlY3V0b3I6ICgpID0+IFQpOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbihleGVjdXRvcik7XG59XG5cbi8qKlxuICogQGVuIEdlbmVyaWMgTm8tT3BlcmF0aW9uLlxuICogQGphIOaxjueUqCBOby1PcGVyYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vb3AoLi4uYXJnczogYW55W10pOiBhbnkgeyAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIC8vIG5vb3Bcbn1cblxuLyoqXG4gKiBAZW4gV2FpdCBmb3IgdGhlIGRlc2lnbmF0aW9uIGVsYXBzZS5cbiAqIEBqYSDmjIflrprmmYLplpPlh6bnkIbjgpLlvoXmqZ9cbiAqXG4gKiBAcGFyYW0gZWxhcHNlXG4gKiAgLSBgZW5gIHdhaXQgZWxhcHNlIFttc2VjXS5cbiAqICAtIGBqYWAg5b6F5qmf5pmC6ZaTIFttc2VjXVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2xlZXAoZWxhcHNlOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGVsYXBzZSkpO1xufVxuXG4vKipcbiAqIEBlbiBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIHdoZW4gaW52b2tlZCwgd2lsbCBvbmx5IGJlIHRyaWdnZXJlZCBhdCBtb3N0IG9uY2UgZHVyaW5nIGEgZ2l2ZW4gdGltZS5cbiAqIEBqYSDplqLmlbDjga7lrp/ooYzjgpIgd2FpdCBbbXNlY10g44GrMeWbnuOBq+WItumZkFxuICpcbiAqIEBleGFtcGxlIDxicj5cbiAqXG4gKiBgYGB0c1xuICogY29uc3QgdGhyb3R0bGVkID0gdGhyb3R0bGUodXBhdGVQb3NpdGlvbiwgMTAwKTtcbiAqICQod2luZG93KS5zY3JvbGwodGhyb3R0bGVkKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBleGVjdXRvclxuICogIC0gYGVuYCBzZWVkIGZ1bmN0aW9uLlxuICogIC0gYGphYCDlr77osaHjga7plqLmlbBcbiAqIEBwYXJhbSBlbGFwc2VcbiAqICAtIGBlbmAgd2FpdCBlbGFwc2UgW21zZWNdLlxuICogIC0gYGphYCDlvoXmqZ/mmYLplpMgW21zZWNdXG4gKiBAcGFyYW0gb3B0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdGhyb3R0bGU8VCBleHRlbmRzIEZ1bmN0aW9uPihleGVjdXRvcjogVCwgZWxhcHNlOiBudW1iZXIsIG9wdGlvbnM/OiB7IGxlYWRpbmc/OiBib29sZWFuOyB0cmFpbGluZz86IGJvb2xlYW47IH0pOiBUICYgeyBjYW5jZWwoKTogdm9pZDsgfSB7XG4gICAgY29uc3Qgb3B0cyA9IG9wdGlvbnMgfHwge307XG4gICAgbGV0IGhhbmRsZTogVGltZXJIYW5kbGUgfCB1bmRlZmluZWQ7XG4gICAgbGV0IGFyZ3M6IGFueVtdIHwgdW5kZWZpbmVkO1xuICAgIGxldCBjb250ZXh0OiBhbnksIHJlc3VsdDogYW55O1xuICAgIGxldCBwcmV2aW91cyA9IDA7XG5cbiAgICBjb25zdCBsYXRlciA9IGZ1bmN0aW9uICgpOiB2b2lkIHtcbiAgICAgICAgcHJldmlvdXMgPSBmYWxzZSA9PT0gb3B0cy5sZWFkaW5nID8gMCA6IERhdGUubm93KCk7XG4gICAgICAgIGhhbmRsZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmVzdWx0ID0gZXhlY3V0b3IuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGlmICghaGFuZGxlKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0gYXJncyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCB0aHJvdHRsZWQgPSBmdW5jdGlvbiAodGhpczogYW55LCAuLi5hcmc6IGFueVtdKTogYW55IHtcbiAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgaWYgKCFwcmV2aW91cyAmJiBmYWxzZSA9PT0gb3B0cy5sZWFkaW5nKSB7XG4gICAgICAgICAgICBwcmV2aW91cyA9IG5vdztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZW1haW5pbmcgPSBlbGFwc2UgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8taW52YWxpZC10aGlzXG4gICAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgICBhcmdzID0gWy4uLmFyZ107XG4gICAgICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPiBlbGFwc2UpIHtcbiAgICAgICAgICAgIGlmIChoYW5kbGUpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmV2aW91cyA9IG5vdztcbiAgICAgICAgICAgIHJlc3VsdCA9IGV4ZWN1dG9yLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKCFoYW5kbGUpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gYXJncyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghaGFuZGxlICYmIGZhbHNlICE9PSBvcHRzLnRyYWlsaW5nKSB7XG4gICAgICAgICAgICBoYW5kbGUgPSBzZXRUaW1lb3V0KGxhdGVyLCByZW1haW5pbmcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHRocm90dGxlZC5jYW5jZWwgPSBmdW5jdGlvbiAoKTogdm9pZCB7XG4gICAgICAgIGNsZWFyVGltZW91dChoYW5kbGUgYXMgVGltZXJIYW5kbGUpO1xuICAgICAgICBwcmV2aW91cyA9IDA7XG4gICAgICAgIGhhbmRsZSA9IGNvbnRleHQgPSBhcmdzID0gdW5kZWZpbmVkO1xuICAgIH07XG5cbiAgICByZXR1cm4gdGhyb3R0bGVkIGFzIGFueTtcbn1cblxuLyoqXG4gKiBAZW4gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCBhcyBsb25nIGFzIGl0IGNvbnRpbnVlcyB0byBiZSBpbnZva2VkLCB3aWxsIG5vdCBiZSB0cmlnZ2VyZWQuXG4gKiBAamEg5ZG844Gz5Ye644GV44KM44Gm44GL44KJIHdhaXQgW21zZWNdIOe1jOmBjuOBmeOCi+OBvuOBp+Wun+ihjOOBl+OBquOBhOmWouaVsOOCkui/lOWNtFxuICpcbiAqIEBwYXJhbSBleGVjdXRvclxuICogIC0gYGVuYCBzZWVkIGZ1bmN0aW9uLlxuICogIC0gYGphYCDlr77osaHjga7plqLmlbBcbiAqIEBwYXJhbSB3YWl0XG4gKiAgLSBgZW5gIHdhaXQgZWxhcHNlIFttc2VjXS5cbiAqICAtIGBqYWAg5b6F5qmf5pmC6ZaTIFttc2VjXVxuICogQHBhcmFtIGltbWVkaWF0ZVxuICogIC0gYGVuYCBJZiBgdHJ1ZWAgaXMgcGFzc2VkLCB0cmlnZ2VyIHRoZSBmdW5jdGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlLCBpbnN0ZWFkIG9mIHRoZSB0cmFpbGluZy5cbiAqICAtIGBqYWAgYHRydWVgIOOBruWgtOWQiCwg5Yid5Zue44Gu44Kz44O844Or44Gv5Y2z5pmC5a6f6KGMXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWJvdW5jZTxUIGV4dGVuZHMgRnVuY3Rpb24+KGV4ZWN1dG9yOiBULCB3YWl0OiBudW1iZXIsIGltbWVkaWF0ZT86IGJvb2xlYW4pOiBUICYgeyBjYW5jZWwoKTogdm9pZDsgfSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8taW52YWxpZC10aGlzICovXG4gICAgbGV0IGhhbmRsZTogVGltZXJIYW5kbGUgfCB1bmRlZmluZWQ7XG4gICAgbGV0IHJlc3VsdDogYW55O1xuXG4gICAgY29uc3QgbGF0ZXIgPSBmdW5jdGlvbiAoY29udGV4dDogYW55LCBhcmdzOiBhbnlbXSk6IHZvaWQge1xuICAgICAgICBoYW5kbGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBleGVjdXRvci5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBkZWJvdW5jZWQgPSBmdW5jdGlvbiAodGhpczogYW55LCAuLi5hcmdzOiBhbnlbXSk6IGFueSB7XG4gICAgICAgIGlmIChoYW5kbGUpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChoYW5kbGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbW1lZGlhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxOb3cgPSAhaGFuZGxlO1xuICAgICAgICAgICAgaGFuZGxlID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICAgICAgICBpZiAoY2FsbE5vdykge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGV4ZWN1dG9yLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFuZGxlID0gc2V0VGltZW91dChsYXRlciwgd2FpdCwgdGhpcywgWy4uLmFyZ3NdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBkZWJvdW5jZWQuY2FuY2VsID0gZnVuY3Rpb24gKCk6IHZvaWQge1xuICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlIGFzIFRpbWVySGFuZGxlKTtcbiAgICAgICAgaGFuZGxlID0gdW5kZWZpbmVkO1xuICAgIH07XG5cbiAgICByZXR1cm4gZGVib3VuY2VkIGFzIGFueTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWludmFsaWQtdGhpcyAqL1xufVxuXG4vKipcbiAqIEBlbiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGF0IG1vc3Qgb25lIHRpbWUsIG5vIG1hdHRlciBob3cgb2Z0ZW4geW91IGNhbGwgaXQuXG4gKiBAamEgMeW6puOBl+OBi+Wun+ihjOOBleOCjOOBquOBhOmWouaVsOOCkui/lOWNtC4gMuWbnuebruS7pemZjeOBr+acgOWIneOBruOCs+ODvOODq+OBruOCreODo+ODg+OCt+ODpeOCkui/lOWNtFxuICpcbiAqIEBwYXJhbSBleGVjdXRvclxuICogIC0gYGVuYCBzZWVkIGZ1bmN0aW9uLlxuICogIC0gYGphYCDlr77osaHjga7plqLmlbBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9uY2U8VCBleHRlbmRzIEZ1bmN0aW9uPihleGVjdXRvcjogVCk6IFQge1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWludmFsaWQtdGhpcywgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvbiAqL1xuICAgIGxldCBtZW1vOiBhbnk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0aGlzOiBhbnksIC4uLmFyZ3M6IGFueVtdKTogYW55IHtcbiAgICAgICAgaWYgKGV4ZWN1dG9yKSB7XG4gICAgICAgICAgICBtZW1vID0gZXhlY3V0b3IuY2FsbCh0aGlzLCAuLi5hcmdzKTtcbiAgICAgICAgICAgIGV4ZWN1dG9yID0gbnVsbCE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgfSBhcyBhbnk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1pbnZhbGlkLXRoaXMsIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb24gKi9cbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbi8qKlxuICogQGVuIENyZWF0ZSBlc2NhcGUgZnVuY3Rpb24gZnJvbSBtYXAuXG4gKiBAamEg5paH5a2X572u5o+b6Zai5pWw44KS5L2c5oiQXG4gKlxuICogQHBhcmFtIG1hcFxuICogIC0gYGVuYCBrZXk6IHRhcmdldCBjaGFyLCB2YWx1ZTogcmVwbGFjZSBjaGFyXG4gKiAgLSBgamFgIGtleTog572u5o+b5a++6LGhLCB2YWx1ZTog572u5o+b5paH5a2XXG4gKiBAcmV0dXJuc1xuICogIC0gYGVuYCBlc3BhY2UgZnVuY3Rpb25cbiAqICAtIGBqYWAg44Ko44K544Kx44O844OX6Zai5pWwXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFc2NhcGVyKG1hcDogb2JqZWN0KTogKHNyYzogUHJpbWl0aXZlKSA9PiBzdHJpbmcge1xuICAgIGNvbnN0IGVzY2FwZXIgPSAobWF0Y2g6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICAgIHJldHVybiBtYXBbbWF0Y2hdO1xuICAgIH07XG5cbiAgICBjb25zdCBzb3VyY2UgPSBgKD86JHtPYmplY3Qua2V5cyhtYXApLmpvaW4oJ3wnKX0pYDtcbiAgICBjb25zdCByZWdleFRlc3QgPSBSZWdFeHAoc291cmNlKTtcbiAgICBjb25zdCByZWdleFJlcGxhY2UgPSBSZWdFeHAoc291cmNlLCAnZycpO1xuXG4gICAgcmV0dXJuIChzcmM6IFByaW1pdGl2ZSk6IHN0cmluZyA9PiB7XG4gICAgICAgIHNyYyA9IChudWxsID09IHNyYyB8fCAnc3ltYm9sJyA9PT0gdHlwZW9mIHNyYykgPyAnJyA6IFN0cmluZyhzcmMpO1xuICAgICAgICByZXR1cm4gcmVnZXhUZXN0LnRlc3Qoc3JjKSA/IHNyYy5yZXBsYWNlKHJlZ2V4UmVwbGFjZSwgZXNjYXBlcikgOiBzcmM7XG4gICAgfTtcbn1cblxuY29uc3QgbWFwSHRtbEVzY2FwZSA9IHtcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7JyxcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgXCInXCI6ICcmIzM5OycsXG4gICAgJ2AnOiAnJiN4NjA7J1xufTtcblxuLyoqXG4gKiBAZW4gRXNjYXBlIEhUTUwgc3RyaW5nLlxuICogQGphIEhUTUwg44Gn5L2/55So44GZ44KL5paH5a2X44KS5Yi25b6h5paH5a2X44Gr572u5o+bXG4gKlxuICogQGJyaWVmIDxicj5cbiAqXG4gKiBgYGB0c1xuICogY29uc3QgbWFwSHRtbEVzY2FwZSA9IHtcbiAqICAgICAnPCc6ICcmbHQ7JyxcbiAqICAgICAnPic6ICcmZ3Q7JyxcbiAqICAgICAnJic6ICcmYW1wOycsXG4gKiAgICAgJ1wiJzogJyZxdW90OycsXG4gKiAgICAgXCInXCI6ICcmIzM5OycsXG4gKiAgICAgJ2AnOiAnJiN4NjA7J1xuICogfTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgZXNjYXBlSFRNTCA9IGNyZWF0ZUVzY2FwZXIobWFwSHRtbEVzY2FwZSk7XG5cbi8qKlxuICogQGVuIFVuZXNjYXBlIEhUTUwgc3RyaW5nLlxuICogQGphIEhUTUwg44Gn5L2/55So44GZ44KL5Yi25b6h5paH5a2X44KS5b6p5YWDXG4gKi9cbmV4cG9ydCBjb25zdCB1bmVzY2FwZUhUTUwgPSBjcmVhdGVFc2NhcGVyKGludmVydChtYXBIdG1sRXNjYXBlKSk7XG5cbi8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18vL1xuXG4vKipcbiAqIEBlbiBDb252ZXJ0IHRvIHRoZSBzdHlsZSBjb21wdWxzaW9uIHZhbHVlIGZyb20gaW5wdXQgc3RyaW5nLlxuICogQGphIOWFpeWKm+aWh+Wtl+WIl+OCkuWei+W8t+WItuOBl+OBn+WApOOBq+WkieaPm1xuICpcbiAqIEBwYXJhbSBkYXRhXG4gKiAgLSBgZW5gIGlucHV0IHN0cmluZ1xuICogIC0gYGphYCDlpInmj5vlr77osaHjga7mloflrZfliJdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvVHlwZWREYXRhKGRhdGE6IHN0cmluZyB8IHVuZGVmaW5lZCk6IFR5cGVkRGF0YSB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKCd0cnVlJyA9PT0gZGF0YSkge1xuICAgICAgICAvLyBib29sZWFuOiB0cnVlXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoJ2ZhbHNlJyA9PT0gZGF0YSkge1xuICAgICAgICAvLyBib29sZWFuOiBmYWxzZVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmICgnbnVsbCcgPT09IGRhdGEpIHtcbiAgICAgICAgLy8gbnVsbFxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKGRhdGEgPT09IFN0cmluZyhOdW1iZXIoZGF0YSkpKSB7XG4gICAgICAgIC8vIG51bWJlcjog5pWw5YCk5aSJ5o+bIOKGkiDmloflrZfliJflpInmj5vjgaflhYPjgavmiLvjgovjgajjgY1cbiAgICAgICAgcmV0dXJuIE51bWJlcihkYXRhKTtcbiAgICB9IGVsc2UgaWYgKGRhdGEgJiYgL14oPzpcXHtbXFx3XFxXXSpcXH18XFxbW1xcd1xcV10qXFxdKSQvLnRlc3QoZGF0YSkpIHtcbiAgICAgICAgLy8gb2JqZWN0XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHN0cmluZyAvIHVuZGVmaW5lZFxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnQgdG8gc3RyaW5nIGZyb20gW1tUeXBlZERhdGFdXS5cbiAqIEBqYSBbW1R5cGVkRGF0YV1dIOOCkuaWh+Wtl+WIl+OBq+WkieaPm1xuICpcbiAqIEBwYXJhbSBkYXRhXG4gKiAgLSBgZW5gIGlucHV0IHN0cmluZ1xuICogIC0gYGphYCDlpInmj5vlr77osaHjga7mloflrZfliJdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21UeXBlZERhdGEoZGF0YTogVHlwZWREYXRhIHwgdW5kZWZpbmVkKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAodW5kZWZpbmVkID09PSBkYXRhIHx8IGlzU3RyaW5nKGRhdGEpKSB7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QoZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcoZGF0YSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBlbiBDb252ZXJ0IHRvIGBXZWIgQVBJYCBzdG9ja2VkIHR5cGUuIDxicj5cbiAqICAgICBFbnN1cmUgbm90IHRvIHJldHVybiBgdW5kZWZpbmVkYCB2YWx1ZS5cbiAqIEBqYSBgV2ViIEFQSWAg5qC857SN5b2i5byP44Gr5aSJ5o+bIDxicj5cbiAqICAgICBgdW5kZWZpbmVkYCDjgpLov5TljbTjgZfjgarjgYTjgZPjgajjgpLkv53oqLxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRyb3BVbmRlZmluZWQ8VD4odmFsdWU6IFQgfCBudWxsIHwgdW5kZWZpbmVkLCBuaWxTZXJpYWxpemUgPSBmYWxzZSk6IFQgfCAnbnVsbCcgfCAndW5kZWZpbmVkJyB8IG51bGwge1xuICAgIHJldHVybiBudWxsICE9IHZhbHVlID8gdmFsdWUgOiAobmlsU2VyaWFsaXplID8gU3RyaW5nKHZhbHVlKSA6IG51bGwpIGFzIFQgfCAnbnVsbCcgfCAndW5kZWZpbmVkJyB8IG51bGw7XG59XG5cbi8qKlxuICogQGVuIERlc2VyaWFsaXplIGZyb20gYFdlYiBBUElgIHN0b2NrZWQgdHlwZS4gPGJyPlxuICogICAgIENvbnZlcnQgZnJvbSAnbnVsbCcgb3IgJ3VuZGVmaW5lZCcgc3RyaW5nIHRvIG9yaWdpbmFsIHR5cGUuXG4gKiBAamEgJ251bGwnIG9yICd1bmRlZmluZWQnIOOCkuOCguOBqOOBruWei+OBq+aIu+OBmVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzdG9yZU5pbDxUPih2YWx1ZTogVCB8ICdudWxsJyB8ICd1bmRlZmluZWQnKTogVCB8IG51bGwgfCB1bmRlZmluZWQge1xuICAgIGlmICgnbnVsbCcgPT09IHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoJ3VuZGVmaW5lZCcgPT09IHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbmxldCBfbG9jYWxJZCA9IDA7XG5cbi8qKlxuICogQGVuIEdldCBsb2NhbCB1bmlxdWUgaWQuIDxicj5cbiAqICAgICBcImxvY2FsIHVuaXF1ZVwiIG1lYW5zIGd1YXJhbnRlZXMgdW5pcXVlIGR1cmluZyBpbiBzY3JpcHQgbGlmZSBjeWNsZSBvbmx5LlxuICogQGphIOODreODvOOCq+ODq+ODpuODi+ODvOOCryBJRCDjga7lj5blvpcgPGJyPlxuICogICAgIOOCueOCr+ODquODl+ODiOODqeOCpOODleOCteOCpOOCr+ODq+S4reOBruWQjOS4gOaAp+OCkuS/neiovOOBmeOCiy5cbiAqXG4gKiBAcGFyYW0gcHJlZml4XG4gKiAgLSBgZW5gIElEIHByZWZpeFxuICogIC0gYGphYCBJRCDjgavku5jkuI7jgZnjgosgUHJlZml4XG4gKiBAcGFyYW0gemVyb1BhZFxuICogIC0gYGVuYCAwIHBhZGRpbmcgb3JkZXJcbiAqICAtIGBqYWAgMCDoqbDjgoHjgZnjgovmoYHmlbDjgpLmjIflrppcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGx1aWQocHJlZml4ID0gJycsIHplcm9QYWQ/OiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IGlkID0gKCsrX2xvY2FsSWQpLnRvU3RyaW5nKDE2KTtcbiAgICByZXR1cm4gKG51bGwgIT0gemVyb1BhZCkgPyBgJHtwcmVmaXh9JHtpZC5wYWRTdGFydCh6ZXJvUGFkLCAnMCcpfWAgOiBgJHtwcmVmaXh9JHtpZH1gO1xufVxuXG4vL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fLy9cblxuLyoqIEBpbnRlcm5hbCAqL1xuY29uc3QgX3JlZ2V4Q2FuY2VsTGlrZVN0cmluZyA9IC8oYWJvcnR8Y2FuY2VsKS9pbTtcblxuLyoqXG4gKiBAZW4gUHJlc3VtZSB3aGV0aGVyIGl0J3MgYSBjYW5jZWxlZCBlcnJvci5cbiAqIEBqYSDjgq3jg6Pjg7Pjgrvjg6vjgZXjgozjgZ/jgqjjg6njg7zjgafjgYLjgovjgYvmjqjlrppcbiAqXG4gKiBAcGFyYW0gZXJyb3JcbiAqICAtIGBlbmAgYW4gZXJyb3Igb2JqZWN0IGhhbmRsZWQgaW4gYGNhdGNoYCBibG9jay5cbiAqICAtIGBqYWAgYGNhdGNoYCDnr4Djgarjganjgafoo5zotrPjgZfjgZ/jgqjjg6njg7zjgpLmjIflrppcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2hhbmNlbExpa2VFcnJvcihlcnJvcjogdW5rbm93bik6IGJvb2xlYW4ge1xuICAgIGlmIChudWxsID09IGVycm9yKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKGVycm9yKSkge1xuICAgICAgICByZXR1cm4gX3JlZ2V4Q2FuY2VsTGlrZVN0cmluZy50ZXN0KGVycm9yKTtcbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KGVycm9yKSkge1xuICAgICAgICByZXR1cm4gX3JlZ2V4Q2FuY2VsTGlrZVN0cmluZy50ZXN0KChlcnJvciBhcyBFcnJvcikubWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbi8qKlxuICogQGVuIENvbnZlcnRzIGZpcnN0IGxldHRlciBvZiB0aGUgc3RyaW5nIHRvIHVwcGVyY2FzZS5cbiAqIEBqYSDmnIDliJ3jga7mloflrZfjgpLlpKfmloflrZfjgavlpInmj5tcbiAqXG4gKlxuICogQGV4YW1wbGUgPGJyPlxuICpcbiAqIGBgYHRzXG4gKiBjYXBpdGFsaXplKFwiZm9vIEJhclwiKTtcbiAqIC8vID0+IFwiRm9vIEJhclwiXG4gKlxuICogY2FwaXRhbGl6ZShcIkZPTyBCYXJcIiwgdHJ1ZSk7XG4gKiAvLyA9PiBcIkZvbyBiYXJcIlxuICogYGBgXG4gKlxuICogQHBhcmFtIHNyY1xuICogIC0gYGVuYCBzb3VyY2Ugc3RyaW5nXG4gKiAgLSBgamFgIOWkieaPm+WFg+aWh+Wtl+WIl1xuICogQHBhcmFtIGxvd2VyY2FzZVJlc3RcbiAqICAtIGBlbmAgSWYgYHRydWVgIGlzIHBhc3NlZCwgdGhlIHJlc3Qgb2YgdGhlIHN0cmluZyB3aWxsIGJlIGNvbnZlcnRlZCB0byBsb3dlciBjYXNlXG4gKiAgLSBgamFgIGB0cnVlYCDjgpLmjIflrprjgZfjgZ/loLTlkIgsIDLmloflrZfnm67ku6XpmY3jgoLlsI/mloflrZfljJZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhcGl0YWxpemUoc3JjOiBzdHJpbmcsIGxvd2VyY2FzZVJlc3QgPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgY29uc3QgcmVtYWluaW5nQ2hhcnMgPSAhbG93ZXJjYXNlUmVzdCA/IHNyYy5zbGljZSgxKSA6IHNyYy5zbGljZSgxKS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiBzcmMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyByZW1haW5pbmdDaGFycztcbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydHMgZmlyc3QgbGV0dGVyIG9mIHRoZSBzdHJpbmcgdG8gbG93ZXJjYXNlLlxuICogQGphIOacgOWIneOBruaWh+Wtl+OCkuWwj+aWh+Wtl+WMllxuICpcbiAqIEBleGFtcGxlIDxicj5cbiAqXG4gKiBgYGB0c1xuICogZGVjYXBpdGFsaXplKFwiRm9vIEJhclwiKTtcbiAqIC8vID0+IFwiZm9vIEJhclwiXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3JjXG4gKiAgLSBgZW5gIHNvdXJjZSBzdHJpbmdcbiAqICAtIGBqYWAg5aSJ5o+b5YWD5paH5a2X5YiXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNhcGl0YWxpemUoc3JjOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBzcmMuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkgKyBzcmMuc2xpY2UoMSk7XG59XG5cbi8qKlxuICogQGVuIENvbnZlcnRzIHVuZGVyc2NvcmVkIG9yIGRhc2hlcml6ZWQgc3RyaW5nIHRvIGEgY2FtZWxpemVkIG9uZS4gPGJyPlxuICogICAgIEJlZ2lucyB3aXRoIGEgbG93ZXIgY2FzZSBsZXR0ZXIgdW5sZXNzIGl0IHN0YXJ0cyB3aXRoIGFuIHVuZGVyc2NvcmUsIGRhc2ggb3IgYW4gdXBwZXIgY2FzZSBsZXR0ZXIuXG4gKiBAamEgYF9gLCBgLWAg5Yy65YiH44KK5paH5a2X5YiX44KS44Kt44Oj44Oh44Or44Kx44O844K55YyWIDxicj5cbiAqICAgICBgLWAg44G+44Gf44Gv5aSn5paH5a2X44K544K/44O844OI44Gn44GC44KM44GwLCDlpKfmloflrZfjgrnjgr/jg7zjg4jjgYzml6LlrprlgKRcbiAqXG4gKiBAZXhhbXBsZSA8YnI+XG4gKlxuICogYGBgdHNcbiAqIGNhbWVsaXplKFwibW96LXRyYW5zZm9ybVwiKTtcbiAqIC8vID0+IFwibW96VHJhbnNmb3JtXCJcbiAqXG4gKiBjYW1lbGl6ZShcIi1tb3otdHJhbnNmb3JtXCIpO1xuICogLy8gPT4gXCJNb3pUcmFuc2Zvcm1cIlxuICpcbiAqIGNhbWVsaXplKFwiX21vel90cmFuc2Zvcm1cIik7XG4gKiAvLyA9PiBcIk1velRyYW5zZm9ybVwiXG4gKlxuICogY2FtZWxpemUoXCJNb3otdHJhbnNmb3JtXCIpO1xuICogLy8gPT4gXCJNb3pUcmFuc2Zvcm1cIlxuICpcbiAqIGNhbWVsaXplKFwiLW1vei10cmFuc2Zvcm1cIiwgdHJ1ZSk7XG4gKiAvLyA9PiBcIm1velRyYW5zZm9ybVwiXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3JjXG4gKiAgLSBgZW5gIHNvdXJjZSBzdHJpbmdcbiAqICAtIGBqYWAg5aSJ5o+b5YWD5paH5a2X5YiXXG4gKiBAcGFyYW0gbG93ZXJcbiAqICAtIGBlbmAgSWYgYHRydWVgIGlzIHBhc3NlZCwgZm9yY2UgY29udmVydHMgdG8gbG93ZXIgY2FtZWwgY2FzZSBpbiBzdGFydHMgd2l0aCB0aGUgc3BlY2lhbCBjYXNlLlxuICogIC0gYGphYCDlvLfliLbnmoTjgavlsI/mloflrZfjgrnjgr/jg7zjg4jjgZnjgovloLTlkIjjgavjga8gYHRydWVgIOOCkuaMh+WumlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FtZWxpemUoc3JjOiBzdHJpbmcsIGxvd2VyID0gZmFsc2UpOiBzdHJpbmcge1xuICAgIHNyYyA9IHNyYy50cmltKCkucmVwbGFjZSgvWy1fXFxzXSsoLik/L2csIChtYXRjaCwgYykgPT4ge1xuICAgICAgICByZXR1cm4gYyA/IGMudG9VcHBlckNhc2UoKSA6ICcnO1xuICAgIH0pO1xuXG4gICAgaWYgKHRydWUgPT09IGxvd2VyKSB7XG4gICAgICAgIHJldHVybiBkZWNhcGl0YWxpemUoc3JjKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc3JjO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydHMgc3RyaW5nIHRvIGNhbWVsaXplZCBjbGFzcyBuYW1lLiBGaXJzdCBsZXR0ZXIgaXMgYWx3YXlzIHVwcGVyIGNhc2UuXG4gKiBAamEg5YWI6aCt5aSn5paH5a2X44Gu44Kt44Oj44Oh44Or44Kx44O844K544Gr5aSJ5o+bXG4gKlxuICogQGV4YW1wbGUgPGJyPlxuICpcbiAqIGBgYHRzXG4gKiBjbGFzc2lmeShcInNvbWVfY2xhc3NfbmFtZVwiKTtcbiAqIC8vID0+IFwiU29tZUNsYXNzTmFtZVwiXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3JjXG4gKiAgLSBgZW5gIHNvdXJjZSBzdHJpbmdcbiAqICAtIGBqYWAg5aSJ5o+b5YWD5paH5a2X5YiXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc2lmeShzcmM6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGNhcGl0YWxpemUoY2FtZWxpemUoc3JjLnJlcGxhY2UoL1tcXFdfXS9nLCAnICcpKS5yZXBsYWNlKC9cXHMvZywgJycpKTtcbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydHMgYSBjYW1lbGl6ZWQgb3IgZGFzaGVyaXplZCBzdHJpbmcgaW50byBhbiB1bmRlcnNjb3JlZCBvbmUuXG4gKiBAamEg44Kt44Oj44Oh44Or44Kx44O844K5IG9yIGAtYCDjgaTjgarjgY7mloflrZfliJfjgpIgYF9gIOOBpOOBquOBjuOBq+WkieaPm1xuICpcbiAqIEBleGFtcGxlIDxicj5cbiAqXG4gKiBgYGB0c1xuICogdW5kZXJzY29yZWQoXCJNb3pUcmFuc2Zvcm1cIik7XG4gKiAvLyA9PiBcIm1vel90cmFuc2Zvcm1cIlxuICogYGBgXG4gKlxuICogQHBhcmFtIHNyY1xuICogIC0gYGVuYCBzb3VyY2Ugc3RyaW5nXG4gKiAgLSBgamFgIOWkieaPm+WFg+aWh+Wtl+WIl1xuICovXG5leHBvcnQgZnVuY3Rpb24gdW5kZXJzY29yZWQoc3JjOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBzcmMudHJpbSgpLnJlcGxhY2UoLyhbYS16XFxkXSkoW0EtWl0rKS9nLCAnJDFfJDInKS5yZXBsYWNlKC9bLVxcc10rL2csICdfJykudG9Mb3dlckNhc2UoKTtcbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydHMgYSB1bmRlcnNjb3JlZCBvciBjYW1lbGl6ZWQgc3RyaW5nIGludG8gYW4gZGFzaGVyaXplZCBvbmUuXG4gKiBAamEg44Kt44Oj44Oh44Or44Kx44O844K5IG9yIGBfYCDjgaTjgarjgY7mloflrZfliJfjgpIgYC1gIOOBpOOBquOBjuOBq+WkieaPm1xuICpcbiAqIEBleGFtcGxlIDxicj5cbiAqXG4gKiBgYGB0c1xuICogZGFzaGVyaXplKFwiTW96VHJhbnNmb3JtXCIpO1xuICogLy8gPT4gXCItbW96LXRyYW5zZm9ybVwiXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3JjXG4gKiAgLSBgZW5gIHNvdXJjZSBzdHJpbmdcbiAqICAtIGBqYWAg5aSJ5o+b5YWD5paH5a2X5YiXXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYXNoZXJpemUoc3JjOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBzcmMudHJpbSgpLnJlcGxhY2UoLyhbQS1aXSkvZywgJy0kMScpLnJlcGxhY2UoL1tfXFxzXSsvZywgJy0nKS50b0xvd2VyQ2FzZSgpO1xufVxuIiwiLyogZXNsaW50LWRpc2FibGVcbiAgIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAqL1xuXG5pbXBvcnQge1xuICAgIEFyZ3VtZW50cyxcbiAgICBpc1N0cmluZyxcbiAgICBpc0FycmF5LFxuICAgIGlzU3ltYm9sLFxuICAgIGNsYXNzTmFtZSxcbiAgICB2ZXJpZnksXG59IGZyb20gJ0BjZHAvY29yZS11dGlscyc7XG5pbXBvcnQge1xuICAgIEV2ZW50QWxsLFxuICAgIFN1YnNjcmlwdGlvbixcbiAgICBTdWJzY3JpYmFibGUsXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbi8qKiBAaW50ZXJuYWwgTGlzbmVyIOagvOe0jeW9ouW8jyAqL1xudHlwZSBMaXN0ZW5lcnNNYXA8VD4gPSBNYXA8a2V5b2YgVCwgU2V0PCguLi5hcmdzOiBUW2tleW9mIFRdW10pID0+IHVua25vd24+PjtcblxuLyoqIEBpbnRlcm5hbCBMaXNuZXIg44Gu5byx5Y+C54WnICovXG5jb25zdCBfbWFwTGlzdGVuZXJzID0gbmV3IFdlYWtNYXA8RXZlbnRQdWJsaXNoZXI8YW55PiwgTGlzdGVuZXJzTWFwPGFueT4+KCk7XG5cbi8qKiBAaW50ZXJuYWwgTGlzbmVyTWFwIOOBruWPluW+lyAqL1xuZnVuY3Rpb24gbGlzdGVuZXJzPFQ+KGluc3RhbmNlOiBFdmVudFB1Ymxpc2hlcjxUPik6IExpc3RlbmVyc01hcDxUPiB7XG4gICAgaWYgKCFfbWFwTGlzdGVuZXJzLmhhcyhpbnN0YW5jZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhpcyBpcyBub3QgYSB2YWxpZCBFdmVudFB1Ymxpc2hlci4nKTtcbiAgICB9XG4gICAgcmV0dXJuIF9tYXBMaXN0ZW5lcnMuZ2V0KGluc3RhbmNlKSBhcyBMaXN0ZW5lcnNNYXA8VD47XG59XG5cbi8qKiBAaW50ZXJuYWwgQ2hhbm5lbCDjga7lnovmpJzoqLwgKi9cbmZ1bmN0aW9uIHZhbGlkQ2hhbm5lbChjaGFubmVsOiB1bmtub3duKTogdm9pZCB8IG5ldmVyIHtcbiAgICBpZiAoaXNTdHJpbmcoY2hhbm5lbCkgfHwgaXNTeW1ib2woY2hhbm5lbCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBUeXBlIG9mICR7Y2xhc3NOYW1lKGNoYW5uZWwpfSBpcyBub3QgYSB2YWxpZCBjaGFubmVsLmApO1xufVxuXG4vKiogQGludGVybmFsIExpc3RlbmVyIOOBruWei+aknOiovCAqL1xuZnVuY3Rpb24gdmFsaWRMaXN0ZW5lcihsaXN0ZW5lcj86ICguLi5hcmdzOiB1bmtub3duW10pID0+IHVua25vd24pOiBhbnkgfCBuZXZlciB7XG4gICAgaWYgKG51bGwgIT0gbGlzdGVuZXIpIHtcbiAgICAgICAgdmVyaWZ5KCd0eXBlT2YnLCAnZnVuY3Rpb24nLCBsaXN0ZW5lcik7XG4gICAgfVxuICAgIHJldHVybiBsaXN0ZW5lcjtcbn1cblxuLyoqIEBpbnRlcm5hbCBldmVudCDnmbrooYwgKi9cbmZ1bmN0aW9uIHRyaWdnZXJFdmVudDxFdmVudCwgQ2hhbm5lbCBleHRlbmRzIGtleW9mIEV2ZW50PihcbiAgICBtYXA6IExpc3RlbmVyc01hcDxFdmVudD4sXG4gICAgY2hhbm5lbDogQ2hhbm5lbCxcbiAgICBvcmlnaW5hbDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIC4uLmFyZ3M6IEFyZ3VtZW50czxQYXJ0aWFsPEV2ZW50W0NoYW5uZWxdPj5cbik6IHZvaWQge1xuICAgIGNvbnN0IGxpc3QgPSBtYXAuZ2V0KGNoYW5uZWwpO1xuICAgIGlmICghbGlzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoY29uc3QgbGlzdGVuZXIgb2YgbGlzdCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZXZlbnRBcmdzID0gb3JpZ2luYWwgPyBbb3JpZ2luYWwsIC4uLmFyZ3NdIDogYXJncztcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZWQgPSBsaXN0ZW5lciguLi5ldmVudEFyZ3MpO1xuICAgICAgICAgICAgLy8gaWYgcmVjZWl2ZWQgJ3RydWUnLCBzdG9wIGRlbGVnYXRpb24uXG4gICAgICAgICAgICBpZiAodHJ1ZSA9PT0gaGFuZGxlZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBQcm9taXNlLnJlamVjdChlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbi8qKlxuICogQGVuIEV2ZW50aW5nIGZyYW1ld29yayBjbGFzcyB3aXRoIGVuc3VyaW5nIHR5cGUtc2FmZSBmb3IgVHlwZVNjcmlwdC4gPGJyPlxuICogICAgIFRoZSBjbGllbnQgb2YgdGhpcyBjbGFzcyBjYW4gaW1wbGVtZW50IG9yaWdpbmFsIFB1Yi1TdWIgKE9ic2VydmVyKSBkZXNpZ24gcGF0dGVybi5cbiAqIEBqYSDlnovlronlhajjgpLkv53pmpzjgZnjgovjgqTjg5njg7Pjg4jnmbvpjLLjg7vnmbrooYzjgq/jg6njgrkgPGJyPlxuICogICAgIOOCr+ODqeOCpOOCouODs+ODiOOBr+acrOOCr+ODqeOCueOCkua0vueUn+OBl+OBpueLrOiHquOBriBQdWItU3ViIChPYnNlcnZlcikg44OR44K/44O844Oz44KS5a6f6KOF5Y+v6IO9XG4gKlxuICogQGV4YW1wbGUgPGJyPlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBFdmVudFB1Ymxpc2hlciB9IGZyb20gJ0BjZHAvZXZlbnRzJztcbiAqXG4gKiAvLyBkZWNsYXJlIGV2ZW50IGludGVyZmFjZVxuICogaW50ZXJmYWNlIFNhbXBsZUV2ZW50IHtcbiAqICAgaG9nZTogW251bWJlciwgc3RyaW5nXTsgICAgICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9uJ3MgYXJncyB0eXBlIHR1cGxlXG4gKiAgIGZvbzogW3ZvaWRdOyAgICAgICAgICAgICAgICAgICAvLyBubyBhcmdzXG4gKiAgIGhvbzogdm9pZDsgICAgICAgICAgICAgICAgICAgICAvLyBubyBhcmdzIChzYW1lIHRoZSB1cG9uKVxuICogICBiYXI6IFtFcnJvcl07ICAgICAgICAgICAgICAgICAgLy8gYW55IGNsYXNzIGlzIGF2YWlsYWJsZS5cbiAqICAgYmF6OiBFcnJvciB8IE51bWJlcjsgICAgICAgICAgIC8vIGlmIG9ubHkgb25lIGFyZ3VtZW50LCBgW11gIGlzIG5vdCByZXF1aXJlZC5cbiAqIH1cbiAqXG4gKiAvLyBkZWNsYXJlIGNsaWVudCBjbGFzc1xuICogY2xhc3MgU2FtcGxlUHVibGlzaGVyIGV4dGVuZHMgRXZlbnRQdWJsaXNoZXI8U2FtcGxlRXZlbnQ+IHtcbiAqICAgOlxuICogICBzb21lTWV0aG9kKCk6IHZvaWQge1xuICogICAgIHRoaXMucHVibGlzaCgnaG9nZScsIDEwMCwgJ3Rlc3QnKTsgICAgICAgLy8gT0suIHN0YW5kYXJkIHVzYWdlLlxuICogICAgIHRoaXMucHVibGlzaCgnaG9nZScsIDEwMCwgdHJ1ZSk7ICAgICAgICAgLy8gTkcuIGFyZ3VtZW50IG9mIHR5cGUgJ3RydWUnIGlzIG5vdCBhc3NpZ25hYmxlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgdG8gcGFyYW1ldGVyIG9mIHR5cGUgJ3N0cmluZyB8IHVuZGVmaW5lZCcuXG4gKiAgICAgdGhpcy5wdWJsaXNoKCdob2dlJywgMTAwKTsgICAgICAgICAgICAgICAvLyBPSy4gYWxsIGFyZ3MgdG8gYmUgb3B0aW9uYWwgYXV0b21hdGljYWxseS5cbiAqICAgICB0aGlzLnB1Ymxpc2goJ2ZvbycpOyAgICAgICAgICAgICAgICAgICAgIC8vIE9LLiBzdGFuZGFyZCB1c2FnZS5cbiAqICAgICB0aGlzLnB1Ymxpc2goJ2ZvbycsIDEwMCk7ICAgICAgICAgICAgICAgIC8vIE5HLiBhcmd1bWVudCBvZiB0eXBlICcxMDAnIGlzIG5vdCBhc3NpZ25hYmxlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgdG8gcGFyYW1ldGVyIG9mIHR5cGUgJ3ZvaWQgfCB1bmRlZmluZWQnLlxuICogICB9XG4gKiB9XG4gKlxuICogY29uc3Qgc2FtcGxlID0gbmV3IFNhbXBsZVB1Ymxpc2hlcigpO1xuICpcbiAqIHNhbXBsZS5vbignaG9nZScsIChhOiBudW1iZXIsIGI6IHN0cmluZykgPT4geyAuLi4gfSk7ICAgIC8vIE9LLiBzdGFuZGFyZCB1c2FnZS5cbiAqIHNhbXBsZS5vbignaG9nZScsIChhOiBudW1iZXIsIGI6IGJvb2xlYW4pID0+IHsgLi4uIH0pOyAgIC8vIE5HLiB0eXBlcyBvZiBwYXJhbWV0ZXJzICdiJ1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIGFuZCAnYXJnc18xJyBhcmUgaW5jb21wYXRpYmxlLlxuICogc2FtcGxlLm9uKCdob2dlJywgKGEpID0+IHsgLi4uIH0pOyAgICAgICAgICAgICAgICAgICAgICAgLy8gT0suIGFsbCBhcmdzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgdG8gYmUgb3B0aW9uYWwgYXV0b21hdGljYWxseS5cbiAqIHNhbXBsZS5vbignaG9nZScsIChhLCBiLCBjKSA9PiB7IC4uLiB9KTsgICAgICAgICAgICAgICAgIC8vIE5HLiBleHBlY3RlZCAxLTIgYXJndW1lbnRzLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIGJ1dCBnb3QgMy5cbiAqIGBgYFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRXZlbnRQdWJsaXNoZXI8RXZlbnQgZXh0ZW5kcyB7fT4gaW1wbGVtZW50cyBTdWJzY3JpYmFibGU8RXZlbnQ+IHtcblxuICAgIC8qKiBjb25zdHJ1Y3RvciAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB2ZXJpZnkoJ2luc3RhbmNlT2YnLCBFdmVudFB1Ymxpc2hlciwgdGhpcyk7XG4gICAgICAgIF9tYXBMaXN0ZW5lcnMuc2V0KHRoaXMsIG5ldyBNYXAoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIE5vdGlmeSBldmVudCB0byBjbGllbnRzLlxuICAgICAqIEBqYSBldmVudCDnmbrooYxcbiAgICAgKlxuICAgICAqIEBwYXJhbSBjaGFubmVsXG4gICAgICogIC0gYGVuYCBldmVudCBjaGFubmVsIGtleS4gKHN0cmluZyB8IHN5bWJvbClcbiAgICAgKiAgLSBgamFgIOOCpOODmeODs+ODiOODgeODo+ODjeODq+OCreODvCAoc3RyaW5nIHwgc3ltYm9sKVxuICAgICAqIEBwYXJhbSBhcmdzXG4gICAgICogIC0gYGVuYCBhcmd1bWVudHMgZm9yIGNhbGxiYWNrIGZ1bmN0aW9uIG9mIHRoZSBgY2hhbm5lbGAgY29ycmVzcG9uZGluZy5cbiAgICAgKiAgLSBgamFgIGBjaGFubmVsYCDjgavlr77lv5zjgZfjgZ/jgrPjg7zjg6vjg5Djg4Pjgq/plqLmlbDjgavmuKHjgZnlvJXmlbBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcHVibGlzaDxDaGFubmVsIGV4dGVuZHMga2V5b2YgRXZlbnQ+KGNoYW5uZWw6IENoYW5uZWwsIC4uLmFyZ3M6IEFyZ3VtZW50czxQYXJ0aWFsPEV2ZW50W0NoYW5uZWxdPj4pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbWFwID0gbGlzdGVuZXJzKHRoaXMpO1xuICAgICAgICB2YWxpZENoYW5uZWwoY2hhbm5lbCk7XG4gICAgICAgIHRyaWdnZXJFdmVudChtYXAsIGNoYW5uZWwsIHVuZGVmaW5lZCwgLi4uYXJncyk7XG4gICAgICAgIC8vIHRyaWdnZXIgZm9yIGFsbCBoYW5kbGVyXG4gICAgICAgIGlmICgnKicgIT09IGNoYW5uZWwpIHtcbiAgICAgICAgICAgIHRyaWdnZXJFdmVudChtYXAgYXMgYW55IGFzIExpc3RlbmVyc01hcDxFdmVudEFsbD4sICcqJywgY2hhbm5lbCBhcyBzdHJpbmcsIC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gaW1wbGVtZW50czogU3Vic2NyaWJhYmxlPEV2ZW50PlxuXG4gICAgLyoqXG4gICAgICogQGVuIENoZWNrIHdoZXRoZXIgdGhpcyBvYmplY3QgaGFzIGNsaWVudHMuXG4gICAgICogQGphIOOCr+ODqeOCpOOCouODs+ODiOOBjOWtmOWcqOOBmeOCi+OBi+WIpOWumlxuICAgICAqXG4gICAgICogQHBhcmFtIGNoYW5uZWxcbiAgICAgKiAgLSBgZW5gIGV2ZW50IGNoYW5uZWwga2V5LiAoc3RyaW5nIHwgc3ltYm9sKVxuICAgICAqICAtIGBqYWAg44Kk44OZ44Oz44OI44OB44Oj44ON44Or44Kt44O8IChzdHJpbmcgfCBzeW1ib2wpXG4gICAgICogQHBhcmFtIGxpc3RlbmVyXG4gICAgICogIC0gYGVuYCBjYWxsYmFjayBmdW5jdGlvbiBvZiB0aGUgYGNoYW5uZWxgIGNvcnJlc3BvbmRpbmcuXG4gICAgICogIC0gYGphYCBgY2hhbm5lbGAg44Gr5a++5b+c44GX44Gf44Kz44O844Or44OQ44OD44Kv6Zai5pWwXG4gICAgICovXG4gICAgaGFzTGlzdGVuZXI8Q2hhbm5lbCBleHRlbmRzIGtleW9mIEV2ZW50PihjaGFubmVsPzogQ2hhbm5lbCwgbGlzdGVuZXI/OiAoLi4uYXJnczogQXJndW1lbnRzPEV2ZW50W0NoYW5uZWxdPikgPT4gdW5rbm93bik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBtYXAgPSBsaXN0ZW5lcnModGhpcyk7XG4gICAgICAgIGlmIChudWxsID09IGNoYW5uZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXAuc2l6ZSA+IDA7XG4gICAgICAgIH1cbiAgICAgICAgdmFsaWRDaGFubmVsKGNoYW5uZWwpO1xuICAgICAgICBpZiAobnVsbCA9PSBsaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuIG1hcC5oYXMoY2hhbm5lbCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsaWRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBtYXAuZ2V0KGNoYW5uZWwpO1xuICAgICAgICByZXR1cm4gbGlzdCA/IGxpc3QuaGFzKGxpc3RlbmVyKSA6IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBSZXR1cm5zIHJlZ2lzdGVyZWQgY2hhbm5lbCBrZXlzLlxuICAgICAqIEBqYSDnmbvpjLLjgZXjgozjgabjgYTjgovjg4Hjg6Pjg43jg6vjgq3jg7zjgpLov5TljbRcbiAgICAgKi9cbiAgICBjaGFubmVscygpOiAoa2V5b2YgRXZlbnQpW10ge1xuICAgICAgICByZXR1cm4gWy4uLmxpc3RlbmVycyh0aGlzKS5rZXlzKCldO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBTdWJzY3JpdmUgZXZlbnQocykuXG4gICAgICogQGphIOOCpOODmeODs+ODiOizvOiqreioreWumlxuICAgICAqXG4gICAgICogQHBhcmFtIGNoYW5uZWxcbiAgICAgKiAgLSBgZW5gIHRhcmdldCBldmVudCBjaGFubmVsIGtleS4gKHN0cmluZyB8IHN5bWJvbClcbiAgICAgKiAgLSBgamFgIOWvvuixoeOBruOCpOODmeODs+ODiOODgeODo+ODjeODq+OCreODvCAoc3RyaW5nIHwgc3ltYm9sKVxuICAgICAqIEBwYXJhbSBsaXN0ZW5lclxuICAgICAqICAtIGBlbmAgY2FsbGJhY2sgZnVuY3Rpb24gb2YgdGhlIGBjaGFubmVsYCBjb3JyZXNwb25kaW5nLlxuICAgICAqICAtIGBqYWAgYGNoYW5uZWxgIOOBq+WvvuW/nOOBl+OBn+OCs+ODvOODq+ODkOODg+OCr+mWouaVsFxuICAgICAqL1xuICAgIG9uPENoYW5uZWwgZXh0ZW5kcyBrZXlvZiBFdmVudD4oY2hhbm5lbDogQ2hhbm5lbCB8IENoYW5uZWxbXSwgbGlzdGVuZXI6ICguLi5hcmdzOiBBcmd1bWVudHM8RXZlbnRbQ2hhbm5lbF0+KSA9PiB1bmtub3duKTogU3Vic2NyaXB0aW9uIHtcbiAgICAgICAgY29uc3QgbWFwID0gbGlzdGVuZXJzKHRoaXMpO1xuICAgICAgICB2YWxpZExpc3RlbmVyKGxpc3RlbmVyKTtcblxuICAgICAgICBjb25zdCBjaGFubmVscyA9IGlzQXJyYXkoY2hhbm5lbCkgPyBjaGFubmVsIDogW2NoYW5uZWxdO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIGNoYW5uZWxzKSB7XG4gICAgICAgICAgICB2YWxpZENoYW5uZWwoY2gpO1xuICAgICAgICAgICAgbWFwLmhhcyhjaCkgPyBtYXAuZ2V0KGNoKSEuYWRkKGxpc3RlbmVyKSA6IG1hcC5zZXQoY2gsIG5ldyBTZXQoW2xpc3RlbmVyXSkpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICAgIGdldCBlbmFibGUoKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaCBvZiBjaGFubmVscykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaXN0ID0gbWFwLmdldChjaCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbGlzdCB8fCAhbGlzdC5oYXMobGlzdGVuZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5zdWJzY3JpYmUoKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaCBvZiBjaGFubmVscykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaXN0ID0gbWFwLmdldChjaCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0LmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0LnNpemUgPiAwIHx8IG1hcC5kZWxldGUoY2gpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFN1YnNjcml2ZSBldmVudChzKSBidXQgaXQgY2F1c2VzIHRoZSBib3VuZCBjYWxsYmFjayB0byBvbmx5IGZpcmUgb25jZSBiZWZvcmUgYmVpbmcgcmVtb3ZlZC5cbiAgICAgKiBAamEg5LiA5bqm44Gg44GR44OP44Oz44OJ44Oq44Oz44Kw5Y+v6IO944Gq44Kk44OZ44Oz44OI6LO86Kqt6Kit5a6aXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhbm5lbFxuICAgICAqICAtIGBlbmAgdGFyZ2V0IGV2ZW50IGNoYW5uZWwga2V5LiAoc3RyaW5nIHwgc3ltYm9sKVxuICAgICAqICAtIGBqYWAg5a++6LGh44Gu44Kk44OZ44Oz44OI44OB44Oj44ON44Or44Kt44O8IChzdHJpbmcgfCBzeW1ib2wpXG4gICAgICogQHBhcmFtIGxpc3RlbmVyXG4gICAgICogIC0gYGVuYCBjYWxsYmFjayBmdW5jdGlvbiBvZiB0aGUgYGNoYW5uZWxgIGNvcnJlc3BvbmRpbmcuXG4gICAgICogIC0gYGphYCBgY2hhbm5lbGAg44Gr5a++5b+c44GX44Gf44Kz44O844Or44OQ44OD44Kv6Zai5pWwXG4gICAgICovXG4gICAgb25jZTxDaGFubmVsIGV4dGVuZHMga2V5b2YgRXZlbnQ+KGNoYW5uZWw6IENoYW5uZWwgfCBDaGFubmVsW10sIGxpc3RlbmVyOiAoLi4uYXJnczogQXJndW1lbnRzPEV2ZW50W0NoYW5uZWxdPikgPT4gdW5rbm93bik6IFN1YnNjcmlwdGlvbiB7XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLm9uKGNoYW5uZWwsIGxpc3RlbmVyKTtcbiAgICAgICAgY29uc3QgbWFuYWdlZCA9IHRoaXMub24oY2hhbm5lbCwgKCkgPT4ge1xuICAgICAgICAgICAgY29udGV4dC51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgbWFuYWdlZC51bnN1YnNjcmliZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFVuc3Vic2NyaWJlIGV2ZW50KHMpLlxuICAgICAqIEBqYSDjgqTjg5njg7Pjg4jos7zoqq3op6PpmaRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBjaGFubmVsXG4gICAgICogIC0gYGVuYCB0YXJnZXQgZXZlbnQgY2hhbm5lbCBrZXkuIChzdHJpbmcgfCBzeW1ib2wpXG4gICAgICogICAgICAgICBXaGVuIG5vdCBzZXQgdGhpcyBwYXJhbWV0ZXIsIGV2ZXJ5dGhpbmcgaXMgcmVsZWFzZWQuXG4gICAgICogIC0gYGphYCDlr77osaHjga7jgqTjg5njg7Pjg4jjg4Hjg6Pjg43jg6vjgq3jg7wgKHN0cmluZyB8IHN5bWJvbClcbiAgICAgKiAgICAgICAgIOaMh+WumuOBl+OBquOBhOWgtOWQiOOBr+OBmeOBueOBpuino+mZpFxuICAgICAqIEBwYXJhbSBsaXN0ZW5lclxuICAgICAqICAtIGBlbmAgY2FsbGJhY2sgZnVuY3Rpb24gb2YgdGhlIGBjaGFubmVsYCBjb3JyZXNwb25kaW5nLlxuICAgICAqICAgICAgICAgV2hlbiBub3Qgc2V0IHRoaXMgcGFyYW1ldGVyLCBhbGwgc2FtZSBgY2hhbm5lbGAgbGlzdGVuZXJzIGFyZSByZWxlYXNlZC5cbiAgICAgKiAgLSBgamFgIGBjaGFubmVsYCDjgavlr77lv5zjgZfjgZ/jgrPjg7zjg6vjg5Djg4Pjgq/plqLmlbBcbiAgICAgKiAgICAgICAgIOaMh+WumuOBl+OBquOBhOWgtOWQiOOBr+WQjOS4gCBgY2hhbm5lbGAg44GZ44G544Gm44KS6Kej6ZmkXG4gICAgICovXG4gICAgb2ZmPENoYW5uZWwgZXh0ZW5kcyBrZXlvZiBFdmVudD4oY2hhbm5lbD86IENoYW5uZWwgfCBDaGFubmVsW10sIGxpc3RlbmVyPzogKC4uLmFyZ3M6IEFyZ3VtZW50czxFdmVudFtDaGFubmVsXT4pID0+IHVua25vd24pOiB0aGlzIHtcbiAgICAgICAgY29uc3QgbWFwID0gbGlzdGVuZXJzKHRoaXMpO1xuICAgICAgICBpZiAobnVsbCA9PSBjaGFubmVsKSB7XG4gICAgICAgICAgICBtYXAuY2xlYXIoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2hhbm5lbHMgPSBpc0FycmF5KGNoYW5uZWwpID8gY2hhbm5lbCA6IFtjaGFubmVsXTtcbiAgICAgICAgY29uc3QgY2FsbGJhY2sgPSB2YWxpZExpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiBjaGFubmVscykge1xuICAgICAgICAgICAgdmFsaWRDaGFubmVsKGNoKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgbWFwLmRlbGV0ZShjaCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBtYXAuZ2V0KGNoKTtcbiAgICAgICAgICAgICAgICBpZiAobGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBsaXN0LmRlbGV0ZShjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIGxpc3Quc2l6ZSA+IDAgfHwgbWFwLmRlbGV0ZShjaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuIiwiLyogZXNsaW50LWRpc2FibGVcbiAgIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAsIEB0eXBlc2NyaXB0LWVzbGludC91bmJvdW5kLW1ldGhvZFxuICovXG5cbmltcG9ydCB7IEFyZ3VtZW50cyB9IGZyb20gJ0BjZHAvY29yZS11dGlscyc7XG5pbXBvcnQgeyBTdWJzY3JpYmFibGUgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgRXZlbnRQdWJsaXNoZXIgfSBmcm9tICcuL3B1Ymxpc2hlcic7XG5cbi8vIHJlLWV4cG9ydFxuZXhwb3J0IHsgQXJndW1lbnRzIGFzIEV2ZW50QXJndW1lbnRzIH07XG5cbi8qKlxuICogQGVuIEV2ZW50aW5nIGZyYW1ld29yayBvYmplY3QgYWJsZSB0byBjYWxsIGBwdWJsaXNoKClgIG1ldGhvZCBmcm9tIG91dHNpZGUuXG4gKiBAamEg5aSW6YOo44GL44KJ44GuIGBwdWJsaXNoKClgIOOCkuWPr+iDveOBq+OBl+OBn+OCpOODmeODs+ODiOeZu+mMsuODu+eZuuihjOOCr+ODqeOCuVxuICpcbiAqIEBleGFtcGxlIDxicj5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgRXZlbnRCcm9rZXIgfSBmcm9tICdAY2RwL2V2ZW50cyc7XG4gKlxuICogLy8gZGVjbGFyZSBldmVudCBpbnRlcmZhY2VcbiAqIGludGVyZmFjZSBTYW1wbGVFdmVudCB7XG4gKiAgIGhvZ2U6IFtudW1iZXIsIHN0cmluZ107ICAgICAgICAvLyBjYWxsYmFjayBmdW5jdGlvbidzIGFyZ3MgdHlwZSB0dXBsZVxuICogfVxuICpcbiAqIGNvbnN0IGJyb2tlciA9IG5ldyBFdmVudEJyb2tlcjxTYW1wbGVFdmVudD4oKTtcbiAqIGJyb2tlci50cmlnZ2VyKCdob2dlJywgMTAwLCAndGVzdCcpOyAgICAgLy8gT0suIHN0YW5kYXJkIHVzYWdlLlxuICogYnJva2VyLnRyaWdnZXIoJ2hvZ2UnLCAxMDAsIHRydWUpOyAgICAgICAvLyBORy4gYXJndW1lbnQgb2YgdHlwZSAndHJ1ZScgaXMgbm90IGFzc2lnbmFibGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIHRvIHBhcmFtZXRlciBvZiB0eXBlICdzdHJpbmcgfCB1bmRlZmluZWQnLlxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXZlbnRCcm9rZXI8RXZlbnQgZXh0ZW5kcyB7fT4gZXh0ZW5kcyBTdWJzY3JpYmFibGU8RXZlbnQ+IHtcbiAgICAvKipcbiAgICAgKiBAZW4gTm90aWZ5IGV2ZW50IHRvIGNsaWVudHMuXG4gICAgICogQGphIGV2ZW50IOeZuuihjFxuICAgICAqXG4gICAgICogQHBhcmFtIGNoYW5uZWxcbiAgICAgKiAgLSBgZW5gIGV2ZW50IGNoYW5uZWwga2V5LiAoc3RyaW5nIHwgc3ltYm9sKVxuICAgICAqICAtIGBqYWAg44Kk44OZ44Oz44OI44OB44Oj44ON44Or44Kt44O8IChzdHJpbmcgfCBzeW1ib2wpXG4gICAgICogQHBhcmFtIGFyZ3NcbiAgICAgKiAgLSBgZW5gIGFyZ3VtZW50cyBmb3IgY2FsbGJhY2sgZnVuY3Rpb24gb2YgdGhlIGBjaGFubmVsYCBjb3JyZXNwb25kaW5nLlxuICAgICAqICAtIGBqYWAgYGNoYW5uZWxgIOOBq+WvvuW/nOOBl+OBn+OCs+ODvOODq+ODkOODg+OCr+mWouaVsOOBq+a4oeOBmeW8leaVsFxuICAgICAqL1xuICAgIHRyaWdnZXI8Q2hhbm5lbCBleHRlbmRzIGtleW9mIEV2ZW50PihjaGFubmVsOiBDaGFubmVsLCAuLi5hcmdzOiBBcmd1bWVudHM8UGFydGlhbDxFdmVudFtDaGFubmVsXT4+KTogdm9pZDtcbn1cblxuLyoqXG4gKiBAZW4gQ29uc3RydWN0b3Igb2YgW1tFdmVudEJyb2tlcl1dXG4gKiBAamEgW1tFdmVudEJyb2tlcl1dIOOBruOCs+ODs+OCueODiOODqeOCr+OCv+Wun+S9k1xuICovXG5leHBvcnQgY29uc3QgRXZlbnRCcm9rZXI6IHtcbiAgICByZWFkb25seSBwcm90b3R5cGU6IEV2ZW50QnJva2VyPGFueT47XG4gICAgbmV3IDxUPigpOiBFdmVudEJyb2tlcjxUPjtcbn0gPSBFdmVudFB1Ymxpc2hlciBhcyBhbnk7XG5cbkV2ZW50QnJva2VyLnByb3RvdHlwZS50cmlnZ2VyID0gKEV2ZW50UHVibGlzaGVyLnByb3RvdHlwZSBhcyBhbnkpLnB1Ymxpc2g7XG4iLCIvKiBlc2xpbnQtZGlzYWJsZVxuICAgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICovXG5cbmltcG9ydCB7IEFyZ3VtZW50cywgaXNBcnJheSB9IGZyb20gJ0BjZHAvY29yZS11dGlscyc7XG5pbXBvcnQge1xuICAgIFN1YnNjcmliYWJsZSxcbiAgICBTdWJzY3JpcHRpb24sXG4gICAgRXZlbnRTY2hlbWEsXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmNvbnN0IF9jb250ZXh0ID0gU3ltYm9sKCdjb250ZXh0Jyk7XG5cbi8qKiBAaW50ZXJuYWwgKi9cbnR5cGUgU3Vic2NyaXB0aW9uTWFwID0gTWFwPEZ1bmN0aW9uLCBTdWJzY3JpcHRpb24+O1xuLyoqIEBpbnRlcm5hbCAqL1xudHlwZSBMaXN0ZXJNYXAgICAgICAgPSBNYXA8c3RyaW5nLCBTdWJzY3JpcHRpb25NYXA+O1xuLyoqIEBpbnRlcm5hbCAqL1xudHlwZSBTdWJzY3JpcHRpb25TZXQgPSBTZXQ8U3Vic2NyaXB0aW9uPjtcbi8qKiBAaW50ZXJuYWwgKi9cbnR5cGUgU3Vic2NyaWJhYmxlTWFwID0gV2Vha01hcDxTdWJzY3JpYmFibGUsIExpc3Rlck1hcD47XG5cbi8qKiBAaW50ZXJuYWwgTGlzbmVyIOagvOe0jeW9ouW8jyAqL1xuaW50ZXJmYWNlIENvbnRleHQge1xuICAgIG1hcDogU3Vic2NyaWJhYmxlTWFwO1xuICAgIHNldDogU3Vic2NyaXB0aW9uU2V0O1xufVxuXG4vKiogQGludGVybmFsIHJlZ2lzdGVyIGxpc3RlbmVyIGNvbnRleHQgKi9cbmZ1bmN0aW9uIHJlZ2lzdGVyKGNvbnRleHQ6IENvbnRleHQsIHRhcmdldDogU3Vic2NyaWJhYmxlLCBjaGFubmVsOiBzdHJpbmcgfCBzdHJpbmdbXSwgbGlzdGVuZXI6IEZ1bmN0aW9uKTogU3Vic2NyaXB0aW9uIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zOiBTdWJzY3JpcHRpb25bXSA9IFtdO1xuXG4gICAgY29uc3QgY2hhbm5lbHMgPSBpc0FycmF5KGNoYW5uZWwpID8gY2hhbm5lbCA6IFtjaGFubmVsXTtcbiAgICBmb3IgKGNvbnN0IGNoIG9mIGNoYW5uZWxzKSB7XG4gICAgICAgIGNvbnN0IHMgPSB0YXJnZXQub24oY2gsIGxpc3RlbmVyIGFzIGFueSk7XG4gICAgICAgIGNvbnRleHQuc2V0LmFkZChzKTtcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5wdXNoKHMpO1xuXG4gICAgICAgIGNvbnN0IGxpc3RlbmVyTWFwID0gY29udGV4dC5tYXAuZ2V0KHRhcmdldCkgfHwgbmV3IE1hcDxzdHJpbmcsIE1hcDxGdW5jdGlvbiwgU3Vic2NyaXB0aW9uPj4oKTtcbiAgICAgICAgY29uc3QgbWFwID0gbGlzdGVuZXJNYXAuZ2V0KGNoKSB8fCBuZXcgTWFwPEZ1bmN0aW9uLCBTdWJzY3JpcHRpb24+KCk7XG4gICAgICAgIG1hcC5zZXQobGlzdGVuZXIsIHMpO1xuXG4gICAgICAgIGlmICghbGlzdGVuZXJNYXAuaGFzKGNoKSkge1xuICAgICAgICAgICAgbGlzdGVuZXJNYXAuc2V0KGNoLCBtYXApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY29udGV4dC5tYXAuaGFzKHRhcmdldCkpIHtcbiAgICAgICAgICAgIGNvbnRleHQubWFwLnNldCh0YXJnZXQsIGxpc3RlbmVyTWFwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgZ2V0IGVuYWJsZSgpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcyBvZiBzdWJzY3JpcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKHMuZW5hYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgdW5zdWJzY3JpYmUoKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHMgb2Ygc3Vic2NyaXB0aW9ucykge1xuICAgICAgICAgICAgICAgIHMudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcbn1cblxuLyoqIEBpbnRlcm5hbCB1bnJlZ2lzdGVyIGxpc3RlbmVyIGNvbnRleHQgKi9cbmZ1bmN0aW9uIHVucmVnaXN0ZXIoY29udGV4dDogQ29udGV4dCwgdGFyZ2V0PzogU3Vic2NyaWJhYmxlLCBjaGFubmVsPzogc3RyaW5nIHwgc3RyaW5nW10sIGxpc3RlbmVyPzogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAobnVsbCAhPSB0YXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0Lm9mZihjaGFubmVsLCBsaXN0ZW5lciBhcyBhbnkpO1xuXG4gICAgICAgIGNvbnN0IGxpc3RlbmVyTWFwID0gY29udGV4dC5tYXAuZ2V0KHRhcmdldCk7XG4gICAgICAgIGlmICghbGlzdGVuZXJNYXApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobnVsbCAhPSBjaGFubmVsKSB7XG4gICAgICAgICAgICBjb25zdCBjaGFubmVscyA9IGlzQXJyYXkoY2hhbm5lbCkgPyBjaGFubmVsIDogW2NoYW5uZWxdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaCBvZiBjaGFubmVscykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IGxpc3RlbmVyTWFwLmdldChjaCk7XG4gICAgICAgICAgICAgICAgaWYgKCFtYXApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcyA9IG1hcC5nZXQobGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcy51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dC5zZXQuZGVsZXRlKHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1hcC5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcyBvZiBtYXAudmFsdWVzKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHMudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQuc2V0LmRlbGV0ZShzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbWFwIG9mIGxpc3RlbmVyTWFwLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzIG9mIG1hcC52YWx1ZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICBzLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuc2V0LmRlbGV0ZShzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGNvbnN0IHMgb2YgY29udGV4dC5zZXQpIHtcbiAgICAgICAgICAgIHMudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0Lm1hcCA9IG5ldyBXZWFrTWFwKCk7XG4gICAgICAgIGNvbnRleHQuc2V0LmNsZWFyKCk7XG4gICAgfVxufVxuXG4vL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fLy9cblxuLyoqXG4gKiBAZW4gVGhlIGNsYXNzIHRvIHdoaWNoIHRoZSBzYWZlIGV2ZW50IHJlZ2lzdGVyL3VucmVnaXN0ZXIgbWV0aG9kIGlzIG9mZmVyZWQgZm9yIHRoZSBvYmplY3Qgd2hpY2ggaXMgYSBzaG9ydCBsaWZlIGN5Y2xlIHRoYW4gc3Vic2NyaXB0aW9uIHRhcmdldC4gPGJyPlxuICogICAgIFRoZSBhZHZhbnRhZ2Ugb2YgdXNpbmcgdGhpcyBmb3JtLCBpbnN0ZWFkIG9mIGBvbigpYCwgaXMgdGhhdCBgbGlzdGVuVG8oKWAgYWxsb3dzIHRoZSBvYmplY3QgdG8ga2VlcCB0cmFjayBvZiB0aGUgZXZlbnRzLFxuICogICAgIGFuZCB0aGV5IGNhbiBiZSByZW1vdmVkIGFsbCBhdCBvbmNlIGxhdGVyIGNhbGwgYHN0b3BMaXN0ZW5pbmcoKWAuXG4gKiBAamEg6LO86Kqt5a++6LGh44KI44KK44KC44Op44Kk44OV44K144Kk44Kv44Or44GM55+t44GE44Kq44OW44K444Kn44Kv44OI44Gr5a++44GX44GmLCDlronlhajjgarjgqTjg5njg7Pjg4jnmbvpjLIv6Kej6Zmk44Oh44K944OD44OJ44KS5o+Q5L6b44GZ44KL44Kv44Op44K5IDxicj5cbiAqICAgICBgb24oKWAg44Gu5Luj44KP44KK44GrIGBsaXN0ZW5UbygpYCDjgpLkvb/nlKjjgZnjgovjgZPjgajjgacsIOW+jOOBqyBgc3RvcExpc3RlbmluZygpYCDjgpIx5bqm5ZG844G244Gg44GR44Gn44GZ44G544Gm44Gu44Oq44K544OK44O844KS6Kej6Zmk44Gn44GN44KL5Yip54K544GM44GC44KLLlxuICpcbiAqIEBleGFtcGxlIDxicj5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgRXZlbnRSZWNlaXZlciwgRXZlbnRCcm9rZXIgfSBmcm9tICdAY2RwL2V2ZW50cyc7XG4gKlxuICogLy8gZGVjbGFyZSBldmVudCBpbnRlcmZhY2VcbiAqIGludGVyZmFjZSBTYW1wbGVFdmVudCB7XG4gKiAgIGhvZ2U6IFtudW1iZXIsIHN0cmluZ107ICAgICAgICAvLyBjYWxsYmFjayBmdW5jdGlvbidzIGFyZ3MgdHlwZSB0dXBsZVxuICogICBmb286IFt2b2lkXTsgICAgICAgICAgICAgICAgICAgLy8gbm8gYXJnc1xuICogICBob286IHZvaWQ7ICAgICAgICAgICAgICAgICAgICAgLy8gbm8gYXJncyAoc2FtZSB0aGUgdXBvbilcbiAqICAgYmFyOiBbRXJyb3JdOyAgICAgICAgICAgICAgICAgIC8vIGFueSBjbGFzcyBpcyBhdmFpbGFibGUuXG4gKiAgIGJhejogRXJyb3IgfCBOdW1iZXI7ICAgICAgICAgICAvLyBpZiBvbmx5IG9uZSBhcmd1bWVudCwgYFtdYCBpcyBub3QgcmVxdWlyZWQuXG4gKiB9XG4gKlxuICogLy8gZGVjbGFyZSBjbGllbnQgY2xhc3NcbiAqIGNsYXNzIFNhbXBsZVJlY2VpdmVyIGV4dGVuZHMgRXZlbnRSZWNlaXZlciB7XG4gKiAgIGNvbnN0cnVjdG9yKGJyb2tlcjogRXZlbnRCcm9rZXI8U2FtcGxlRXZlbnQ+KSB7XG4gKiAgICAgc3VwZXIoKTtcbiAqICAgICB0aGlzLmxpc3RlblRvKGJyb2tlciwgJ2hvZ2UnLCAobnVtOiBudW1iZXIsIHN0cjogc3RyaW5nKSA9PiB7IC4uLiB9KTtcbiAqICAgICB0aGlzLmxpc3RlblRvKGJyb2tlciwgJ2JhcicsIChlOiBFcnJvcikgPT4geyAuLi4gfSk7XG4gKiAgICAgdGhpcy5saXN0ZW5Ubyhicm9rZXIsIFsnZm9vJywgJ2hvbyddLCAoKSA9PiB7IC4uLiB9KTtcbiAqICAgfVxuICpcbiAqICAgcmVsZWFzZSgpOiB2b2lkIHtcbiAqICAgICB0aGlzLnN0b3BMaXN0ZW5pbmcoKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogb3JcbiAqXG4gKiBgYGB0c1xuICogY29uc3QgYnJva2VyICAgPSBuZXcgRXZlbnRCcm9rZXI8U2FtcGxlRXZlbnQ+KCk7XG4gKiBjb25zdCByZWNlaXZlciA9IG5ldyBFdmVudFJlY2VpdmVyKCk7XG4gKlxuICogcmVjZWl2ZXIubGlzdGVuVG8oYnJva2VyLCAnaG9nZScsIChudW06IG51bWJlciwgc3RyOiBzdHJpbmcpID0+IHsgLi4uIH0pO1xuICogcmVjZWl2ZXIubGlzdGVuVG8oYnJva2VyLCAnYmFyJywgKGU6IEVycm9yKSA9PiB7IC4uLiB9KTtcbiAqIHJlY2VpdmVyLmxpc3RlblRvKGJyb2tlciwgWydmb28nLCAnaG9vJ10sICgpID0+IHsgLi4uIH0pO1xuICpcbiAqIHJlY2VpdmVyLnN0b3BMaXN0ZW5pbmcoKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgRXZlbnRSZXZjZWl2ZXIge1xuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcml2YXRlIHJlYWRvbmx5IFtfY29udGV4dF06IENvbnRleHQ7XG5cbiAgICAvKiogY29uc3RydWN0b3IgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpc1tfY29udGV4dF0gPSB7IG1hcDogbmV3IFdlYWtNYXAoKSwgc2V0OiBuZXcgU2V0KCkgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gVGVsbCBhbiBvYmplY3QgdG8gbGlzdGVuIHRvIGEgcGFydGljdWxhciBldmVudCBvbiBhbiBvdGhlciBvYmplY3QuXG4gICAgICogQGphIOWvvuixoeOCquODluOCuOOCp+OCr+ODiOOBruOCpOODmeODs+ODiOizvOiqreioreWumlxuICAgICAqXG4gICAgICogQHBhcmFtIHRhcmdldFxuICAgICAqICAtIGBlbmAgZXZlbnQgbGlzdGVuaW5nIHRhcmdldCBvYmplY3QuXG4gICAgICogIC0gYGphYCDjgqTjg5njg7Pjg4jos7zoqq3lr77osaHjga7jgqrjg5bjgrjjgqfjgq/jg4hcbiAgICAgKiBAcGFyYW0gY2hhbm5lbFxuICAgICAqICAtIGBlbmAgdGFyZ2V0IGV2ZW50IGNoYW5uZWwga2V5LiAoc3RyaW5nIHwgc3ltYm9sKVxuICAgICAqICAtIGBqYWAg5a++6LGh44Gu44Kk44OZ44Oz44OI44OB44Oj44ON44Or44Kt44O8IChzdHJpbmcgfCBzeW1ib2wpXG4gICAgICogQHBhcmFtIGxpc3RlbmVyXG4gICAgICogIC0gYGVuYCBjYWxsYmFjayBmdW5jdGlvbiBvZiB0aGUgYGNoYW5uZWxgIGNvcnJlc3BvbmRpbmcuXG4gICAgICogIC0gYGphYCBgY2hhbm5lbGAg44Gr5a++5b+c44GX44Gf44Kz44O844Or44OQ44OD44Kv6Zai5pWwXG4gICAgICovXG4gICAgcHVibGljIGxpc3RlblRvPFQgZXh0ZW5kcyBTdWJzY3JpYmFibGUsIEV2ZW50IGV4dGVuZHMgRXZlbnRTY2hlbWE8VD4gPSBFdmVudFNjaGVtYTxUPiwgQ2hhbm5lbCBleHRlbmRzIGtleW9mIEV2ZW50ID0ga2V5b2YgRXZlbnQ+KFxuICAgICAgICB0YXJnZXQ6IFQsXG4gICAgICAgIGNoYW5uZWw6IENoYW5uZWwgfCBDaGFubmVsW10sXG4gICAgICAgIGxpc3RlbmVyOiAoLi4uYXJnczogQXJndW1lbnRzPEV2ZW50W0NoYW5uZWxdPikgPT4gdW5rbm93blxuICAgICk6IFN1YnNjcmlwdGlvbiB7XG4gICAgICAgIHJldHVybiByZWdpc3Rlcih0aGlzW19jb250ZXh0XSwgdGFyZ2V0LCBjaGFubmVsIGFzIHN0cmluZywgbGlzdGVuZXIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBKdXN0IGxpa2UgbGlzdGVuVG8sIGJ1dCBjYXVzZXMgdGhlIGJvdW5kIGNhbGxiYWNrIHRvIGZpcmUgb25seSBvbmNlIGJlZm9yZSBiZWluZyByZW1vdmVkLlxuICAgICAqIEBqYSDlr77osaHjgqrjg5bjgrjjgqfjgq/jg4jjga7kuIDluqbjgaDjgZHjg4/jg7Pjg4njg6rjg7PjgrDlj6/og73jgarjgqTjg5njg7Pjg4jos7zoqq3oqK3lrppcbiAgICAgKlxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKiAgLSBgZW5gIGV2ZW50IGxpc3RlbmluZyB0YXJnZXQgb2JqZWN0LlxuICAgICAqICAtIGBqYWAg44Kk44OZ44Oz44OI6LO86Kqt5a++6LGh44Gu44Kq44OW44K444Kn44Kv44OIXG4gICAgICogQHBhcmFtIGNoYW5uZWxcbiAgICAgKiAgLSBgZW5gIHRhcmdldCBldmVudCBjaGFubmVsIGtleS4gKHN0cmluZyB8IHN5bWJvbClcbiAgICAgKiAgLSBgamFgIOWvvuixoeOBruOCpOODmeODs+ODiOODgeODo+ODjeODq+OCreODvCAoc3RyaW5nIHwgc3ltYm9sKVxuICAgICAqIEBwYXJhbSBsaXN0ZW5lclxuICAgICAqICAtIGBlbmAgY2FsbGJhY2sgZnVuY3Rpb24gb2YgdGhlIGBjaGFubmVsYCBjb3JyZXNwb25kaW5nLlxuICAgICAqICAtIGBqYWAgYGNoYW5uZWxgIOOBq+WvvuW/nOOBl+OBn+OCs+ODvOODq+ODkOODg+OCr+mWouaVsFxuICAgICAqL1xuICAgIHB1YmxpYyBsaXN0ZW5Ub09uY2U8VCBleHRlbmRzIFN1YnNjcmliYWJsZSwgRXZlbnQgZXh0ZW5kcyBFdmVudFNjaGVtYTxUPiA9IEV2ZW50U2NoZW1hPFQ+LCBDaGFubmVsIGV4dGVuZHMga2V5b2YgRXZlbnQgPSBrZXlvZiBFdmVudD4oXG4gICAgICAgIHRhcmdldDogVCxcbiAgICAgICAgY2hhbm5lbDogQ2hhbm5lbCB8IENoYW5uZWxbXSxcbiAgICAgICAgbGlzdGVuZXI6ICguLi5hcmdzOiBBcmd1bWVudHM8RXZlbnRbQ2hhbm5lbF0+KSA9PiB1bmtub3duXG4gICAgKTogU3Vic2NyaXB0aW9uIHtcbiAgICAgICAgY29uc3QgY29udGV4dCA9IHJlZ2lzdGVyKHRoaXNbX2NvbnRleHRdLCB0YXJnZXQsIGNoYW5uZWwgYXMgc3RyaW5nLCBsaXN0ZW5lcik7XG4gICAgICAgIGNvbnN0IG1hbmFnZWQgPSB0YXJnZXQub24oY2hhbm5lbCwgKCkgPT4ge1xuICAgICAgICAgICAgdW5yZWdpc3Rlcih0aGlzW19jb250ZXh0XSwgdGFyZ2V0LCBjaGFubmVsIGFzIHN0cmluZywgbGlzdGVuZXIpO1xuICAgICAgICAgICAgbWFuYWdlZC51bnN1YnNjcmliZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFRlbGwgYW4gb2JqZWN0IHRvIHN0b3AgbGlzdGVuaW5nIHRvIGV2ZW50cy5cbiAgICAgKiBAamEg44Kk44OZ44Oz44OI6LO86Kqt6Kej6ZmkXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGFyZ2V0XG4gICAgICogIC0gYGVuYCBldmVudCBsaXN0ZW5pbmcgdGFyZ2V0IG9iamVjdC5cbiAgICAgKiAgICAgICAgIFdoZW4gbm90IHNldCB0aGlzIHBhcmFtZXRlciwgZXZlcnl0aGluZyBpcyByZWxlYXNlZC5cbiAgICAgKiAgLSBgamFgIOOCpOODmeODs+ODiOizvOiqreWvvuixoeOBruOCquODluOCuOOCp+OCr+ODiFxuICAgICAqICAgICAgICAg5oyH5a6a44GX44Gq44GE5aC05ZCI44Gv44GZ44G544Gm44Gu44Oq44K544OK44O844KS6Kej6ZmkXG4gICAgICogQHBhcmFtIGNoYW5uZWxcbiAgICAgKiAgLSBgZW5gIHRhcmdldCBldmVudCBjaGFubmVsIGtleS4gKHN0cmluZyB8IHN5bWJvbClcbiAgICAgKiAgICAgICAgIFdoZW4gbm90IHNldCB0aGlzIHBhcmFtZXRlciwgZXZlcnl0aGluZyBpcyByZWxlYXNlZCBsaXN0ZW5lcnMgZnJvbSBgdGFyZ2V0YC5cbiAgICAgKiAgLSBgamFgIOWvvuixoeOBruOCpOODmeODs+ODiOODgeODo+ODjeODq+OCreODvCAoc3RyaW5nIHwgc3ltYm9sKVxuICAgICAqICAgICAgICAg5oyH5a6a44GX44Gq44GE5aC05ZCI44Gv5a++6LGhIGB0YXJnZXRgIOOBruODquOCueODiuODvOOCkuOBmeOBueOBpuino+mZpFxuICAgICAqIEBwYXJhbSBsaXN0ZW5lclxuICAgICAqICAtIGBlbmAgY2FsbGJhY2sgZnVuY3Rpb24gb2YgdGhlIGBjaGFubmVsYCBjb3JyZXNwb25kaW5nLlxuICAgICAqICAgICAgICAgV2hlbiBub3Qgc2V0IHRoaXMgcGFyYW1ldGVyLCBhbGwgc2FtZSBgY2hhbm5lbGAgbGlzdGVuZXJzIGFyZSByZWxlYXNlZC5cbiAgICAgKiAgLSBgamFgIGBjaGFubmVsYCDjgavlr77lv5zjgZfjgZ/jgrPjg7zjg6vjg5Djg4Pjgq/plqLmlbBcbiAgICAgKiAgICAgICAgIOaMh+WumuOBl+OBquOBhOWgtOWQiOOBr+WQjOS4gCBgY2hhbm5lbGAg44GZ44G544Gm44KS6Kej6ZmkXG4gICAgICovXG4gICAgcHVibGljIHN0b3BMaXN0ZW5pbmc8VCBleHRlbmRzIFN1YnNjcmliYWJsZSwgRXZlbnQgZXh0ZW5kcyBFdmVudFNjaGVtYTxUPiA9IEV2ZW50U2NoZW1hPFQ+LCBDaGFubmVsIGV4dGVuZHMga2V5b2YgRXZlbnQgPSBrZXlvZiBFdmVudD4oXG4gICAgICAgIHRhcmdldD86IFQsXG4gICAgICAgIGNoYW5uZWw/OiBDaGFubmVsIHwgQ2hhbm5lbFtdLFxuICAgICAgICBsaXN0ZW5lcj86ICguLi5hcmdzOiBBcmd1bWVudHM8RXZlbnRbQ2hhbm5lbF0+KSA9PiB1bmtub3duXG4gICAgKTogdGhpcyB7XG4gICAgICAgIHVucmVnaXN0ZXIodGhpc1tfY29udGV4dF0sIHRhcmdldCwgY2hhbm5lbCBhcyBzdHJpbmcsIGxpc3RlbmVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuIiwiLyogZXNsaW50LWRpc2FibGVcbiAgIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAqL1xuXG5pbXBvcnQgeyBtaXhpbnMgfSBmcm9tICdAY2RwL2NvcmUtdXRpbHMnO1xuaW1wb3J0IHsgRXZlbnRCcm9rZXIgfSBmcm9tICcuL2Jyb2tlcic7XG5pbXBvcnQgeyBFdmVudFJldmNlaXZlciB9IGZyb20gJy4vcmVjZWl2ZXInO1xuXG4vKipcbiAqIEBlbiBUaGUgY2xhc3Mgd2hpY2ggaGF2ZSBJL0Ygb2YgW1tFdmVudEJyb2tlcl1dIGFuZCBbW0V2ZW50UmV2Y2VpdmVyXV0uIDxicj5cbiAqICAgICBgRXZlbnRzYCBjbGFzcyBvZiBgQmFja2JvbmUuanNgIGVxdWl2YWxlbmNlLlxuICogQGphIFtbRXZlbnRCcm9rZXJdXSDjgaggW1tFdmVudFJldmNlaXZlcl1dIOOBriBJL0Yg44KS44GC44KP44Gb5oyB44Gk44Kv44Op44K5IDxicj5cbiAqICAgICBgQmFja2JvbmUuanNgIOOBriBgRXZlbnRzYCDjgq/jg6njgrnnm7jlvZNcbiAqXG4gKiBAZXhhbXBsZSA8YnI+XG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IEV2ZW50U291cmNlIH0gZnJvbSAnQGNkcC9ldmVudHMnO1xuICpcbiAqIC8vIGRlY2xhcmUgZXZlbnQgaW50ZXJmYWNlXG4gKiBpbnRlcmZhY2UgVGFyZ2V0RXZlbnQge1xuICogICBob2dlOiBbbnVtYmVyLCBzdHJpbmddOyAgICAgICAgLy8gY2FsbGJhY2sgZnVuY3Rpb24ncyBhcmdzIHR5cGUgdHVwbGVcbiAqICAgZm9vOiBbdm9pZF07ICAgICAgICAgICAgICAgICAgIC8vIG5vIGFyZ3NcbiAqICAgaG9vOiB2b2lkOyAgICAgICAgICAgICAgICAgICAgIC8vIG5vIGFyZ3MgKHNhbWUgdGhlIHVwb24pXG4gKiAgIGJhcjogW0Vycm9yXTsgICAgICAgICAgICAgICAgICAvLyBhbnkgY2xhc3MgaXMgYXZhaWxhYmxlLlxuICogICBiYXo6IEVycm9yIHwgTnVtYmVyOyAgICAgICAgICAgLy8gaWYgb25seSBvbmUgYXJndW1lbnQsIGBbXWAgaXMgbm90IHJlcXVpcmVkLlxuICogfVxuICpcbiAqIGludGVyZmFjZSBTYW1wbGVFdmVudCB7XG4gKiAgIGZ1Z2E6IFtudW1iZXIsIHN0cmluZ107ICAgICAgICAvLyBjYWxsYmFjayBmdW5jdGlvbidzIGFyZ3MgdHlwZSB0dXBsZVxuICogfVxuICpcbiAqIC8vIGRlY2xhcmUgY2xpZW50IGNsYXNzXG4gKiBjbGFzcyBTYW1wbGVTb3VyY2UgZXh0ZW5kcyBFdmVudFNvdXJjZTxTYW1wbGVFdmVudD4ge1xuICogICBjb25zdHJ1Y3Rvcih0YXJnZXQ6IEV2ZW50U291cmNlPFRhcmdldEV2ZW50Pikge1xuICogICAgIHN1cGVyKCk7XG4gKiAgICAgdGhpcy5saXN0ZW5Ubyhicm9rZXIsICdob2dlJywgKG51bTogbnVtYmVyLCBzdHI6IHN0cmluZykgPT4geyAuLi4gfSk7XG4gKiAgICAgdGhpcy5saXN0ZW5Ubyhicm9rZXIsICdiYXInLCAoZTogRXJyb3IpID0+IHsgLi4uIH0pO1xuICogICAgIHRoaXMubGlzdGVuVG8oYnJva2VyLCBbJ2ZvbycsICdob28nXSwgKCkgPT4geyAuLi4gfSk7XG4gKiAgIH1cbiAqXG4gKiAgIHJlbGVhc2UoKTogdm9pZCB7XG4gKiAgICAgdGhpcy5zdG9wTGlzdGVuaW5nKCk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBjb25zdCBzYW1wbGUgPSBuZXcgU2FtcGxlU291cmNlKCk7XG4gKlxuICogc2FtcGxlLm9uKCdmdWdhJywgKGE6IG51bWJlciwgYjogc3RyaW5nKSA9PiB7IC4uLiB9KTsgICAgLy8gT0suIHN0YW5kYXJkIHVzYWdlLlxuICogc2FtcGxlLnRyaWdnZXIoJ2Z1Z2EnLCAxMDAsICd0ZXN0Jyk7ICAgICAgICAgICAgICAgICAgICAgLy8gT0suIHN0YW5kYXJkIHVzYWdlLlxuICogYGBgXG4gKi9cbnR5cGUgRXZlbnRTb3VyY2VCYXNlPFQgZXh0ZW5kcyB7fT4gPSBFdmVudEJyb2tlcjxUPiAmIEV2ZW50UmV2Y2VpdmVyO1xuXG4vKiogQGludGVybmFsIFtbRXZlbnRTb3VyY2VdXSBjbGFzcyAqL1xuY2xhc3MgRXZlbnRTb3VyY2UgZXh0ZW5kcyBtaXhpbnMoRXZlbnRCcm9rZXIsIEV2ZW50UmV2Y2VpdmVyKSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuc3VwZXIoRXZlbnRSZXZjZWl2ZXIpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZW4gQ29uc3RydWN0b3Igb2YgW1tFdmVudFNvdXJjZV1dXG4gKiBAamEgW1tFdmVudFNvdXJjZV1dIOOBruOCs+ODs+OCueODiOODqeOCr+OCv+Wun+S9k1xuICovXG5jb25zdCBFdmVudFNvdXJjZUJhc2U6IHtcbiAgICByZWFkb25seSBwcm90b3R5cGU6IEV2ZW50U291cmNlQmFzZTxhbnk+O1xuICAgIG5ldyA8VD4oKTogRXZlbnRTb3VyY2VCYXNlPFQ+O1xufSA9IEV2ZW50U291cmNlIGFzIGFueTtcblxuZXhwb3J0IHsgRXZlbnRTb3VyY2VCYXNlIGFzIEV2ZW50U291cmNlIH07XG4iLCJpbXBvcnQgeyBFdmVudEJyb2tlciwgU3Vic2NyaXB0aW9uIH0gZnJvbSAnQGNkcC9ldmVudHMnO1xuXG4vKiogQGludGVybmFsICovXG5leHBvcnQgY29uc3QgX2NhbmNlbCA9IFN5bWJvbCgnY2FuY2VsJyk7XG4vKiogQGludGVybmFsICovXG5leHBvcnQgY29uc3QgX2Nsb3NlID0gU3ltYm9sKCdjbG9zZScpO1xuXG4vKipcbiAqIEBlbiBDYW5jZWxUb2tlbiBzdGF0ZSBkZWZpbml0aW9ucy5cbiAqIEBqYSBDYW5jZWxUb2tlbiDjga7nirbmhYvlrprnvqlcbiAqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gQ2FuY2VsVG9rZW5TdGF0ZSB7XG4gICAgLyoqIOOCreODo+ODs+OCu+ODq+WPl+S7mOWPr+iDvSAqL1xuICAgIE9QRU4gICAgICAgID0gMHgwLFxuICAgIC8qKiDjgq3jg6Pjg7Pjgrvjg6vlj5fku5jmuIjjgb8gKi9cbiAgICBSRVFVRVNURUQgICA9IDB4MSxcbiAgICAvKiog44Kt44Oj44Oz44K744Or5Y+X5LuY5LiN5Y+vICovXG4gICAgQ0xPU0VEICAgICAgPSAweDIsXG59XG5cbi8qKlxuICogQGVuIENhbmNlbCBldmVudCBkZWZpbml0aW9ucy5cbiAqIEBqYSDjgq3jg6Pjg7Pjgrvjg6vjgqTjg5njg7Pjg4jlrprnvqlcbiAqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDYW5jZWxFdmVudDxUPiB7XG4gICAgY2FuY2VsOiBbVF07XG59XG5cbi8qKlxuICogQGVuIEludGVybmFsIENhbmNlbFRva2VuIGludGVyZmFjZS5cbiAqIEBqYSBDYW5jZWxUb2tlbiDjga7lhoXpg6jjgqTjg7Pjgr/jg7zjg5XjgqfjgqTjgrnlrprnvqlcbiAqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDYW5jZWxUb2tlbkNvbnRleHQ8VCBleHRlbmRzIHt9PiB7XG4gICAgcmVhZG9ubHkgYnJva2VyOiBFdmVudEJyb2tlcjxDYW5jZWxFdmVudDxUPj47XG4gICAgcmVhZG9ubHkgc3Vic2NyaXB0aW9uczogU2V0PFN1YnNjcmlwdGlvbj47XG4gICAgcmVhc29uOiBUIHwgdW5kZWZpbmVkO1xuICAgIHN0YXR1czogQ2FuY2VsVG9rZW5TdGF0ZTtcbn1cblxuLyoqXG4gKiBAZW4gSW52YWxpZCBzdWJzY3JpcHRpb24gb2JqZWN0IGRlY2xhcmF0aW9uLlxuICogQGphIOeEoeWKueOBqiBTdWJzY3JpcHRpb24g44Kq44OW44K444Kn44Kv44OIXG4gKlxuICogQGludGVybmFsXG4gKi9cbmV4cG9ydCBjb25zdCBpbnZhbGlkU3Vic2NyaXB0aW9uID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgZW5hYmxlOiBmYWxzZSxcbiAgICB1bnN1YnNjcmliZSgpIHsgLyogbm9vcCAqLyB9XG59KSBhcyBTdWJzY3JpcHRpb247XG4iLCIvKiBlc2xpbnQtZGlzYWJsZVxuICAgbm8tcmVkZWNsYXJlXG4gLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gKi9cblxuaW1wb3J0IHsgdmVyaWZ5IH0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcbmltcG9ydCB7IEV2ZW50QnJva2VyLCBTdWJzY3JpcHRpb24gfSBmcm9tICdAY2RwL2V2ZW50cyc7XG5pbXBvcnQge1xuICAgIF9jYW5jZWwsXG4gICAgX2Nsb3NlLFxuICAgIENhbmNlbFRva2VuU3RhdGUsXG4gICAgQ2FuY2VsVG9rZW5Db250ZXh0LFxuICAgIGludmFsaWRTdWJzY3JpcHRpb24sXG59IGZyb20gJy4vaW50ZXJuYWwnO1xuXG4vKipcbiAqIEBlbiBDYW5jZWxsYXRpb24gc291cmNlIGludGVyZmFjZS5cbiAqIEBqYSDjgq3jg6Pjg7Pjgrvjg6vnrqHnkIbjgqTjg7Pjgr/jg7zjg5XjgqfjgqTjgrlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDYW5jZWxUb2tlblNvdXJjZTxUIGV4dGVuZHMge30gPSB7fT4ge1xuICAgIC8qKlxuICAgICAqIEBlbiBbW0NhbmNlbFRva2VuXV0gZ2V0dGVyLlxuICAgICAqIEBqYSBbW0NhbmNlbFRva2VuXV0g5Y+W5b6XXG4gICAgICovXG4gICAgcmVhZG9ubHkgdG9rZW46IENhbmNlbFRva2VuPFQ+O1xuXG4gICAgLyoqXG4gICAgICogQGVuIEV4ZWN1dGUgY2FuY2VsLlxuICAgICAqIEBqYSDjgq3jg6Pjg7Pjgrvjg6vlrp/ooYxcbiAgICAgKlxuICAgICAqIEBwYXJhbSByZWFzb25cbiAgICAgKiAgLSBgZW5gIGNhbmNlbGxhdGlvbiByZWFzb24uIHRoaXMgYXJnIGlzIHRyYW5zbWl0dGVkIGluIHByb21pc2UgY2hhaW4uXG4gICAgICogIC0gYGphYCDjgq3jg6Pjg7Pjgrvjg6vjga7nkIbnlLHjgpLmjIflrpouIGBQcm9taXNlYCDjg4HjgqfjgqTjg7PjgavkvJ3pgZTjgZXjgozjgosuXG4gICAgICovXG4gICAgY2FuY2VsKHJlYXNvbjogVCk6IHZvaWQ7XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQnJlYWsgdXAgY2FuY2VsbGF0aW9uIHJlY2VwdGlvbi5cbiAgICAgKiBAamEg44Kt44Oj44Oz44K744Or5Y+X5LuY44KS57WC5LqGXG4gICAgICovXG4gICAgY2xvc2UoKTogdm9pZDtcbn1cblxuLyoqIEBpbnRlcm5hbCAqL1xuY29uc3QgX3Rva2VucyA9IG5ldyBXZWFrTWFwPENhbmNlbFRva2VuPGFueT4sIENhbmNlbFRva2VuQ29udGV4dDxhbnk+PigpO1xuXG4vKiogQGludGVybmFsICovXG5mdW5jdGlvbiBnZXRDb250ZXh0PFQ+KGluc3RhbmNlOiBDYW5jZWxUb2tlbjxUPik6IENhbmNlbFRva2VuQ29udGV4dDxUPiB7XG4gICAgaWYgKCFfdG9rZW5zLmhhcyhpbnN0YW5jZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIG9iamVjdCBpcyBub3QgYSB2YWxpZCBDYW5jZWxUb2tlbi4nKTtcbiAgICB9XG4gICAgcmV0dXJuIF90b2tlbnMuZ2V0KGluc3RhbmNlKSBhcyBDYW5jZWxUb2tlbkNvbnRleHQ8VD47XG59XG5cbi8qKlxuICogQGVuIFRoZSB0b2tlbiBvYmplY3QgdG8gd2hpY2ggdW5pZmljYXRpb24gcHJvY2Vzc2luZyBmb3IgYXN5bmNocm9ub3VzIHByb2Nlc3NpbmcgY2FuY2VsbGF0aW9uIGlzIG9mZmVyZWQuIDxicj5cbiAqICAgICBPcmlnaW4gaXMgYENhbmNlbGxhdGlvblRva2VuYCBvZiBgLk5FVCBGcmFtZXdvcmtgLlxuICogQGphIOmdnuWQjOacn+WHpueQhuOCreODo+ODs+OCu+ODq+OBruOBn+OCgeOBrue1seS4gOWHpueQhuOCkuaPkOS+m+OBmeOCi+ODiOODvOOCr+ODs+OCquODluOCuOOCp+OCr+ODiCA8YnI+XG4gKiAgICAg44Kq44Oq44K444OK44Or44GvIGAuTkVUIEZyYW1ld29ya2Ag44GuIGBDYW5jZWxsYXRpb25Ub2tlbmBcbiAqXG4gKiBAc2VlIGh0dHBzOi8vZG9jcy5taWNyb3NvZnQuY29tL2VuLXVzL2RvdG5ldC9zdGFuZGFyZC90aHJlYWRpbmcvY2FuY2VsbGF0aW9uLWluLW1hbmFnZWQtdGhyZWFkc1xuICpcbiAqIEBleGFtcGxlIDxicj5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgQ2FuY2VsVG9rZW4gfSBmcm9tICdAY2RwL3Byb21pc2UnO1xuICogYGBgXG4gKlxuICogLSBCYXNpYyBVc2FnZVxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbigoY2FuY2VsLCBjbG9zZSkgPT4ge1xuICogICBidXR0b24xLm9uY2xpY2sgPSBldiA9PiBjYW5jZWwobmV3IEVycm9yKCdDYW5jZWwnKSk7XG4gKiAgIGJ1dHRvbjIub25jbGljayA9IGV2ID0+IGNsb3NlKCk7XG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIG9yXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IHsgY2FuY2VsLCBjbG9zZSwgdG9rZW4gfSA9IENhbmNlbFRva2VuLnNvdXJjZSgpO1xuICogYnV0dG9uMS5vbmNsaWNrID0gZXYgPT4gY2FuY2VsKG5ldyBFcnJvcignQ2FuY2VsJykpO1xuICogYnV0dG9uMi5vbmNsaWNrID0gZXYgPT4gY2xvc2UoKTtcbiAqIGBgYFxuICpcbiAqIC0gVXNlIHdpdGggUHJvbWlzZVxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCB7IGNhbmNlbCwgY2xvc2UsIHRva2VuIH0gPSBDYW5jZWxUb2tlbi5zb3VyY2UoKTtcbiAqIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgob2ssIG5nKSA9PiB7IC4uLiB9LCB0b2tlbik7XG4gKiBwcm9taXNlXG4gKiAgIC50aGVuKC4uLilcbiAqICAgLnRoZW4oLi4uKVxuICogICAudGhlbiguLi4pXG4gKiAgIC5jYXRjaChyZWFzb24gPT4ge1xuICogICAgIC8vIGNoZWNrIHJlYXNvblxuICogICB9KTtcbiAqIGBgYFxuICpcbiAqIC0gUmVnaXN0ZXIgJiBVbnJlZ2lzdGVyIGNhbGxiYWNrKHMpXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IHsgY2FuY2VsLCBjbG9zZSwgdG9rZW4gfSA9IENhbmNlbFRva2VuLnNvdXJjZSgpO1xuICogY29uc3Qgc3Vic2NyaXB0aW9uID0gdG9rZW4ucmVnaXN0ZXIocmVhc29uID0+IHtcbiAqICAgY29uc29sZS5sb2cocmVhc29uLm1lc3NhZ2UpO1xuICogfSk7XG4gKiBpZiAoc29tZUNhc2UpIHtcbiAqICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIENhbmNlbFRva2VuPFQgZXh0ZW5kcyB7fSA9IHt9PiB7XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQ3JlYXRlIFtbQ2FuY2VsVG9rZW5Tb3VyY2VdXSBpbnN0YW5jZS5cbiAgICAgKiBAamEgW1tDYW5jZWxUb2tlblNvdXJjZV1dIOOCpOODs+OCueOCv+ODs+OCueOBruWPluW+l1xuICAgICAqXG4gICAgICogQHBhcmFtIGxpbmtlZFRva2Vuc1xuICAgICAqICAtIGBlbmAgcmVsYXRpbmcgYWxyZWFkeSBtYWRlIFtbQ2FuY2VsVG9rZW5dXSBpbnN0YW5jZS5cbiAgICAgKiAgICAgICAgWW91IGNhbiBhdHRhY2ggdG8gdGhlIHRva2VuIHRoYXQgdG8gYmUgYSBjYW5jZWxsYXRpb24gdGFyZ2V0LlxuICAgICAqICAtIGBqYWAg44GZ44Gn44Gr5L2c5oiQ44GV44KM44GfIFtbQ2FuY2VsVG9rZW5dXSDplqLpgKPku5jjgZHjgovloLTlkIjjgavmjIflrppcbiAgICAgKiAgICAgICAg5rih44GV44KM44GfIHRva2VuIOOBr+OCreODo+ODs+OCu+ODq+WvvuixoeOBqOOBl+OBpue0kOOBpeOBkeOCieOCjOOCi1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgc291cmNlPFQgZXh0ZW5kcyB7fSA9IHt9PiguLi5saW5rZWRUb2tlbnM6IENhbmNlbFRva2VuW10pOiBDYW5jZWxUb2tlblNvdXJjZTxUPiB7XG4gICAgICAgIGxldCBjYW5jZWwhOiAocmVhc29uOiBUKSA9PiB2b2lkO1xuICAgICAgICBsZXQgY2xvc2UhOiAoKSA9PiB2b2lkO1xuICAgICAgICBjb25zdCB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbjxUPigob25DYW5jZWwsIG9uQ2xvc2UpID0+IHtcbiAgICAgICAgICAgIGNhbmNlbCA9IG9uQ2FuY2VsO1xuICAgICAgICAgICAgY2xvc2UgPSBvbkNsb3NlO1xuICAgICAgICB9LCAuLi5saW5rZWRUb2tlbnMpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7IHRva2VuLCBjYW5jZWwsIGNsb3NlIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZXhlY3V0b3JcbiAgICAgKiAgLSBgZW5gIGV4ZWN1dGVyIHRoYXQgaGFzIGBjYW5jZWxgIGFuZCBgY2xvc2VgIGNhbGxiYWNrLlxuICAgICAqICAtIGBqYWAg44Kt44Oj44Oz44K744OrL+OCr+ODreODvOOCuiDlrp/ooYzjgrPjg7zjg6vjg5Djg4Pjgq/jgpLmjIflrppcbiAgICAgKiBAcGFyYW0gbGlua2VkVG9rZW5zXG4gICAgICogIC0gYGVuYCByZWxhdGluZyBhbHJlYWR5IG1hZGUgW1tDYW5jZWxUb2tlbl1dIGluc3RhbmNlLlxuICAgICAqICAgICAgICBZb3UgY2FuIGF0dGFjaCB0byB0aGUgdG9rZW4gdGhhdCB0byBiZSBhIGNhbmNlbGxhdGlvbiB0YXJnZXQuXG4gICAgICogIC0gYGphYCDjgZnjgafjgavkvZzmiJDjgZXjgozjgZ8gW1tDYW5jZWxUb2tlbl1dIOmWoumAo+S7mOOBkeOCi+WgtOWQiOOBq+aMh+WumlxuICAgICAqICAgICAgICDmuKHjgZXjgozjgZ8gdG9rZW4g44Gv44Kt44Oj44Oz44K744Or5a++6LGh44Go44GX44Gm57SQ44Gl44GR44KJ44KM44KLXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGV4ZWN1dG9yOiAoY2FuY2VsOiAocmVhc29uOiBUKSA9PiB2b2lkLCBjbG9zZTogKCkgPT4gdm9pZCkgPT4gdm9pZCxcbiAgICAgICAgLi4ubGlua2VkVG9rZW5zOiBDYW5jZWxUb2tlbltdXG4gICAgKSB7XG4gICAgICAgIHZlcmlmeSgnaW5zdGFuY2VPZicsIENhbmNlbFRva2VuLCB0aGlzKTtcbiAgICAgICAgdmVyaWZ5KCd0eXBlT2YnLCAnZnVuY3Rpb24nLCBleGVjdXRvcik7XG5cbiAgICAgICAgY29uc3QgbGlua2VkVG9rZW5TZXQgPSBuZXcgU2V0KGxpbmtlZFRva2Vucy5maWx0ZXIodCA9PiBfdG9rZW5zLmhhcyh0KSkpO1xuICAgICAgICBsZXQgc3RhdHVzID0gQ2FuY2VsVG9rZW5TdGF0ZS5PUEVOO1xuICAgICAgICBmb3IgKGNvbnN0IHQgb2YgbGlua2VkVG9rZW5TZXQpIHtcbiAgICAgICAgICAgIHN0YXR1cyB8PSBnZXRDb250ZXh0KHQpLnN0YXR1cztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnRleHQ6IENhbmNlbFRva2VuQ29udGV4dDxUPiA9IHtcbiAgICAgICAgICAgIGJyb2tlcjogbmV3IEV2ZW50QnJva2VyKCksXG4gICAgICAgICAgICBzdWJzY3JpcHRpb25zOiBuZXcgU2V0KCksXG4gICAgICAgICAgICByZWFzb246IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgfTtcbiAgICAgICAgX3Rva2Vucy5zZXQodGhpcywgT2JqZWN0LnNlYWwoY29udGV4dCkpO1xuXG4gICAgICAgIGNvbnN0IGNhbmNlbCA9IHRoaXNbX2NhbmNlbF07XG4gICAgICAgIGNvbnN0IGNsb3NlID0gdGhpc1tfY2xvc2VdO1xuICAgICAgICBpZiAoc3RhdHVzID09PSBDYW5jZWxUb2tlblN0YXRlLk9QRU4pIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdCBvZiBsaW5rZWRUb2tlblNldCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQuc3Vic2NyaXB0aW9ucy5hZGQodC5yZWdpc3RlcihjYW5jZWwuYmluZCh0aGlzKSkpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0ZXIoY2FuY2VsLmJpbmQodCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZXhlY3V0b3IoY2FuY2VsLmJpbmQodGhpcyksIGNsb3NlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBDYW5jZWxsYXRpb24gcmVhc29uIGFjY2Vzc29yLlxuICAgICAqIEBqYSDjgq3jg6Pjg7Pjgrvjg6vjga7ljp/lm6Dlj5blvpdcbiAgICAgKi9cbiAgICBnZXQgcmVhc29uKCk6IFQgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gZ2V0Q29udGV4dCh0aGlzKS5yZWFzb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIEVuYWJsZSBjYW5jZWxsYXRpb24gc3RhdGUgYWNjZXNzb3IuXG4gICAgICogQGphIOOCreODo+ODs+OCu+ODq+WPr+iDveOBi+WIpOWumlxuICAgICAqL1xuICAgIGdldCBjYW5jZWxhYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZ2V0Q29udGV4dCh0aGlzKS5zdGF0dXMgPT09IENhbmNlbFRva2VuU3RhdGUuT1BFTjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQ2FuY2VsbGF0aW9uIHJlcXVlc3RlZCBzdGF0ZSBhY2Nlc3Nvci5cbiAgICAgKiBAamEg44Kt44Oj44Oz44K744Or44KS5Y+X44GR5LuY44GR44Gm44GE44KL44GL5Yik5a6aXG4gICAgICovXG4gICAgZ2V0IHJlcXVlc3RlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhKGdldENvbnRleHQodGhpcykuc3RhdHVzICYgQ2FuY2VsVG9rZW5TdGF0ZS5SRVFVRVNURUQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBDYW5jZWxsYXRpb24gY2xvc2VkIHN0YXRlIGFjY2Vzc29yLlxuICAgICAqIEBqYSDjgq3jg6Pjg7Pjgrvjg6vlj5fku5jjgpLntYLkuobjgZfjgabjgYTjgovjgYvliKTlrppcbiAgICAgKi9cbiAgICBnZXQgY2xvc2VkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISEoZ2V0Q29udGV4dCh0aGlzKS5zdGF0dXMgJiBDYW5jZWxUb2tlblN0YXRlLkNMT1NFRCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIGB0b1N0cmluZ2AgdGFnIG92ZXJyaWRlLlxuICAgICAqIEBqYSBgdG9TdHJpbmdgIOOCv+OCsOOBruOCquODvOODkOODvOODqeOCpOODiVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKTogJ0NhbmNlbFRva2VuJyB7IHJldHVybiAnQ2FuY2VsVG9rZW4nOyB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gUmVnaXN0ZXIgY3VzdG9tIGNhbmNlbGxhdGlvbiBjYWxsYmFjay5cbiAgICAgKiBAamEg44Kt44Oj44Oz44K744Or5pmC44Gu44Kr44K544K/44Og5Yem55CG44Gu55m76YyyXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb25DYW5jZWxcbiAgICAgKiAgLSBgZW5gIGNhbmNlbCBvcGVyYXRpb24gY2FsbGJhY2tcbiAgICAgKiAgLSBgamFgIOOCreODo+ODs+OCu+ODq+OCs+ODvOODq+ODkOODg+OCr1xuICAgICAqIEByZXR1cm5zXG4gICAgICogIC0gYGVuYCBgU3Vic2NyaXB0aW9uYCBpbnN0YW5jZS5cbiAgICAgKiAgICAgICAgWW91IGNhbiByZXZva2UgY2FuY2VsbGF0aW9uIHRvIGNhbGwgYHVuc3Vic2NyaWJlYCBtZXRob2QuXG4gICAgICogIC0gYGphYCBgU3Vic2NyaXB0aW9uYCDjgqTjg7Pjgrnjgr/jg7PjgrlcbiAgICAgKiAgICAgICAgYHVuc3Vic2NyaWJlYCDjg6Hjgr3jg4Pjg4njgpLlkbzjgbbjgZPjgajjgafjgq3jg6Pjg7Pjgrvjg6vjgpLnhKHlirnjgavjgZnjgovjgZPjgajjgYzlj6/og71cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXIob25DYW5jZWw6IChyZWFzb246IFQpID0+IHVua25vd24pOiBTdWJzY3JpcHRpb24ge1xuICAgICAgICBjb25zdCBjb250ZXh0ID0gZ2V0Q29udGV4dCh0aGlzKTtcbiAgICAgICAgaWYgKCF0aGlzLmNhbmNlbGFibGUpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnZhbGlkU3Vic2NyaXB0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb250ZXh0LmJyb2tlci5vbignY2FuY2VsJywgb25DYW5jZWwpO1xuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcml2YXRlIFtfY2FuY2VsXShyZWFzb246IFQpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY29udGV4dCA9IGdldENvbnRleHQodGhpcyk7XG4gICAgICAgIHZlcmlmeSgnbm90TmlsJywgcmVhc29uKTtcbiAgICAgICAgaWYgKCF0aGlzLmNhbmNlbGFibGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0LnJlYXNvbiA9IHJlYXNvbjtcbiAgICAgICAgY29udGV4dC5zdGF0dXMgfD0gQ2FuY2VsVG9rZW5TdGF0ZS5SRVFVRVNURUQ7XG4gICAgICAgIGZvciAoY29uc3QgcyBvZiBjb250ZXh0LnN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgICAgIHMudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0LmJyb2tlci50cmlnZ2VyKCdjYW5jZWwnLCByZWFzb24pO1xuICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHRoaXNbX2Nsb3NlXSgpKTtcbiAgICB9XG5cbiAgICAvKiogQGludGVybmFsICovXG4gICAgcHJpdmF0ZSBbX2Nsb3NlXSgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY29udGV4dCA9IGdldENvbnRleHQodGhpcyk7XG4gICAgICAgIGlmICh0aGlzLmNsb3NlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRleHQuc3RhdHVzIHw9IENhbmNlbFRva2VuU3RhdGUuQ0xPU0VEO1xuICAgICAgICBmb3IgKGNvbnN0IHMgb2YgY29udGV4dC5zdWJzY3JpcHRpb25zKSB7XG4gICAgICAgICAgICBzLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGV4dC5zdWJzY3JpcHRpb25zLmNsZWFyKCk7XG4gICAgICAgIGNvbnRleHQuYnJva2VyLm9mZigpO1xuICAgIH1cbn1cbiIsIi8qIGVzbGludC1kaXNhYmxlXG4gICBuby1nbG9iYWwtYXNzaWduXG4gLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gKi9cblxuaW1wb3J0IHtcbiAgICBpc0Z1bmN0aW9uLFxuICAgIHZlcmlmeSxcbiAgICBnZXRDb25maWcsXG59IGZyb20gJ0BjZHAvY29yZS11dGlscyc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdAY2RwL2V2ZW50cyc7XG5pbXBvcnQgeyBDYW5jZWxUb2tlbiB9IGZyb20gJy4vY2FuY2VsLXRva2VuJztcblxuZGVjbGFyZSBnbG9iYWwge1xuXG4gICAgaW50ZXJmYWNlIFByb21pc2VDb25zdHJ1Y3RvciB7XG4gICAgICAgIG5ldyA8VD4oZXhlY3V0b3I6IChyZXNvbHZlOiAodmFsdWU/OiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZCkgPT4gdm9pZCwgY2FuY2VsVG9rZW4/OiBDYW5jZWxUb2tlbiB8IG51bGwpOiBQcm9taXNlPFQ+O1xuICAgICAgICByZXNvbHZlPFQ+KHZhbHVlPzogVCB8IFByb21pc2VMaWtlPFQ+LCBjYW5jZWxUb2tlbj86IENhbmNlbFRva2VuIHwgbnVsbCk6IFByb21pc2U8VD47XG4gICAgfVxuXG59XG5cbi8qKiBgTmF0aXZlIFByb21pc2VgIGNvbnN0cnVjdG9yICovXG5jb25zdCBOYXRpdmVQcm9taXNlID0gUHJvbWlzZTtcbi8qKiBAaW50ZXJuYWwgKi9cbmNvbnN0IF9jcmVhdGUgPSBTeW1ib2woJ2NyZWF0ZScpO1xuLyoqIEBpbnRlcm5hbCAqL1xuY29uc3QgX3Rva2VucyA9IG5ldyBXZWFrTWFwPFByb21pc2U8dW5rbm93bj4sIENhbmNlbFRva2VuPigpO1xuXG4vKipcbiAqIEBlbiBFeHRlbmRlZCBgUHJvbWlzZWAgY2xhc3Mgd2hpY2ggZW5hYmxlZCBjYW5jZWxsYXRpb24uIDxicj5cbiAqICAgICBgTmF0aXZlIFByb21pc2VgIGNvbnN0cnVjdG9yIGlzIG92ZXJyaWRkZW4gYnkgZnJhbWV3b3JrIGRlZmF1bHQgYmVoYXZpb3VyLlxuICogQGphIOOCreODo+ODs+OCu+ODq+OCkuWPr+iDveOBq+OBl+OBnyBgUHJvbWlzZWAg5ouh5by144Kv44Op44K5IDxicj5cbiAqICAgICDml6LlrprjgacgYE5hdGl2ZSBQcm9taXNlYCDjgpLjgqrjg7zjg5Djg7zjg6njgqTjg4njgZnjgosuXG4gKi9cbmNsYXNzIENhbmNlbGFibGVQcm9taXNlPFQ+IGV4dGVuZHMgTmF0aXZlUHJvbWlzZTxUPiB7XG5cbiAgICAvKipcbiAgICAgKiBAZW4gT3ZlcnJpZGluZyBvZiB0aGUgZGVmYXVsdCBjb25zdHJ1Y3RvciB1c2VkIGZvciBnZW5lcmF0aW9uIG9mIGFuIG9iamVjdC5cbiAgICAgKiBAamEg44Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQ44Gr5L2/44KP44KM44KL44OH44OV44Kp44Or44OI44Kz44Oz44K544OI44Op44Kv44K/44Gu44Kq44O844OQ44O844Op44Kk44OJXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IFtTeW1ib2wuc3BlY2llc10oKTogUHJvbWlzZUNvbnN0cnVjdG9yIHsgcmV0dXJuIE5hdGl2ZVByb21pc2U7IH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBDcmVhdGVzIGEgbmV3IHJlc29sdmVkIHByb21pc2UgZm9yIHRoZSBwcm92aWRlZCB2YWx1ZS5cbiAgICAgKiBAamEg5paw6KaP44Gr6Kej5rG65riI44G/IHByb21pc2Ug44Kk44Oz44K544K/44Oz44K544KS5L2c5oiQXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKlxuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqICAtIGBlbmAgdGhlIHZhbHVlIHRyYW5zbWl0dGVkIGluIHByb21pc2UgY2hhaW4uXG4gICAgICogIC0gYGphYCBgUHJvbWlzZWAg44Gr5Lyd6YGU44GZ44KL5YCkXG4gICAgICogQHBhcmFtIGNhbmNlbFRva2VuXG4gICAgICogIC0gYGVuYCBbW0NhbmNlbFRva2VuXV0gaW5zdGFuY2UgY3JlYXRlIGZyb20gW1tDYW5jZWxUb2tlbl1dLmBzb3VyY2UoKWAuXG4gICAgICogIC0gYGphYCBbW0NhbmNlbFRva2VuXV0uYHNvdXJjZSgpYCDjgojjgorkvZzmiJDjgZfjgZ8gW1tDYW5jZWxUb2tlbl1dIOOCpOODs+OCueOCv+ODs+OCueOCkuaMh+WumlxuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlPFQ+KHZhbHVlPzogVCB8IFByb21pc2VMaWtlPFQ+LCBjYW5jZWxUb2tlbj86IENhbmNlbFRva2VuIHwgbnVsbCk6IENhbmNlbGFibGVQcm9taXNlPFQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbX2NyZWF0ZV0oc3VwZXIucmVzb2x2ZSh2YWx1ZSksIGNhbmNlbFRva2VuKTtcbiAgICB9XG5cbiAgICAvKiogQGludGVybmFsIHByaXZhdGUgY29uc3RydWN0aW9uICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgW19jcmVhdGVdPFQsIFRSZXN1bHQxID0gVCwgVFJlc3VsdDIgPSBuZXZlcj4oXG4gICAgICAgIHNyYzogUHJvbWlzZTxUPixcbiAgICAgICAgdG9rZW4/OiBDYW5jZWxUb2tlbiB8IG51bGwsXG4gICAgICAgIHRoZW5BcmdzPzogW1xuICAgICAgICAgICAgKCh2YWx1ZTogVCkgPT4gVFJlc3VsdDEgfCBQcm9taXNlTGlrZTxUUmVzdWx0MT4pIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICgocmVhc29uOiBhbnkpID0+IFRSZXN1bHQyIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDI+KSB8IG51bGwgfCB1bmRlZmluZWRcbiAgICAgICAgXSB8IG51bGxcbiAgICApOiBDYW5jZWxhYmxlUHJvbWlzZTxUUmVzdWx0MSB8IFRSZXN1bHQyPiB7XG4gICAgICAgIHZlcmlmeSgnaW5zdGFuY2VPZicsIE5hdGl2ZVByb21pc2UsIHNyYyk7XG5cbiAgICAgICAgbGV0IHA6IFByb21pc2U8VCB8IFRSZXN1bHQxIHwgVFJlc3VsdDI+O1xuICAgICAgICBpZiAoISh0b2tlbiBpbnN0YW5jZW9mIENhbmNlbFRva2VuKSkge1xuICAgICAgICAgICAgcCA9IHNyYztcbiAgICAgICAgfSBlbHNlIGlmICh0aGVuQXJncyAmJiAoIWlzRnVuY3Rpb24odGhlbkFyZ3NbMF0pIHx8IGlzRnVuY3Rpb24odGhlbkFyZ3NbMV0pKSkge1xuICAgICAgICAgICAgcCA9IHNyYztcbiAgICAgICAgfSBlbHNlIGlmICh0b2tlbi5jYW5jZWxhYmxlKSB7XG4gICAgICAgICAgICBsZXQgczogU3Vic2NyaXB0aW9uO1xuICAgICAgICAgICAgcCA9IG5ldyBOYXRpdmVQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBzID0gdG9rZW4ucmVnaXN0ZXIocmVqZWN0KTtcbiAgICAgICAgICAgICAgICBzdXBlci5wcm90b3R5cGUudGhlbi5jYWxsKHNyYywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgZGlzcG9zZSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgICAgICAgICBzLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgICAgX3Rva2Vucy5kZWxldGUocCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcC50aGVuKGRpc3Bvc2UsIGRpc3Bvc2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHRva2VuLnJlcXVlc3RlZCkge1xuICAgICAgICAgICAgcCA9IHN1cGVyLnJlamVjdCh0b2tlbi5yZWFzb24pO1xuICAgICAgICB9IGVsc2UgaWYgKHRva2VuLmNsb3NlZCkge1xuICAgICAgICAgICAgcCA9IHNyYztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCBFeGNlcHRpb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGVuQXJncykge1xuICAgICAgICAgICAgcCA9IHN1cGVyLnByb3RvdHlwZS50aGVuLmFwcGx5KHAsIHRoZW5BcmdzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodG9rZW4gJiYgdG9rZW4uY2FuY2VsYWJsZSkge1xuICAgICAgICAgICAgX3Rva2Vucy5zZXQocCwgdG9rZW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgcCBpbnN0YW5jZW9mIHRoaXMgfHwgT2JqZWN0LnNldFByb3RvdHlwZU9mKHAsIHRoaXMucHJvdG90eXBlKTtcblxuICAgICAgICByZXR1cm4gcCBhcyBDYW5jZWxhYmxlUHJvbWlzZTxUUmVzdWx0MSB8IFRSZXN1bHQyPjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIGV4ZWN1dG9yXG4gICAgICogIC0gYGVuYCBBIGNhbGxiYWNrIHVzZWQgdG8gaW5pdGlhbGl6ZSB0aGUgcHJvbWlzZS4gVGhpcyBjYWxsYmFjayBpcyBwYXNzZWQgdHdvIGFyZ3VtZW50cyBgcmVzb2x2ZWAgYW5kIGByZWplY3RgLlxuICAgICAqICAtIGBqYWAgcHJvbWlzZSDjga7liJ3mnJ/ljJbjgavkvb/nlKjjgZnjgovjgrPjg7zjg6vjg5Djg4Pjgq/jgpLmjIflrpouIGByZXNvbHZlYCDjgaggYHJlamVjdGAg44GuMuOBpOOBruW8leaVsOOCkuaMgeOBpFxuICAgICAqIEBwYXJhbSBjYW5jZWxUb2tlblxuICAgICAqICAtIGBlbmAgW1tDYW5jZWxUb2tlbl1dIGluc3RhbmNlIGNyZWF0ZSBmcm9tIFtbQ2FuY2VsVG9rZW5dXS5gc291cmNlKClgLlxuICAgICAqICAtIGBqYWAgW1tDYW5jZWxUb2tlbl1dLmBzb3VyY2UoKWAg44KI44KK5L2c5oiQ44GX44GfIFtbQ2FuY2VsVG9rZW5dXSDjgqTjg7Pjgrnjgr/jg7PjgrnjgpLmjIflrppcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZXhlY3V0b3I6IChyZXNvbHZlOiAodmFsdWU/OiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZCkgPT4gdm9pZCxcbiAgICAgICAgY2FuY2VsVG9rZW4/OiBDYW5jZWxUb2tlbiB8IG51bGxcbiAgICApIHtcbiAgICAgICAgc3VwZXIoZXhlY3V0b3IpO1xuICAgICAgICByZXR1cm4gQ2FuY2VsYWJsZVByb21pc2VbX2NyZWF0ZV0odGhpcywgY2FuY2VsVG9rZW4pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaGVzIGNhbGxiYWNrcyBmb3IgdGhlIHJlc29sdXRpb24gYW5kL29yIHJlamVjdGlvbiBvZiB0aGUgUHJvbWlzZS5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqXG4gICAgICogQHBhcmFtIG9uZnVsZmlsbGVkIFRoZSBjYWxsYmFjayB0byBleGVjdXRlIHdoZW4gdGhlIFByb21pc2UgaXMgcmVzb2x2ZWQuXG4gICAgICogQHBhcmFtIG9ucmVqZWN0ZWQgVGhlIGNhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiB0aGUgUHJvbWlzZSBpcyByZWplY3RlZC5cbiAgICAgKiBAcmV0dXJucyBBIFByb21pc2UgZm9yIHRoZSBjb21wbGV0aW9uIG9mIHdoaWNoIGV2ZXIgY2FsbGJhY2sgaXMgZXhlY3V0ZWQuXG4gICAgICovXG4gICAgdGhlbjxUUmVzdWx0MSA9IFQsIFRSZXN1bHQyID0gbmV2ZXI+KFxuICAgICAgICBvbmZ1bGZpbGxlZD86ICgodmFsdWU6IFQpID0+IFRSZXN1bHQxIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDE+KSB8IG51bGwsXG4gICAgICAgIG9ucmVqZWN0ZWQ/OiAoKHJlYXNvbjogYW55KSA9PiBUUmVzdWx0MiB8IFByb21pc2VMaWtlPFRSZXN1bHQyPikgfCBudWxsXG4gICAgKTogUHJvbWlzZTxUUmVzdWx0MSB8IFRSZXN1bHQyPiB7XG4gICAgICAgIHJldHVybiBDYW5jZWxhYmxlUHJvbWlzZVtfY3JlYXRlXSh0aGlzLCBfdG9rZW5zLmdldCh0aGlzKSwgW29uZnVsZmlsbGVkLCBvbnJlamVjdGVkXSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoZXMgYSBjYWxsYmFjayBmb3Igb25seSB0aGUgcmVqZWN0aW9uIG9mIHRoZSBQcm9taXNlLlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb25yZWplY3RlZCBUaGUgY2FsbGJhY2sgdG8gZXhlY3V0ZSB3aGVuIHRoZSBQcm9taXNlIGlzIHJlamVjdGVkLlxuICAgICAqIEByZXR1cm5zIEEgUHJvbWlzZSBmb3IgdGhlIGNvbXBsZXRpb24gb2YgdGhlIGNhbGxiYWNrLlxuICAgICAqL1xuICAgIGNhdGNoPFRSZXN1bHQyID0gbmV2ZXI+KG9ucmVqZWN0ZWQ/OiAoKHJlYXNvbjogYW55KSA9PiBUUmVzdWx0MiB8IFByb21pc2VMaWtlPFRSZXN1bHQyPikgfCBudWxsKTogUHJvbWlzZTxUIHwgVFJlc3VsdDI+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9ucmVqZWN0ZWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaGVzIGEgY2FsbGJhY2sgdGhhdCBpcyBpbnZva2VkIHdoZW4gdGhlIFByb21pc2UgaXMgc2V0dGxlZCAoZnVsZmlsbGVkIG9yIHJlamVjdGVkKS4gPGJyPlxuICAgICAqIFRoZSByZXNvbHZlZCB2YWx1ZSBjYW5ub3QgYmUgbW9kaWZpZWQgZnJvbSB0aGUgY2FsbGJhY2suXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKlxuICAgICAqIEBwYXJhbSBvbmZpbmFsbHkgVGhlIGNhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiB0aGUgUHJvbWlzZSBpcyBzZXR0bGVkIChmdWxmaWxsZWQgb3IgcmVqZWN0ZWQpLlxuICAgICAqIEByZXR1cm5zIEEgUHJvbWlzZSBmb3IgdGhlIGNvbXBsZXRpb24gb2YgdGhlIGNhbGxiYWNrLlxuICAgICAqL1xuICAgIGZpbmFsbHkob25maW5hbGx5PzogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkIHwgbnVsbCk6IFByb21pc2U8VD4ge1xuICAgICAgICByZXR1cm4gQ2FuY2VsYWJsZVByb21pc2VbX2NyZWF0ZV0oc3VwZXIuZmluYWxseShvbmZpbmFsbHkpLCBfdG9rZW5zLmdldCh0aGlzKSk7XG4gICAgfVxuXG59XG5cbi8qKlxuICogQGVuIFN3aXRjaCB0aGUgZ2xvYmFsIGBQcm9taXNlYCBjb25zdHJ1Y3RvciBgTmF0aXZlIFByb21pc2VgIG9yIFtbQ2FuY2VsYWJsZVByb21pc2VdXS4gPGJyPlxuICogICAgIGBOYXRpdmUgUHJvbWlzZWAgY29uc3RydWN0b3IgaXMgb3ZlcnJpZGRlbiBieSBmcmFtZXdvcmsgZGVmYXVsdCBiZWhhdmlvdXIuXG4gKiBAamEg44Kw44Ot44O844OQ44OrIGBQcm9taXNlYCDjgrPjg7Pjgrnjg4jjg6njgq/jgr/jgpIgYE5hdGl2ZSBQcm9taXNlYCDjgb7jgZ/jga8gW1tDYW5jZWxhYmxlUHJvbWlzZV1dIOOBq+WIh+OCiuabv+OBiCA8YnI+XG4gKiAgICAg5pei5a6a44GnIGBOYXRpdmUgUHJvbWlzZWAg44KS44Kq44O844OQ44O844Op44Kk44OJ44GZ44KLLlxuICpcbiAqIEBwYXJhbSBlbmFibGVcbiAqICAtIGBlbmAgYHRydWVgOiB1c2UgW1tDYW5jZWxhYmxlUHJvbWlzZV1dIC8gIGBmYWxzZWA6IHVzZSBgTmF0aXZlIFByb21pc2VgXG4gKiAgLSBgamFgIGB0cnVlYDogW1tDYW5jZWxhYmxlUHJvbWlzZV1dIOOCkuS9v+eUqCAvIGBmYWxzZWA6IGBOYXRpdmUgUHJvbWlzZWAg44KS5L2/55SoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmRQcm9taXNlKGVuYWJsZTogYm9vbGVhbik6IFByb21pc2VDb25zdHJ1Y3RvciB7XG4gICAgaWYgKGVuYWJsZSkge1xuICAgICAgICBQcm9taXNlID0gQ2FuY2VsYWJsZVByb21pc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgUHJvbWlzZSA9IE5hdGl2ZVByb21pc2U7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlO1xufVxuXG4vKiogQGludGVybmFsIGdsb2JhbCBjb25maWcgb3B0aW9ucyAqL1xuaW50ZXJmYWNlIEdsb2JhbENvbmZpZyB7XG4gICAgbm9BdXRvbWF0aWNOYXRpdmVFeHRlbmQ6IGJvb2xlYW47XG59XG5cbi8vIGRlZmF1bHQ6IGF1dG9tYXRpYyBuYXRpdmUgcHJvbWlzZSBvdmVycmlkZS5cbmV4dGVuZFByb21pc2UoIWdldENvbmZpZzxHbG9iYWxDb25maWc+KCkubm9BdXRvbWF0aWNOYXRpdmVFeHRlbmQpO1xuXG5leHBvcnQge1xuICAgIENhbmNlbGFibGVQcm9taXNlLFxuICAgIENhbmNlbGFibGVQcm9taXNlIGFzIFByb21pc2UsXG59O1xuIiwiLyogZXNsaW50LWRpc2FibGVcbiAgIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1mdW5jdGlvbi1yZXR1cm4tdHlwZVxuICovXG5cbmltcG9ydCB7IENhbmNlbFRva2VuLCBDYW5jZWxUb2tlblNvdXJjZSB9IGZyb20gJy4vY2FuY2VsLXRva2VuJztcblxuLyoqXG4gKiBAZW4gQ2FuY2VsYWJsZSBiYXNlIG9wdGlvbiBkZWZpbml0aW9uLlxuICogQGphIOOCreODo+ODs+OCu+ODq+WPr+iDveOBquWfuuW6leOCquODl+OCt+ODp+ODs1xuICovXG5leHBvcnQgaW50ZXJmYWNlIENhbmNlbGFibGUge1xuICAgIGNhbmNlbD86IENhbmNlbFRva2VuO1xufVxuXG4vL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fLy9cblxuLyoqXG4gKiBAZW4gV2FpdCBmb3IgcHJvbWlzZXMgZG9uZS4gPGJyPlxuICogICAgIFdoaWxlIGNvbnRyb2wgd2lsbCBiZSByZXR1cm5lZCBpbW1lZGlhdGVseSB3aGVuIGBQcm9taXNlLmFsbCgpYCBmYWlscywgYnV0IHRoaXMgbWVodG9kIHdhaXRzIGZvciBpbmNsdWRpbmcgZmFpbHVyZS5cbiAqIEBqYSBgUHJvbWlzZWAg44Kq44OW44K444Kn44Kv44OI44Gu57WC5LqG44G+44Gn5b6F5qmfIDxicj5cbiAqICAgICBgUHJvbWlzZS5hbGwoKWAg44Gv5aSx5pWX44GZ44KL44Go44GZ44GQ44Gr5Yi25b6h44KS6L+U44GZ44Gu44Gr5a++44GX44CB5aSx5pWX44KC5ZCr44KB44Gm5b6F44GkIGBQcm9taXNlYCDjgqrjg5bjgrjjgqfjgq/jg4jjgpLov5TljbRcbiAqXG4gKiBAcGFyYW0gcHJvbWlzZXNcbiAqICAtIGBlbmAgUHJvbWlzZSBpbnN0YW5jZSBhcnJheVxuICogIC0gYGphYCBQcm9taXNlIOOCpOODs+OCueOCv+ODs+OCueOBrumFjeWIl+OCkuaMh+WumlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2FpdChwcm9taXNlczogUHJvbWlzZTx1bmtub3duPltdKTogUHJvbWlzZTx1bmtub3duW10+IHtcbiAgICBjb25zdCBzYWZlUHJvbWlzZXMgPSBwcm9taXNlcy5tYXAoKHByb21pc2UpID0+IHByb21pc2UuY2F0Y2goKGUpID0+IGUpKTtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoc2FmZVByb21pc2VzKTtcbn1cblxuLyoqXG4gKiBAZW4gQ2FuY2VsbGF0aW9uIGNoZWNrZXIgbWV0aG9kLiA8YnI+XG4gKiAgICAgSXQncyBwcmFjdGljYWJsZSBieSBgYXN5bmMgZnVuY3Rpb25gLlxuICogQGphIOOCreODo+ODs+OCu+ODq+ODgeOCp+ODg+OCq+ODvCA8YnI+XG4gKiAgICAgYGFzeW5jIGZ1bmN0aW9uYCDjgafkvb/nlKjlj6/og71cbiAqXG4gKiBAZXhhbXBsZSA8YnI+XG4gKlxuICogYGBgdHNcbiAqICBhc3luYyBmdW5jdGlvbiBzb21lRnVuYyh0b2tlbjogQ2FuY2VsVG9rZW4pOiBQcm9taXNlPHt9PiB7XG4gKiAgICBhd2FpdCBjaGVja0NhbmNlbGVkKHRva2VuKTtcbiAqICAgIHJldHVybiB7fTtcbiAqICB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gdG9rZW5cbiAqICAtIGBlbmAgW1tDYW5jZWxUb2tlbl1dIHJlZmVyZW5jZS4gKGVuYWJsZSBgdW5kZWZpbmVkYClcbiAqICAtIGBqYWAgW1tDYW5jZWxUb2tlbl1dIOOCkuaMh+WumiAodW5kZWZpbmVkIOWPrylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQ2FuY2VsZWQodG9rZW46IENhbmNlbFRva2VuIHwgdW5kZWZpbmVkKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQsIHRva2VuKTtcbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbi8qKlxuICogQGVuIFRoZSBjbGFzcyBtYW5hZ2VzIGx1bXBpbmcgbXVsdGlwbGUgYFByb21pc2VgIG9iamVjdHMuIDxicj5cbiAqICAgICBJdCdzIHBvc3NpYmxlIHRvIG1ha2UgdGhlbSBjYW5jZWwgbW9yZSB0aGFuIG9uZSBgUHJvbWlzZWAgd2hpY2ggaGFuZGxlcyBkaWZmZXJlbnQgW1tDYW5jZWxUb2tlbl1dIGJ5IGx1bXBpbmcuXG4gKiBAamEg6KSH5pWwIGBQcm9taXNlYCDjgqrjg5bjgrjjgqfjgq/jg4jjgpLkuIDmi6znrqHnkIbjgZnjgovjgq/jg6njgrkgPGJyPlxuICogICAgIOeVsOOBquOCiyBbW0NhbmNlbFRva2VuXV0g44KS5omx44GG6KSH5pWw44GuIGBQcm9taXNlYCDjgpLkuIDmi6zjgafjgq3jg6Pjg7Pjgrvjg6vjgZXjgZvjgovjgZPjgajjgYzlj6/og71cbiAqL1xuZXhwb3J0IGNsYXNzIFByb21pc2VNYW5hZ2VyIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1jYWxsLXNwYWNpbmdcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9wb29sID0gbmV3IE1hcDxQcm9taXNlPHVua25vd24+LCAoKHJlYXNvbjogdW5rbm93bikgPT4gdW5rbm93bikgfCB1bmRlZmluZWQ+KCk7XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQWRkIGEgYFByb21pc2VgIG9iamVjdCB1bmRlciB0aGUgbWFuYWdlbWVudC5cbiAgICAgKiBAamEgYFByb21pc2VgIOOCquODluOCuOOCp+OCr+ODiOOCkueuoeeQhuS4i+OBq+i/veWKoFxuICAgICAqXG4gICAgICogQHBhcmFtIHByb21pc2VcbiAgICAgKiAgLSBgZW5gIGFueSBgUHJvbWlzZWAgaW5zdGFuY2UgaXMgYXZhaWxhYmxlLlxuICAgICAqICAtIGBqYWAg5Lu75oSP44GuIGBQcm9taXNlYCDjgqTjg7Pjgrnjgr/jg7PjgrlcbiAgICAgKiBAcGFyYW0gY2FuY2VsU291cmNlXG4gICAgICogIC0gYGVuYCBbW0NhbmNlbFRva2VuU291cmNlXV0gaW5zdGFuY2UgbWFkZSBieSBgQ2FuY2VsVG9rZW4uc291cmNlKClgLlxuICAgICAqICAtIGBqYWAgYENhbmNlbFRva2VuLnNvdXJjZSgpYCDjgafnlJ/miJDjgZXjgozjgosgW1tDYW5jZWxUb2tlblNvdXJjZV1dIOOCpOODs+OCueOCv+ODs+OCuVxuICAgICAqIEByZXR1cm5zXG4gICAgICogIC0gYGVuYCByZXR1cm4gdGhlIHNhbWUgaW5zdGFuY2Ugb2YgaW5wdXQgYHByb21pc2VgIGluc3RhbmNlLlxuICAgICAqICAtIGBqYWAg5YWl5Yqb44GX44GfIGBwcm9taXNlYCDjgajlkIzkuIDjgqTjg7Pjgrnjgr/jg7PjgrnjgpLov5TljbRcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkPFQ+KHByb21pc2U6IFByb21pc2U8VD4sIGNhbmNlbFNvdXJjZT86IENhbmNlbFRva2VuU291cmNlKTogUHJvbWlzZTxUPiB7XG4gICAgICAgIHRoaXMuX3Bvb2wuc2V0KHByb21pc2UsIGNhbmNlbFNvdXJjZSAmJiBjYW5jZWxTb3VyY2UuY2FuY2VsKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvdW5ib3VuZC1tZXRob2RcblxuICAgICAgICBjb25zdCBhbHdheXMgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9wb29sLmRlbGV0ZShwcm9taXNlKTtcbiAgICAgICAgICAgIGlmIChjYW5jZWxTb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBjYW5jZWxTb3VyY2UuY2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBwcm9taXNlXG4gICAgICAgICAgICAudGhlbihhbHdheXMsIGFsd2F5cyk7XG5cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFJlbGVhc2VkIGFsbCBpbnN0YW5jZXMgdW5kZXIgdGhlIG1hbmFnZW1lbnQuXG4gICAgICogQGphIOeuoeeQhuWvvuixoeOCkuegtOajhFxuICAgICAqL1xuICAgIHB1YmxpYyByZWxlYXNlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9wb29sLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFJldHVybiBgcHJvbWlzZWAgYXJyYXkgZnJvbSB1bmRlciB0aGUgbWFuYWdlbWVudC5cbiAgICAgKiBAamEg566h55CG5a++6LGh44GuIFByb21pc2Ug44KS6YWN5YiX44Gn5Y+W5b6XXG4gICAgICovXG4gICAgcHVibGljIHByb21pc2VzKCk6IFByb21pc2U8dW5rbm93bj5bXSB7XG4gICAgICAgIHJldHVybiBbLi4udGhpcy5fcG9vbC5rZXlzKCldO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBDYWxsIGBQcm9taXNlLmFsbCgpYCBmb3IgdW5kZXIgdGhlIG1hbmFnZW1lbnQuXG4gICAgICogQGphIOeuoeeQhuWvvuixoeOBq+WvvuOBl+OBpiBgUHJvbWlzZS5hbGwoKWBcbiAgICAgKi9cbiAgICBwdWJsaWMgYWxsKCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwodGhpcy5wcm9taXNlcygpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQ2FsbCBgUHJvbWlzZS5yYWNlKClgIGZvciB1bmRlciB0aGUgbWFuYWdlbWVudC5cbiAgICAgKiBAamEg566h55CG5a++6LGh44Gr5a++44GX44GmIGBQcm9taXNlLnJhY2UoKWBcbiAgICAgKi9cbiAgICBwdWJsaWMgcmFjZSgpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmFjZSh0aGlzLnByb21pc2VzKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBDYWxsIFtbd2FpdF1dKCkgZm9yIHVuZGVyIHRoZSBtYW5hZ2VtZW50LlxuICAgICAqIEBqYSDnrqHnkIblr77osaHjgavlr77jgZfjgaYgW1t3YWl0XV0oKVxuICAgICAqL1xuICAgIHB1YmxpYyB3YWl0KCkge1xuICAgICAgICByZXR1cm4gd2FpdCh0aGlzLnByb21pc2VzKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBJbnZva2UgYGNhbmNlbGAgbWVzc2FnZSBmb3IgdW5kZXIgdGhlIG1hbmFnZW1lbnQgcHJvbWlzZXMuXG4gICAgICogQGphIOeuoeeQhuWvvuixoeOBriBgUHJvbWlzZWAg44Gr5a++44GX44Gm44Kt44Oj44Oz44K744Or44KS55m66KGMXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcmVhc29uXG4gICAgICogIC0gYGVuYCBhcmd1bWVudHMgZm9yIGBjYW5jZWxTb3VyY2VgXG4gICAgICogIC0gYGphYCBgY2FuY2VsU291cmNlYCDjgavmuKHjgZXjgozjgovlvJXmlbBcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqICAtIGBlbmAgYFByb21pc2VgIGluc3RhbmNlIHdoaWNoIHdhaXQgYnkgdW50aWwgY2FuY2VsbGF0aW9uIGNvbXBsZXRpb24uXG4gICAgICogIC0gYGphYCDjgq3jg6Pjg7Pjgrvjg6vlrozkuobjgb7jgaflvoXmqZ/jgZnjgosgW1tQcm9taXNlXV0g44Kk44Oz44K544K/44Oz44K5XG4gICAgICovXG4gICAgcHVibGljIGFib3J0PFQ+KHJlYXNvbj86IFQpOiBQcm9taXNlPHVua25vd25bXT4ge1xuICAgICAgICBmb3IgKGNvbnN0IGNhbmNlbGVyIG9mIHRoaXMuX3Bvb2wudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChjYW5jZWxlcikge1xuICAgICAgICAgICAgICAgIGNhbmNlbGVyKFxuICAgICAgICAgICAgICAgICAgICAobnVsbCAhPSByZWFzb24pID8gcmVhc29uIDogbmV3IEVycm9yKCdhYm9ydCcpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2FpdCh0aGlzLnByb21pc2VzKCkpO1xuICAgIH1cbn1cbiIsIi8qIGVzbGludC1kaXNhYmxlXG4gICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gKi9cblxuaW1wb3J0IHtcbiAgICBpc1N0cmluZyxcbiAgICBpc1N5bWJvbCxcbiAgICBjbGFzc05hbWUsXG59IGZyb20gJ0BjZHAvY29yZS11dGlscyc7XG5pbXBvcnQgeyBFdmVudEJyb2tlciB9IGZyb20gJ0BjZHAvZXZlbnRzJztcblxuLyoqIEBpbnRlcm5hbCBFdmVudEJyb2tlclByb3h5ICovXG5leHBvcnQgY2xhc3MgRXZlbnRCcm9rZXJQcm94eTxFdmVudCBleHRlbmRzIHt9PiB7XG4gICAgcHJpdmF0ZSBfYnJva2VyPzogRXZlbnRCcm9rZXI8RXZlbnQ+O1xuICAgIHB1YmxpYyBnZXQoKTogRXZlbnRCcm9rZXI8RXZlbnQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Jyb2tlciB8fCAodGhpcy5fYnJva2VyID0gbmV3IEV2ZW50QnJva2VyKCkpO1xuICAgIH1cbn1cblxuLyoqIEBpbnRlcm5hbCAqL1xuZXhwb3J0IGNvbnN0IF9pbnRlcm5hbCA9IFN5bWJvbCgnaW50ZXJuYWwnKTtcbi8qKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCBjb25zdCBfbm90aWZ5ID0gU3ltYm9sKCdub3RpZnknKTtcbi8qKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCBjb25zdCBfc3RvY2tDaGFuZ2UgPSBTeW1ib2woJ3N0b2NrLWNoYW5nZScpO1xuLyoqIEBpbnRlcm5hbCAqL1xuZXhwb3J0IGNvbnN0IF9ub3RpZnlDaGFuZ2VzID0gU3ltYm9sKCdub3RpZnktY2hhbmdlcycpO1xuXG4vKiogQGludGVybmFsICovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5T2JzZXJ2YWJsZSh4OiBhbnkpOiB2b2lkIHwgbmV2ZXIge1xuICAgIGlmICgheCB8fCAheFtfaW50ZXJuYWxdKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBvYmplY3QgcGFzc2VkIGlzIG5vdCBhbiBJT2JzZXJ2YWJsZS5gKTtcbiAgICB9XG59XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlWYWxpZEtleShrZXk6IHVua25vd24pOiB2b2lkIHwgbmV2ZXIge1xuICAgIGlmIChpc1N0cmluZyhrZXkpIHx8IGlzU3ltYm9sKGtleSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBUeXBlIG9mICR7Y2xhc3NOYW1lKGtleSl9IGlzIG5vdCBhIHZhbGlkIGtleS5gKTtcbn1cbiIsIi8qIGVzbGludC1kaXNhYmxlXG4gICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gKi9cblxuaW1wb3J0IHsgU3Vic2NyaXB0aW9uLCBFdmVudEJyb2tlciB9IGZyb20gJ0BjZHAvZXZlbnRzJztcbmltcG9ydCB7IF9pbnRlcm5hbCB9IGZyb20gJy4vaW50ZXJuYWwnO1xuXG4vKipcbiAqIEBlbiBFdmVudCBvYnNlcnZhdGlvbiBzdGF0ZSBkZWZpbml0aW9uLlxuICogQGphIOOCpOODmeODs+ODiOizvOiqreeKtuaFi+Wumue+qVxuICovXG5leHBvcnQgY29uc3QgZW51bSBPYnNlcnZhYmxlU3RhdGUge1xuICAgIC8qKiBvYnNlcnZhYmxlIHJlYWR5ICovXG4gICAgQUNUSVZFICAgPSAnYWN0aXZlJyxcbiAgICAvKiogTk9UIG9ic2VydmVkLCBidXQgcHJvcGVydHkgY2hhbmdlcyBhcmUgcmVjb3JkZWQuICovXG4gICAgU1VTRVBOREVEID0gJ3N1c3BlbmRlZCcsXG4gICAgLyoqIE5PVCBvYnNlcnZlZCwgYW5kIG5vdCByZWNvcmRpbmcgcHJvcGVydHkgY2hhbmdlcy4gKi9cbiAgICBESVNBQkxFRCA9ICdkaXNhYmxlZCcsXG59XG5cbi8qKlxuICogQGVuIE9ic2VydmFibGUgY29tbW9uIGludGVyZmFjZS5cbiAqIEBqYSBPYnNlcnZhYmxlIOWFsemAmuOCpOODs+OCv+ODvOODleOCp+OCpOOCuVxuICovXG5leHBvcnQgaW50ZXJmYWNlIElPYnNlcnZhYmxlIHtcbiAgICAvKipcbiAgICAgKiBAZW4gU3Vic2NyaXZlIGV2ZW50KHMpLlxuICAgICAqIEBqYSDjgqTjg5njg7Pjg4jos7zoqq3oqK3lrppcbiAgICAgKi9cbiAgICBvbiguLi5hcmdzOiBhbnlbXSk6IFN1YnNjcmlwdGlvbjtcblxuICAgIC8qKlxuICAgICAqIEBlbiBVbnN1YnNjcmliZSBldmVudChzKS5cbiAgICAgKiBAamEg44Kk44OZ44Oz44OI6LO86Kqt6Kej6ZmkXG4gICAgICovXG4gICAgb2ZmKC4uLmFyZ3M6IGFueVtdKTogdm9pZDtcblxuICAgIC8qKlxuICAgICAqIEBlbiBTdXNwZW5kIG9yIGRpc2FibGUgdGhlIGV2ZW50IG9ic2VydmF0aW9uIHN0YXRlLlxuICAgICAqIEBqYSDjgqTjg5njg7Pjg4jos7zoqq3nirbmhYvjga7jgrXjgrnjg5rjg7Pjg4lcbiAgICAgKlxuICAgICAqIEBwYXJhbSBub1JlY29yZFxuICAgICAqICAtIGBlbmAgYHRydWVgOiBub3QgcmVjb3JkaW5nIHByb3BlcnR5IGNoYW5nZXMgYW5kIGNsZWFyIGNoYW5nZXMuIC8gYGZhbHNlYDogcHJvcGVydHkgY2hhbmdlcyBhcmUgcmVjb3JkZWQgYW5kIGZpcmVkIHdoZW4gW1tyZXN1bWVdXSgpIGNhbGxkZWQuIChkZWZhdWx0KVxuICAgICAqICAtIGBqYWAgYHRydWVgOiDjg5fjg63jg5Hjg4bjgqPlpInmm7TjgoLoqJjpjLLjgZvjgZosIOePvuWcqOOBruiomOmMsuOCguegtOajhCAvIGBmYWxzZWA6IOODl+ODreODkeODhuOCo+WkieabtOOBr+iomOmMsuOBleOCjCwgW1tyZXN1bWVdXSgpIOaZguOBq+eZuueBq+OBmeOCiyAo5pei5a6aKVxuICAgICAqL1xuICAgIHN1c3BlbmQobm9SZWNvcmQ/OiBib29sZWFuKTogdGhpcztcblxuICAgIC8qKlxuICAgICAqIEBlbiBSZXN1bWUgdGhlIGV2ZW50IG9ic2VydmF0aW9uIHN0YXRlLlxuICAgICAqIEBqYSDjgqTjg5njg7Pjg4jos7zoqq3nirbmhYvjga7jg6rjgrjjg6Xjg7zjg6BcbiAgICAgKi9cbiAgICByZXN1bWUoKTogdGhpcztcblxuICAgIC8qKlxuICAgICAqIEBlbiBvYnNlcnZhdGlvbiBzdGF0ZVxuICAgICAqIEBqYSDos7zoqq3lj6/og73nirbmhYtcbiAgICAgKi9cbiAgICBnZXRPYnNlcnZhYmxlU3RhdGUoKTogT2JzZXJ2YWJsZVN0YXRlO1xufVxuXG4vKipcbiAqIEBlbiBJbnRlcmZhY2UgYWJsZSB0byBhY2Nlc3MgdG8gW1tFdmVudEJyb2tlcl1dIHdpdGggW1tJT2JzZXJ2YWJsZV1dLlxuICogQGphIFtbSU9ic2VydmFibGVdXSDjga7mjIHjgaTlhoXpg6ggW1tFdmVudEJyb2tlcl1dIOOBq+OCouOCr+OCu+OCueWPr+iDveOBquOCpOODs+OCv+ODvOODleOCp+OCpOOCuVxuICovXG5leHBvcnQgaW50ZXJmYWNlIElPYnNlcnZhYmxlRXZlbnRCcm9rZXJBY2Nlc3M8VCBleHRlbmRzIHt9ID0gYW55PiBleHRlbmRzIElPYnNlcnZhYmxlIHtcbiAgICAvKipcbiAgICAgKiBAZW4gR2V0IFtbRXZlbnRCcm9rZXJdXSBpbnN0YW5jZS5cbiAgICAgKiBAamEgW1tFdmVudEJyb2tlcl1dIOOCpOODs+OCueOCv+ODs+OCueOBruWPluW+l1xuICAgICAqL1xuICAgIGdldEJyb2tlcigpOiBFdmVudEJyb2tlcjxUPjtcbn1cblxuLyoqXG4gKiBAZW4gQ2hlY2sgdGhlIHZhbHVlLXR5cGUgaXMgW1tJT2JzZXJ2YWJsZV1dLlxuICogQGphIFtbSU9ic2VydmFibGVdXSDlnovjgafjgYLjgovjgYvliKTlrppcbiAqXG4gKiBAcGFyYW0geFxuICogIC0gYGVuYCBldmFsdWF0ZWQgdmFsdWVcbiAqICAtIGBqYWAg6KmV5L6h44GZ44KL5YCkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc09ic2VydmFibGUoeDogYW55KTogeCBpcyBJT2JzZXJ2YWJsZSB7XG4gICAgcmV0dXJuIEJvb2xlYW4oeCAmJiB4W19pbnRlcm5hbF0pO1xufVxuIiwiLyogZXNsaW50LWRpc2FibGVcbiAgIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAqL1xuXG5pbXBvcnQge1xuICAgIE5vbkZ1bmN0aW9uUHJvcGVydHlOYW1lcyxcbiAgICBpc1N0cmluZyxcbiAgICBpc0FycmF5LFxuICAgIHZlcmlmeSxcbiAgICBwb3N0LFxuICAgIGRlZXBNZXJnZSxcbiAgICBkZWVwRXF1YWwsXG59IGZyb20gJ0BjZHAvY29yZS11dGlscyc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24sIEV2ZW50QnJva2VyIH0gZnJvbSAnQGNkcC9ldmVudHMnO1xuaW1wb3J0IHtcbiAgICBFdmVudEJyb2tlclByb3h5LFxuICAgIF9pbnRlcm5hbCxcbiAgICBfbm90aWZ5LFxuICAgIF9zdG9ja0NoYW5nZSxcbiAgICBfbm90aWZ5Q2hhbmdlcyxcbiAgICB2ZXJpZnlPYnNlcnZhYmxlLFxufSBmcm9tICcuL2ludGVybmFsJztcbmltcG9ydCB7IE9ic2VydmFibGVTdGF0ZSwgSU9ic2VydmFibGUgfSBmcm9tICcuL2NvbW1vbic7XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmludGVyZmFjZSBJbnRlcm5hbFByb3BzIHtcbiAgICBzdGF0ZTogT2JzZXJ2YWJsZVN0YXRlO1xuICAgIGNoYW5nZWQ6IGJvb2xlYW47XG4gICAgcmVhZG9ubHkgY2hhbmdlTWFwOiBNYXA8UHJvcGVydHlLZXksIGFueT47XG4gICAgcmVhZG9ubHkgYnJva2VyOiBFdmVudEJyb2tlclByb3h5PGFueT47XG59XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmNvbnN0IF9wcm94eUhhbmRsZXI6IFByb3h5SGFuZGxlcjxPYnNlcnZhYmxlT2JqZWN0PiA9IHtcbiAgICBzZXQodGFyZ2V0LCBwLCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgaWYgKCFpc1N0cmluZyhwKSkge1xuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3Quc2V0KHRhcmdldCwgcCwgdmFsdWUsIHJlY2VpdmVyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IHRhcmdldFtwXTtcbiAgICAgICAgaWYgKE9ic2VydmFibGVTdGF0ZS5ESVNBQkxFRCAhPT0gdGFyZ2V0W19pbnRlcm5hbF0uc3RhdGUgJiYgdmFsdWUgIT09IG9sZFZhbHVlKSB7XG4gICAgICAgICAgICB0YXJnZXRbX3N0b2NrQ2hhbmdlXShwLCBvbGRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFJlZmxlY3Quc2V0KHRhcmdldCwgcCwgdmFsdWUsIHJlY2VpdmVyKTtcbiAgICB9LFxufTtcbk9iamVjdC5mcmVlemUoX3Byb3h5SGFuZGxlcik7XG5cbi8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18vL1xuXG4vKipcbiAqIEBlbiBPYnNlcnZhYmxlIGtleSB0eXBlIGRlZmluaXRpb24uXG4gKiBAamEg6LO86Kqt5Y+v6IO944Gq44Kt44O844Gu5Z6L5a6a576pXG4gKi9cbmV4cG9ydCB0eXBlIE9ic2VydmFibGVLZXlzPFQgZXh0ZW5kcyBPYnNlcnZhYmxlT2JqZWN0PiA9IE5vbkZ1bmN0aW9uUHJvcGVydHlOYW1lczxUPjtcblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbi8qKlxuICogQGVuIFRoZSBvYmplY3QgY2xhc3Mgd2hpY2ggY2hhbmdlIGNhbiBiZSBvYnNlcnZlZC5cbiAqIEBqYSDjgqrjg5bjgrjjgqfjgq/jg4jjga7lpInmm7TjgpLnm6PoppbjgafjgY3jgovjgqrjg5bjgrjjgqfjgq/jg4jjgq/jg6njgrlcbiAqXG4gKiBAZXhhbXBsZSA8YnI+XG4gKlxuICogLSBCYXNpYyBVc2FnZVxuICpcbiAqIGBgYHRzXG4gKiBjbGFzcyBFeGFtcGxlIGV4dGVuZHMgT2JzZXJ2YWJsZU9iamVjdCB7XG4gKiAgIHB1YmxpYyBhOiBudW1iZXIgPSAwO1xuICogICBwdWJsaWMgYjogbnVtYmVyID0gMDtcbiAqICAgcHVibGljIGdldCBzdW0oKTogbnVtYmVyIHtcbiAqICAgICAgIHJldHVybiB0aGlzLmEgKyB0aGlzLmI7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBjb25zdCBvYnNlcnZhYmxlID0gbmV3IEV4YW1wbGUoKTtcbiAqXG4gKiBmdW5jdGlvbiBvbk51bUNoYW5nZShuZXdWYWx1ZTogbnVtYmVyLCBvbGRWYWx1ZTogbnVtYmVyLCBrZXk6IHN0cmluZykge1xuICogICBjb25zb2xlLmxvZyhgJHtrZXl9IGNoYW5nZWQgZnJvbSAke29sZFZhbHVlfSB0byAke25ld1ZhbHVlfS5gKTtcbiAqIH1cbiAqIG9ic2VydmFibGUub24oWydhJywgJ2InXSwgb25OdW1DaGFuZ2UpO1xuICpcbiAqIC8vIHVwZGF0ZVxuICogb2JzZXJ2YWJsZS5hID0gMTAwO1xuICogb2JzZXJ2YWJsZS5iID0gMjAwO1xuICpcbiAqIC8vIGNvbnNvbGUgb3V0IGZyb20gYGFzeW5jYCBldmVudCBsb29wLlxuICogLy8gPT4gJ2EgY2hhbmdlZCBmcm9tIDAgdG8gMTAwLidcbiAqIC8vID0+ICdiIGNoYW5nZWQgZnJvbSAwIHRvIDIwMC4nXG4gKlxuICogOlxuICpcbiAqIGZ1bmN0aW9uIG9uU3VtQ2hhbmdlKG5ld1ZhbHVlOiBudW1iZXIsIG9sZFZhbHVlOiBudW1iZXIpIHtcbiAqICAgY29uc29sZS5sb2coYHN1bSBjaGFuZ2VkIGZyb20gJHtvbGRWYWx1ZX0gdG8gJHtuZXdWYXVlfS5gKTtcbiAqIH1cbiAqIG9ic2VydmFibGUub24oJ3N1bScsIG9uU3VtQ2hhbmdlKTtcbiAqXG4gKiAvLyB1cGRhdGVcbiAqIG9ic2VydmFibGUuYSA9IDEwMDsgLy8gbm90aGluZyByZWFjdGlvbiBiZWNhdXNlIG9mIG5vIGNoYW5nZSBwcm9wZXJ0aWVzLlxuICogb2JzZXJ2YWJsZS5hID0gMjAwO1xuICpcbiAqIC8vIGNvbnNvbGUgb3V0IGZyb20gYGFzeW5jYCBldmVudCBsb29wLlxuICogLy8gPT4gJ3N1bSBjaGFuZ2VkIGZyb20gMzAwIHRvIDQwMC4nXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE9ic2VydmFibGVPYmplY3QgaW1wbGVtZW50cyBJT2JzZXJ2YWJsZSB7XG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgW19pbnRlcm5hbF06IEludGVybmFsUHJvcHM7XG5cbiAgICAvKipcbiAgICAgKiBjb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHN0YXRlXG4gICAgICogIC0gYGVuYCBpbml0aWFsIHN0YXRlLiBkZWZhdWx0OiBbW09ic2VydmFibGVTdGF0ZS5BQ1RJVkVdXVxuICAgICAqICAtIGBqYWAg5Yid5pyf54q25oWLIOaXouWumjogW1tPYnNlcnZhYmxlU3RhdGUuQUNUSVZFXV1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzdGF0ZSA9IE9ic2VydmFibGVTdGF0ZS5BQ1RJVkUpIHtcbiAgICAgICAgdmVyaWZ5KCdpbnN0YW5jZU9mJywgT2JzZXJ2YWJsZU9iamVjdCwgdGhpcyk7XG4gICAgICAgIGNvbnN0IGludGVybmFsOiBJbnRlcm5hbFByb3BzID0ge1xuICAgICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgICBjaGFuZ2VkOiBmYWxzZSxcbiAgICAgICAgICAgIGNoYW5nZU1hcDogbmV3IE1hcCgpLFxuICAgICAgICAgICAgYnJva2VyOiBuZXcgRXZlbnRCcm9rZXJQcm94eTx0aGlzPigpLFxuICAgICAgICB9O1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgX2ludGVybmFsLCB7IHZhbHVlOiBPYmplY3Quc2VhbChpbnRlcm5hbCkgfSk7XG4gICAgICAgIHJldHVybiBuZXcgUHJveHkodGhpcywgX3Byb3h5SGFuZGxlcik7XG4gICAgfVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gaW1wbGVtZW50czogSU9ic2VydmFibGVcblxuICAgIC8qKlxuICAgICAqIEBlbiBTdWJzY3JpdmUgcHJvcGVydHkgY2hhbmdlcy5cbiAgICAgKiBAamEg44OX44Ot44OR44OG44Kj5aSJ5pu06LO86Kqt6Kit5a6aICjlhajjg5fjg63jg5Hjg4bjgqPnm6PoppYpXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlcbiAgICAgKiAgLSBgZW5gIHdpbGQgY29yZCBzaWduYXR1cmUuXG4gICAgICogIC0gYGphYCDjg6/jgqTjg6vjg4njgqvjg7zjg4lcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXJcbiAgICAgKiAgLSBgZW5gIGNhbGxiYWNrIGZ1bmN0aW9uIG9mIHRoZSBwcm9wZXJ0eSBjaGFuZ2UuXG4gICAgICogIC0gYGphYCDjg5fjg63jg5Hjg4bjgqPlpInmm7TpgJrnn6XjgrPjg7zjg6vjg5Djg4Pjgq/plqLmlbBcbiAgICAgKi9cbiAgICBvbihwcm9wZXJ0eTogJ0AnLCBsaXN0ZW5lcjogKGNvbnRleHQ6IE9ic2VydmFibGVPYmplY3QpID0+IGFueSk6IFN1YnNjcmlwdGlvbjtcblxuICAgIC8qKlxuICAgICAqIEBlbiBTdWJzY3JpdmUgcHJvcGVydHkgY2hhbmdlKHMpLlxuICAgICAqIEBqYSDjg5fjg63jg5Hjg4bjgqPlpInmm7Tos7zoqq3oqK3lrppcbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eVxuICAgICAqICAtIGBlbmAgdGFyZ2V0IHByb3BlcnR5LlxuICAgICAqICAtIGBqYWAg5a++6LGh44Gu44OX44Ot44OR44OG44KjXG4gICAgICogQHBhcmFtIGxpc3RlbmVyXG4gICAgICogIC0gYGVuYCBjYWxsYmFjayBmdW5jdGlvbiBvZiB0aGUgcHJvcGVydHkgY2hhbmdlLlxuICAgICAqICAtIGBqYWAg44OX44Ot44OR44OG44Kj5aSJ5pu06YCa55+l44Kz44O844Or44OQ44OD44Kv6Zai5pWwXG4gICAgICovXG4gICAgb248SyBleHRlbmRzIE9ic2VydmFibGVLZXlzPHRoaXM+Pihwcm9wZXJ0eTogSyB8IEtbXSwgbGlzdGVuZXI6IChuZXdWYWx1ZTogdGhpc1tLXSwgb2xkVmFsdWU6IHRoaXNbS10sIGtleTogSykgPT4gYW55KTogU3Vic2NyaXB0aW9uO1xuXG4gICAgb248SyBleHRlbmRzIE9ic2VydmFibGVLZXlzPHRoaXM+Pihwcm9wZXJ0eTogSyB8IEtbXSwgbGlzdGVuZXI6IChuZXdWYWx1ZTogdGhpc1tLXSwgb2xkVmFsdWU6IHRoaXNbS10sIGtleTogSykgPT4gYW55KTogU3Vic2NyaXB0aW9uIHtcbiAgICAgICAgdmVyaWZ5T2JzZXJ2YWJsZSh0aGlzKTtcbiAgICAgICAgY29uc3QgeyBjaGFuZ2VNYXAsIGJyb2tlciB9ID0gdGhpc1tfaW50ZXJuYWxdO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBicm9rZXIuZ2V0KCkub24ocHJvcGVydHksIGxpc3RlbmVyKTtcbiAgICAgICAgaWYgKDAgPCBjaGFuZ2VNYXAuc2l6ZSkge1xuICAgICAgICAgICAgY29uc3QgcHJvcHMgPSBpc0FycmF5KHByb3BlcnR5KSA/IHByb3BlcnR5IDogW3Byb3BlcnR5XTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcHJvcCBvZiBwcm9wcykge1xuICAgICAgICAgICAgICAgIGNoYW5nZU1hcC5oYXMocHJvcCkgfHwgY2hhbmdlTWFwLnNldChwcm9wLCB0aGlzW3Byb3BdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBVbnN1YnNjcmliZSBwcm9wZXJ0eSBjaGFuZ2VzKVxuICAgICAqIEBqYSDjg5fjg63jg5Hjg4bjgqPlpInmm7Tos7zoqq3op6PpmaQgKOWFqOODl+ODreODkeODhuOCo+ebo+imlilcbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eVxuICAgICAqICAtIGBlbmAgd2lsZCBjb3JkIHNpZ25hdHVyZS5cbiAgICAgKiAgLSBgamFgIOODr+OCpOODq+ODieOCq+ODvOODiVxuICAgICAqIEBwYXJhbSBsaXN0ZW5lclxuICAgICAqICAtIGBlbmAgY2FsbGJhY2sgZnVuY3Rpb24gb2YgdGhlIHByb3BlcnR5IGNoYW5nZS5cbiAgICAgKiAgLSBgamFgIOODl+ODreODkeODhuOCo+WkieabtOmAmuefpeOCs+ODvOODq+ODkOODg+OCr+mWouaVsFxuICAgICAqL1xuICAgIG9mZihwcm9wZXJ0eTogJ0AnLCBsaXN0ZW5lcj86IChjb250ZXh0OiBPYnNlcnZhYmxlT2JqZWN0KSA9PiBhbnkpOiB2b2lkO1xuXG4gICAgLyoqXG4gICAgICogQGVuIFVuc3Vic2NyaWJlIHByb3BlcnR5IGNoYW5nZShzKS5cbiAgICAgKiBAamEg44OX44Ot44OR44OG44Kj5aSJ5pu06LO86Kqt6Kej6ZmkXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlcbiAgICAgKiAgLSBgZW5gIHRhcmdldCBwcm9wZXJ0eS5cbiAgICAgKiAgICAgICAgIFdoZW4gbm90IHNldCB0aGlzIHBhcmFtZXRlciwgZXZlcnl0aGluZyBpcyByZWxlYXNlZC5cbiAgICAgKiAgLSBgamFgIOWvvuixoeOBruODl+ODreODkeODhuOCo1xuICAgICAqICAgICAgICAg5oyH5a6a44GX44Gq44GE5aC05ZCI44Gv44GZ44G544Gm6Kej6ZmkXG4gICAgICogQHBhcmFtIGxpc3RlbmVyXG4gICAgICogIC0gYGVuYCBjYWxsYmFjayBmdW5jdGlvbiBvZiB0aGUgcHJvcGVydHkgY2hhbmdlLlxuICAgICAqICAgICAgICAgV2hlbiBub3Qgc2V0IHRoaXMgcGFyYW1ldGVyLCBhbGwgc2FtZSBgY2hhbm5lbGAgbGlzdGVuZXJzIGFyZSByZWxlYXNlZC5cbiAgICAgKiAgLSBgamFgIOODl+ODreODkeODhuOCo+WkieabtOmAmuefpeOCs+ODvOODq+ODkOODg+OCr+mWouaVsFxuICAgICAqICAgICAgICAg5oyH5a6a44GX44Gq44GE5aC05ZCI44Gv5ZCM5LiAIGBjaGFubmVsYCDjgZnjgbnjgabjgpLop6PpmaRcbiAgICAgKi9cbiAgICBvZmY8SyBleHRlbmRzIE9ic2VydmFibGVLZXlzPHRoaXM+Pihwcm9wZXJ0eT86IEsgfCBLW10sIGxpc3RlbmVyPzogKG5ld1ZhbHVlOiB0aGlzW0tdLCBvbGRWYWx1ZTogdGhpc1tLXSwga2V5OiBLKSA9PiBhbnkpOiB2b2lkO1xuXG4gICAgb2ZmPEsgZXh0ZW5kcyBPYnNlcnZhYmxlS2V5czx0aGlzPj4ocHJvcGVydHk/OiBLIHwgS1tdLCBsaXN0ZW5lcj86IChuZXdWYWx1ZTogdGhpc1tLXSwgb2xkVmFsdWU6IHRoaXNbS10sIGtleTogSykgPT4gYW55KTogdm9pZCB7XG4gICAgICAgIHZlcmlmeU9ic2VydmFibGUodGhpcyk7XG4gICAgICAgIHRoaXNbX2ludGVybmFsXS5icm9rZXIuZ2V0KCkub2ZmKHByb3BlcnR5LCBsaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFN1c3BlbmQgb3IgZGlzYWJsZSB0aGUgZXZlbnQgb2JzZXJ2YXRpb24gc3RhdGUuXG4gICAgICogQGphIOOCpOODmeODs+ODiOizvOiqreeKtuaFi+OBruOCteOCueODmuODs+ODiVxuICAgICAqXG4gICAgICogQHBhcmFtIG5vUmVjb3JkXG4gICAgICogIC0gYGVuYCBgdHJ1ZWA6IG5vdCByZWNvcmRpbmcgcHJvcGVydHkgY2hhbmdlcyBhbmQgY2xlYXIgY2hhbmdlcy4gLyBgZmFsc2VgOiBwcm9wZXJ0eSBjaGFuZ2VzIGFyZSByZWNvcmRlZCBhbmQgZmlyZWQgd2hlbiBbW3Jlc3VtZV1dKCkgY2FsbGRlZC4gKGRlZmF1bHQpXG4gICAgICogIC0gYGphYCBgdHJ1ZWA6IOODl+ODreODkeODhuOCo+WkieabtOOCguiomOmMsuOBm+OBmiwg54++5Zyo44Gu6KiY6Yyy44KC56C05qOEIC8gYGZhbHNlYDog44OX44Ot44OR44OG44Kj5aSJ5pu044Gv6KiY6Yyy44GV44KMLCBbW3Jlc3VtZV1dKCkg5pmC44Gr55m654Gr44GZ44KLICjml6LlrpopXG4gICAgICovXG4gICAgc3VzcGVuZChub1JlY29yZCA9IGZhbHNlKTogdGhpcyB7XG4gICAgICAgIHZlcmlmeU9ic2VydmFibGUodGhpcyk7XG4gICAgICAgIHRoaXNbX2ludGVybmFsXS5zdGF0ZSA9IG5vUmVjb3JkID8gT2JzZXJ2YWJsZVN0YXRlLkRJU0FCTEVEIDogT2JzZXJ2YWJsZVN0YXRlLlNVU0VQTkRFRDtcbiAgICAgICAgaWYgKG5vUmVjb3JkKSB7XG4gICAgICAgICAgICB0aGlzW19pbnRlcm5hbF0uY2hhbmdlTWFwLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFJlc3VtZSB0aGUgZXZlbnQgb2JzZXJ2YXRpb24gc3RhdGUuXG4gICAgICogQGphIOOCpOODmeODs+ODiOizvOiqreeKtuaFi+OBruODquOCuOODpeODvOODoFxuICAgICAqL1xuICAgIHJlc3VtZSgpOiB0aGlzIHtcbiAgICAgICAgdmVyaWZ5T2JzZXJ2YWJsZSh0aGlzKTtcbiAgICAgICAgY29uc3QgaW50ZXJuYWwgPSB0aGlzW19pbnRlcm5hbF07XG4gICAgICAgIGlmIChPYnNlcnZhYmxlU3RhdGUuQUNUSVZFICE9PSBpbnRlcm5hbC5zdGF0ZSkge1xuICAgICAgICAgICAgaW50ZXJuYWwuc3RhdGUgPSBPYnNlcnZhYmxlU3RhdGUuQUNUSVZFO1xuICAgICAgICAgICAgcG9zdCgoKSA9PiB0aGlzW19ub3RpZnlDaGFuZ2VzXSgpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gb2JzZXJ2YXRpb24gc3RhdGVcbiAgICAgKiBAamEg6LO86Kqt5Y+v6IO954q25oWLXG4gICAgICovXG4gICAgZ2V0T2JzZXJ2YWJsZVN0YXRlKCk6IE9ic2VydmFibGVTdGF0ZSB7XG4gICAgICAgIHZlcmlmeU9ic2VydmFibGUodGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzW19pbnRlcm5hbF0uc3RhdGU7XG4gICAgfVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gaW1wbGVtZW50czogSU9ic2VydmFibGVFdmVudEJyb2tlckFjY2Vzc1xuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIGdldEJyb2tlcigpOiBFdmVudEJyb2tlcjxPYnNlcnZhYmxlS2V5czx0aGlzPj4ge1xuICAgICAgICBjb25zdCB7IGJyb2tlciB9ID0gdGhpc1tfaW50ZXJuYWxdO1xuICAgICAgICByZXR1cm4gYnJva2VyLmdldCgpO1xuICAgIH1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHN0YXRpYyBtZXRob2RzOlxuXG4gICAgLyoqXG4gICAgICogQGVuIENyZWF0ZSBbW09ic2VydmFibGVPYmplY3RdXSBmcm9tIGFueSBvYmplY3QuXG4gICAgICogQGphIOS7u+aEj+OBruOCquODluOCuOOCp+OCr+ODiOOBi+OCiSBbW09ic2VydmFibGVPYmplY3RdXSDjgpLnlJ/miJBcbiAgICAgKlxuICAgICAqIEBleGFtcGxlIDxicj5cbiAgICAgKlxuICAgICAqIGBgYHRzXG4gICAgICogY29uc3Qgb2JzZXJ2YWJsZSA9IE9ic2VydmFibGVPYmplY3QuZnJvbSh7IGE6IDEsIGI6IDEgfSk7XG4gICAgICogZnVuY3Rpb24gb25OdW1DaGFuZ2UobmV3VmFsdWU6IG51bWJlciwgb2xkVmFsdWU6IG51bWJlciwga2V5OiBzdHJpbmcpIHtcbiAgICAgKiAgIGNvbnNvbGUubG9nKGAke2tleX0gY2hhbmdlZCBmcm9tICR7b2xkVmFsdWV9IHRvICR7bmV3VmFsdWV9LmApO1xuICAgICAqIH1cbiAgICAgKiBvYnNlcnZhYmxlLm9uKFsnYScsICdiJ10sIG9uTnVtQ2hhbmdlKTtcbiAgICAgKlxuICAgICAqIC8vIHVwZGF0ZVxuICAgICAqIG9ic2VydmFibGUuYSA9IDEwMDtcbiAgICAgKiBvYnNlcnZhYmxlLmIgPSAyMDA7XG4gICAgICpcbiAgICAgKiAvLyBjb25zb2xlIG91dCBmcm9tIGBhc3luY2AgZXZlbnQgbG9vcC5cbiAgICAgKiAvLyA9PiAnYSBjaGFuZ2VkIGZyb20gMSB0byAxMDAuJ1xuICAgICAqIC8vID0+ICdiIGNoYW5nZWQgZnJvbSAxIHRvIDIwMC4nXG4gICAgICogYGBgXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBmcm9tPFQgZXh0ZW5kcyB7fT4oc3JjOiBUKTogT2JzZXJ2YWJsZU9iamVjdCAmIFQge1xuICAgICAgICBjb25zdCBvYnNlcnZhYmxlID0gZGVlcE1lcmdlKG5ldyBjbGFzcyBleHRlbmRzIE9ic2VydmFibGVPYmplY3QgeyB9KE9ic2VydmFibGVTdGF0ZS5ESVNBQkxFRCksIHNyYyk7XG4gICAgICAgIG9ic2VydmFibGUucmVzdW1lKCk7XG4gICAgICAgIHJldHVybiBvYnNlcnZhYmxlO1xuICAgIH1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHByb3RlY3RlZCBtZWh0b2RzOlxuXG4gICAgLyoqXG4gICAgICogQGVuIEZvcmNlIG5vdGlmeSBwcm9wZXJ0eSBjaGFuZ2UocykgaW4gc3BpdGUgb2YgYWN0aXZlIHN0YXRlLlxuICAgICAqIEBqYSDjgqLjgq/jg4bjgqPjg5bnirbmhYvjgavjgYvjgYvjgo/jgonjgZrlvLfliLbnmoTjgavjg5fjg63jg5Hjg4bjgqPlpInmm7TpgJrnn6XjgpLnmbrooYxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgbm90aWZ5KC4uLnByb3BlcnRpZXM6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgICAgIHZlcmlmeU9ic2VydmFibGUodGhpcyk7XG4gICAgICAgIGlmICgwID09PSBwcm9wZXJ0aWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgY2hhbmdlTWFwIH0gPSB0aGlzW19pbnRlcm5hbF07XG4gICAgICAgIGNvbnN0IGtleVZhbHVlID0gbmV3IE1hcDxQcm9wZXJ0eUtleSwgW2FueSwgYW55XT4oKTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgcHJvcGVydGllcykge1xuICAgICAgICAgICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzW2tleV07XG4gICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IGNoYW5nZU1hcC5oYXMoa2V5KSA/IGNoYW5nZU1hcC5nZXQoa2V5KSA6IG5ld1ZhbHVlO1xuICAgICAgICAgICAga2V5VmFsdWUuc2V0KGtleSwgW25ld1ZhbHVlLCBvbGRWYWx1ZV0pO1xuICAgICAgICB9XG4gICAgICAgIDAgPCBrZXlWYWx1ZS5zaXplICYmIHRoaXNbX25vdGlmeV0oa2V5VmFsdWUpO1xuICAgIH1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHByaXZhdGUgbWVodG9kczpcblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcml2YXRlIFtfc3RvY2tDaGFuZ2VdKHA6IHN0cmluZywgb2xkVmFsdWU6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCB7IHN0YXRlLCBjaGFuZ2VNYXAsIGJyb2tlciB9ID0gdGhpc1tfaW50ZXJuYWxdO1xuICAgICAgICB0aGlzW19pbnRlcm5hbF0uY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIGlmICgwID09PSBjaGFuZ2VNYXAuc2l6ZSkge1xuICAgICAgICAgICAgY2hhbmdlTWFwLnNldChwLCBvbGRWYWx1ZSk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGsgb2YgYnJva2VyLmdldCgpLmNoYW5uZWxzKCkpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2VNYXAuaGFzKGspIHx8IGNoYW5nZU1hcC5zZXQoaywgdGhpc1trXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoT2JzZXJ2YWJsZVN0YXRlLkFDVElWRSA9PT0gc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBwb3N0KCgpID0+IHRoaXNbX25vdGlmeUNoYW5nZXNdKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hhbmdlTWFwLmhhcyhwKSB8fCBjaGFuZ2VNYXAuc2V0KHAsIG9sZFZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcml2YXRlIFtfbm90aWZ5Q2hhbmdlc10oKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHsgc3RhdGUsIGNoYW5nZU1hcCB9ID0gdGhpc1tfaW50ZXJuYWxdO1xuICAgICAgICBpZiAoT2JzZXJ2YWJsZVN0YXRlLkFDVElWRSAhPT0gc3RhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBrZXlWYWx1ZVBhaXJzID0gbmV3IE1hcDxQcm9wZXJ0eUtleSwgW2FueSwgYW55XT4oKTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCBvbGRWYWx1ZV0gb2YgY2hhbmdlTWFwKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJWYWx1ZSA9IHRoaXNba2V5XTtcbiAgICAgICAgICAgIGlmICghZGVlcEVxdWFsKG9sZFZhbHVlLCBjdXJWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBrZXlWYWx1ZVBhaXJzLnNldChrZXksIFtjdXJWYWx1ZSwgb2xkVmFsdWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzW19ub3RpZnldKGtleVZhbHVlUGFpcnMpO1xuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcml2YXRlIFtfbm90aWZ5XShrZXlWYWx1ZTogTWFwPFByb3BlcnR5S2V5LCBbYW55LCBhbnldPik6IHZvaWQge1xuICAgICAgICBjb25zdCB7IGNoYW5nZWQsIGNoYW5nZU1hcCwgYnJva2VyIH0gPSB0aGlzW19pbnRlcm5hbF07XG4gICAgICAgIGNoYW5nZU1hcC5jbGVhcigpO1xuICAgICAgICB0aGlzW19pbnRlcm5hbF0uY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBldmVudEJyb2tlciA9IGJyb2tlci5nZXQoKTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZXNdIG9mIGtleVZhbHVlKSB7XG4gICAgICAgICAgICAoZXZlbnRCcm9rZXIgYXMgYW55KS50cmlnZ2VyKGtleSwgLi4udmFsdWVzLCBrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgICAgICBldmVudEJyb2tlci50cmlnZ2VyKCdAJywgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvKiBlc2xpbnQtZGlzYWJsZVxuICAgcHJlZmVyLXJlc3QtcGFyYW1zXG4gLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gKi9cblxuaW1wb3J0IHtcbiAgICBXcml0YWJsZSxcbiAgICBpc051bWJlcixcbiAgICB2ZXJpZnksXG4gICAgcG9zdCxcbn0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiwgRXZlbnRCcm9rZXIgfSBmcm9tICdAY2RwL2V2ZW50cyc7XG5pbXBvcnQge1xuICAgIEV2ZW50QnJva2VyUHJveHksXG4gICAgX2ludGVybmFsLFxuICAgIF9ub3RpZnksXG4gICAgX3N0b2NrQ2hhbmdlLFxuICAgIF9ub3RpZnlDaGFuZ2VzLFxuICAgIHZlcmlmeU9ic2VydmFibGUsXG59IGZyb20gJy4vaW50ZXJuYWwnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZVN0YXRlLCBJT2JzZXJ2YWJsZSB9IGZyb20gJy4vY29tbW9uJztcblxuLyoqXG4gKiBAZW4gQXJyYXkgY2hhbmdlIHR5cGUgaW5mb3JtYXRpb24uIDxicj5cbiAqICAgICBUaGUgdmFsdWUgaXMgc3VpdGFibGUgZm9yIHRoZSBudW1iZXIgb2YgZmx1Y3R1YXRpb24gb2YgdGhlIGVsZW1lbnQuXG4gKiBAamEg6YWN5YiX5aSJ5pu06YCa55+l44Gu44K/44Kk44OXIDxicj5cbiAqICAgICDlgKTjga/opoHntKDjga7lopfmuJvmlbDjgavnm7jlvZNcbiAqXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIEFycmF5Q2hhbmdlVHlwZSB7XG4gICAgUkVNT1ZFID0gLTEsXG4gICAgVVBEQVRFID0gMCxcbiAgICBJTlNFUlQgPSAxLFxufVxuXG4vKipcbiAqIEBlbiBBcnJheSBjaGFuZ2UgcmVjb3JkIGluZm9ybWF0aW9uLlxuICogQGphIOmFjeWIl+WkieabtOaDheWgsVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFycmF5Q2hhbmdlUmVjb3JkPFQ+IHtcbiAgICAvKipcbiAgICAgKiBAZW4gVGhlIGNoYW5nZSB0eXBlIGluZm9ybWF0aW9uLlxuICAgICAqIEBqYSDphY3liJflpInmm7Tmg4XloLHjga7orZjliKXlrZBcbiAgICAgKi9cbiAgICByZWFkb25seSB0eXBlOiBBcnJheUNoYW5nZVR5cGU7XG5cbiAgICAvKipcbiAgICAgKiBAZW4gVGhlIGNoYW5nZSB0eXBlIGluZm9ybWF0aW9uLiA8YnI+XG4gICAgICogICAgIOKAuyBbQXR0ZW50aW9uXSBUaGUgaW5kZXggd2lsbCBiZSBkaWZmZXJlbnQgZnJvbSB0aGUgYWN0dWFsIGxvY2F0aW9uIHdoZW4gYXJyYXkgc2l6ZSBjaGFuZ2VkIGJlY2F1c2UgdGhhdCBkZXRlcm1pbmVzIGVsZW1lbnQgb3BlcmF0aW9uIHVuaXQuXG4gICAgICogQGphIOWkieabtOOBjOeZuueUn+OBl+OBn+mFjeWIl+WGheOBruS9jee9ruOBriBpbmRleCA8YnI+XG4gICAgICogICAgIOKAuyBb5rOo5oSPXSDjgqrjg5rjg6zjg7zjgrfjg6fjg7PljZjkvY3jga4gaW5kZXgg44Go44Gq44KKLCDopoHntKDjgYzlopfmuJvjgZnjgovloLTlkIjjga/lrp/pmpvjga7kvY3nva7jgajnlbDjgarjgovjgZPjgajjgYzjgYLjgotcbiAgICAgKi9cbiAgICByZWFkb25seSBpbmRleDogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogQGVuIE5ldyBlbGVtZW50J3MgdmFsdWUuXG4gICAgICogQGphIOimgee0oOOBruaWsOOBl+OBhOWApFxuICAgICAqL1xuICAgIHJlYWRvbmx5IG5ld1ZhbHVlPzogVDtcblxuICAgIC8qKlxuICAgICAqIEBlbiBPbGQgZWxlbWVudCdzIHZhbHVlLlxuICAgICAqIEBqYSDopoHntKDjga7lj6TjgYTlgKRcbiAgICAgKi9cbiAgICByZWFkb25seSBvbGRWYWx1ZT86IFQ7XG59XG50eXBlIE11dGFibGVDaGFuZ2VSZWNvcmQ8VD4gPSBXcml0YWJsZTxBcnJheUNoYW5nZVJlY29yZDxUPj47XG5cbi8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18vL1xuXG4vKiogQGludGVybmFsICovXG5pbnRlcmZhY2UgSUFycmF5Q2hhbmdlRXZlbnQ8VD4ge1xuICAgICdAJzogW0FycmF5Q2hhbmdlUmVjb3JkPFQ+W11dO1xufVxuXG4vKiogQGludGVybmFsICovXG5pbnRlcmZhY2UgSW50ZXJuYWxQcm9wczxUID0gYW55PiB7XG4gICAgc3RhdGU6IE9ic2VydmFibGVTdGF0ZTtcbiAgICBieU1ldGhvZDogYm9vbGVhbjtcbiAgICByZWNvcmRzOiBNdXRhYmxlQ2hhbmdlUmVjb3JkPFQ+W107XG4gICAgcmVhZG9ubHkgaW5kZXhlczogU2V0PG51bWJlcj47XG4gICAgcmVhZG9ubHkgYnJva2VyOiBFdmVudEJyb2tlclByb3h5PElBcnJheUNoYW5nZUV2ZW50PFQ+Pjtcbn1cblxuLyoqIEBpbnRlcm5hbCAqL1xuY29uc3QgX3Byb3h5SGFuZGxlcjogUHJveHlIYW5kbGVyPE9ic2VydmFibGVBcnJheT4gPSB7XG4gICAgZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwLCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGNvbnN0IGludGVybmFsID0gdGFyZ2V0W19pbnRlcm5hbF07XG4gICAgICAgIGlmIChPYnNlcnZhYmxlU3RhdGUuRElTQUJMRUQgPT09IGludGVybmFsLnN0YXRlIHx8IGludGVybmFsLmJ5TWV0aG9kIHx8ICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXR0cmlidXRlcywgJ3ZhbHVlJykpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcCwgYXR0cmlidXRlcyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0YXJnZXRbcF07XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gYXR0cmlidXRlcy52YWx1ZTtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGVxZXFlcVxuICAgICAgICBpZiAoJ2xlbmd0aCcgPT09IHAgJiYgbmV3VmFsdWUgIT0gb2xkVmFsdWUpIHsgLy8gRG8gTk9UIHVzZSBzdHJpY3QgaW5lcXVhbGl0eSAoIT09KVxuICAgICAgICAgICAgY29uc3Qgb2xkTGVuZ3RoID0gb2xkVmFsdWUgPj4+IDA7XG4gICAgICAgICAgICBjb25zdCBuZXdMZW5ndGggPSBuZXdWYWx1ZSA+Pj4gMDtcbiAgICAgICAgICAgIGNvbnN0IHN0b2NrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNjcmFwID0gbmV3TGVuZ3RoIDwgb2xkTGVuZ3RoICYmIHRhcmdldC5zbGljZShuZXdMZW5ndGgpO1xuICAgICAgICAgICAgICAgIGlmIChzY3JhcCkgeyAvLyBuZXdMZW5ndGggPCBvbGRMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IG9sZExlbmd0aDsgLS1pID49IG5ld0xlbmd0aDspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFtfc3RvY2tDaGFuZ2VdKEFycmF5Q2hhbmdlVHlwZS5SRU1PVkUsIGksIHVuZGVmaW5lZCwgc2NyYXBbaSAtIG5ld0xlbmd0aF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgICAgICAgICAgICAvLyBvbGRMZW5ndGggPCBuZXdMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IG9sZExlbmd0aDsgaSA8IG5ld0xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRbX3N0b2NrQ2hhbmdlXShBcnJheUNoYW5nZVR5cGUuSU5TRVJULCBpIC8qLCB1bmRlZmluZWQsIHVuZGVmaW5lZCAqLyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHAsIGF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgcmVzdWx0ICYmIHN0b2NrKCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGVsc2UgaWYgKG5ld1ZhbHVlICE9PSBvbGRWYWx1ZSAmJiBpc1ZhbGlkQXJyYXlJbmRleChwKSkge1xuICAgICAgICAgICAgY29uc3QgaSA9IHAgYXMgYW55ID4+PiAwO1xuICAgICAgICAgICAgY29uc3QgdHlwZTogQXJyYXlDaGFuZ2VUeXBlID0gTnVtYmVyKGkgPj0gdGFyZ2V0Lmxlbmd0aCk7IC8vIElOU0VSVCBvciBVUERBVEVcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IFJlZmxlY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwLCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgIHJlc3VsdCAmJiB0YXJnZXRbX3N0b2NrQ2hhbmdlXSh0eXBlLCBpLCBuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcCwgYXR0cmlidXRlcyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcCkge1xuICAgICAgICBjb25zdCBpbnRlcm5hbCA9IHRhcmdldFtfaW50ZXJuYWxdO1xuICAgICAgICBpZiAoT2JzZXJ2YWJsZVN0YXRlLkRJU0FCTEVEID09PSBpbnRlcm5hbC5zdGF0ZSB8fCBpbnRlcm5hbC5ieU1ldGhvZCB8fCAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRhcmdldCwgcCkpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0YXJnZXRbcF07XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBwKTtcbiAgICAgICAgcmVzdWx0ICYmIGlzVmFsaWRBcnJheUluZGV4KHApICYmIHRhcmdldFtfc3RvY2tDaGFuZ2VdKEFycmF5Q2hhbmdlVHlwZS5VUERBVEUsIHAgYXMgYW55ID4+PiAwLCB1bmRlZmluZWQsIG9sZFZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxufTtcbk9iamVjdC5mcmVlemUoX3Byb3h5SGFuZGxlcik7XG5cbi8qKiBAaW50ZXJuYWwgdmFsaWQgYXJyYXkgaW5kZXggaGVscGVyICovXG5mdW5jdGlvbiBpc1ZhbGlkQXJyYXlJbmRleDxUPihpbmRleDogYW55KTogYm9vbGVhbiB7XG4gICAgY29uc3QgcyA9IFN0cmluZyhpbmRleCk7XG4gICAgY29uc3QgbiA9IE1hdGgudHJ1bmMocyBhcyBhbnkpO1xuICAgIHJldHVybiBTdHJpbmcobikgPT09IHMgJiYgMCA8PSBuICYmIG4gPCAweEZGRkZGRkZGO1xufVxuXG4vKiogQGludGVybmFsIGhlbHBlciBmb3IgaW5kZXggbWFuYWdlbWVudCAqL1xuZnVuY3Rpb24gZmluZFJlbGF0ZWRDaGFuZ2VJbmRleDxUPihyZWNvcmRzOiBNdXRhYmxlQ2hhbmdlUmVjb3JkPFQ+W10sIHR5cGU6IEFycmF5Q2hhbmdlVHlwZSwgaW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gICAgY29uc3QgY2hlY2tUeXBlID0gdHlwZSA9PT0gQXJyYXlDaGFuZ2VUeXBlLklOU0VSVFxuICAgICAgICA/ICh0OiBBcnJheUNoYW5nZVR5cGUpID0+IHQgPT09IEFycmF5Q2hhbmdlVHlwZS5SRU1PVkVcbiAgICAgICAgOiAodDogQXJyYXlDaGFuZ2VUeXBlKSA9PiB0ICE9PSBBcnJheUNoYW5nZVR5cGUuUkVNT1ZFXG4gICAgICAgIDtcblxuICAgIGZvciAobGV0IGkgPSByZWNvcmRzLmxlbmd0aDsgLS1pID49IDA7KSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gcmVjb3Jkc1tpXTtcbiAgICAgICAgaWYgKHZhbHVlLmluZGV4ID09PSBpbmRleCAmJiBjaGVja1R5cGUodmFsdWUudHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlLmluZGV4IDwgaW5kZXggJiYgQm9vbGVhbih2YWx1ZS50eXBlKSkgeyAvLyBSRU1PVkUgb3IgSU5TRVJUXG4gICAgICAgICAgICBpbmRleCAtPSB2YWx1ZS50eXBlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn1cblxuLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXy8vXG5cbi8qKlxuICogQGVuIFRoZSBhcnJheSBjbGFzcyB3aGljaCBjaGFuZ2UgY2FuIGJlIG9ic2VydmVkLlxuICogQGphIOWkieabtOebo+imluWPr+iDveOBqumFjeWIl+OCr+ODqeOCuVxuICpcbiAqIEBleGFtcGxlIDxicj5cbiAqXG4gKiAtIEJhc2ljIFVzYWdlXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IG9ic0FycmF5ID0gT2JzZXJ2YWJsZUFycmF5LmZyb20oWydhJywgJ2InLCAnYyddKTtcbiAqXG4gKiBmdW5jdGlvbiBvbkNoYW5nZUFycmF5KHJlY29yZHM6IEFycmF5Q2hhbmdlUmVjb3JkW10pIHtcbiAqICAgY29uc29sZS5sb2cocmVjb3Jkcyk7XG4gKiAgIC8vICBbXG4gKiAgIC8vICAgIHsgdHlwZTogMSwgaW5kZXg6IDMsIG5ld1ZhbHVlOiAneCcsIG9sZFZhbHVlOiB1bmRlZmluZWQgfSxcbiAqICAgLy8gICAgeyB0eXBlOiAxLCBpbmRleDogNCwgbmV3VmFsdWU6ICd5Jywgb2xkVmFsdWU6IHVuZGVmaW5lZCB9LFxuICogICAvLyAgICB7IHR5cGU6IDEsIGluZGV4OiA1LCBuZXdWYWx1ZTogJ3onLCBvbGRWYWx1ZTogdW5kZWZpbmVkIH1cbiAqICAgLy8gIF1cbiAqIH1cbiAqIG9ic0FycmF5Lm9uKG9uQ2hhbmdlQXJyYXkpO1xuICpcbiAqIGZ1bmN0aW9uIGFkZFhZWigpIHtcbiAqICAgb2JzQXJyYXkucHVzaCgneCcsICd5JywgJ3onKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgT2JzZXJ2YWJsZUFycmF5PFQgPSBhbnk+IGV4dGVuZHMgQXJyYXk8VD4gaW1wbGVtZW50cyBJT2JzZXJ2YWJsZSB7XG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgW19pbnRlcm5hbF06IEludGVybmFsUHJvcHM8VD47XG5cbiAgICAvKiogQGZpbmFsIGNvbnN0cnVjdG9yICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdmVyaWZ5KCdpbnN0YW5jZU9mJywgT2JzZXJ2YWJsZUFycmF5LCB0aGlzKTtcbiAgICAgICAgY29uc3QgaW50ZXJuYWw6IEludGVybmFsUHJvcHM8VD4gPSB7XG4gICAgICAgICAgICBzdGF0ZTogT2JzZXJ2YWJsZVN0YXRlLkFDVElWRSxcbiAgICAgICAgICAgIGJ5TWV0aG9kOiBmYWxzZSxcbiAgICAgICAgICAgIHJlY29yZHM6IFtdLFxuICAgICAgICAgICAgaW5kZXhlczogbmV3IFNldCgpLFxuICAgICAgICAgICAgYnJva2VyOiBuZXcgRXZlbnRCcm9rZXJQcm94eTxJQXJyYXlDaGFuZ2VFdmVudDxUPj4oKSxcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIF9pbnRlcm5hbCwgeyB2YWx1ZTogT2JqZWN0LnNlYWwoaW50ZXJuYWwpIH0pO1xuICAgICAgICBjb25zdCBhcmdMZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBpZiAoMSA9PT0gYXJnTGVuZ3RoICYmIGlzTnVtYmVyKGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IGFyZ3VtZW50c1swXSA+Pj4gMDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzW19zdG9ja0NoYW5nZV0oQXJyYXlDaGFuZ2VUeXBlLklOU0VSVCwgaSAvKiwgdW5kZWZpbmVkICovKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICgwIDwgYXJnTGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ0xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpc1tfc3RvY2tDaGFuZ2VdKEFycmF5Q2hhbmdlVHlwZS5JTlNFUlQsIGksIGFyZ3VtZW50c1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh0aGlzLCBfcHJveHlIYW5kbGVyKTtcbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBpbXBsZW1lbnRzOiBJT2JzZXJ2YWJsZVxuXG4gICAgLyoqXG4gICAgICogQGVuIFN1YnNjcml2ZSBhcnJheSBjaGFuZ2UocykuXG4gICAgICogQGphIOmFjeWIl+WkieabtOizvOiqreioreWumlxuICAgICAqXG4gICAgICogQHBhcmFtIGxpc3RlbmVyXG4gICAgICogIC0gYGVuYCBjYWxsYmFjayBmdW5jdGlvbiBvZiB0aGUgYXJyYXkgY2hhbmdlLlxuICAgICAqICAtIGBqYWAg6YWN5YiX5aSJ5pu06YCa55+l44Kz44O844Or44OQ44OD44Kv6Zai5pWwXG4gICAgICovXG4gICAgb24obGlzdGVuZXI6IChyZWNvcmRzOiBBcnJheUNoYW5nZVJlY29yZDxUPltdKSA9PiBhbnkpOiBTdWJzY3JpcHRpb24ge1xuICAgICAgICB2ZXJpZnlPYnNlcnZhYmxlKHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpc1tfaW50ZXJuYWxdLmJyb2tlci5nZXQoKS5vbignQCcsIGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gVW5zdWJzY3JpYmUgYXJyYXkgY2hhbmdlKHMpLlxuICAgICAqIEBqYSDphY3liJflpInmm7Tos7zoqq3op6PpmaRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBsaXN0ZW5lclxuICAgICAqICAtIGBlbmAgY2FsbGJhY2sgZnVuY3Rpb24gb2YgdGhlIGFycmF5IGNoYW5nZS5cbiAgICAgKiAgICAgICAgIFdoZW4gbm90IHNldCB0aGlzIHBhcmFtZXRlciwgYWxsIHNhbWUgYGNoYW5uZWxgIGxpc3RlbmVycyBhcmUgcmVsZWFzZWQuXG4gICAgICogIC0gYGphYCDphY3liJflpInmm7TpgJrnn6XjgrPjg7zjg6vjg5Djg4Pjgq/plqLmlbBcbiAgICAgKiAgICAgICAgIOaMh+WumuOBl+OBquOBhOWgtOWQiOOBr+WQjOS4gCBgY2hhbm5lbGAg44GZ44G544Gm44KS6Kej6ZmkXG4gICAgICovXG4gICAgb2ZmKGxpc3RlbmVyPzogKHJlY29yZHM6IEFycmF5Q2hhbmdlUmVjb3JkPFQ+W10pID0+IGFueSk6IHZvaWQge1xuICAgICAgICB2ZXJpZnlPYnNlcnZhYmxlKHRoaXMpO1xuICAgICAgICB0aGlzW19pbnRlcm5hbF0uYnJva2VyLmdldCgpLm9mZignQCcsIGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gU3VzcGVuZCBvciBkaXNhYmxlIHRoZSBldmVudCBvYnNlcnZhdGlvbiBzdGF0ZS5cbiAgICAgKiBAamEg44Kk44OZ44Oz44OI6LO86Kqt54q25oWL44Gu44K144K544Oa44Oz44OJXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbm9SZWNvcmRcbiAgICAgKiAgLSBgZW5gIGB0cnVlYDogbm90IHJlY29yZGluZyBwcm9wZXJ0eSBjaGFuZ2VzIGFuZCBjbGVhciBjaGFuZ2VzLiAvIGBmYWxzZWA6IHByb3BlcnR5IGNoYW5nZXMgYXJlIHJlY29yZGVkIGFuZCBmaXJlZCB3aGVuIFtbcmVzdW1lXV0oKSBjYWxsZGVkLiAoZGVmYXVsdClcbiAgICAgKiAgLSBgamFgIGB0cnVlYDog44OX44Ot44OR44OG44Kj5aSJ5pu044KC6KiY6Yyy44Gb44GaLCDnj77lnKjjga7oqJjpjLLjgoLnoLTmo4QgLyBgZmFsc2VgOiDjg5fjg63jg5Hjg4bjgqPlpInmm7Tjga/oqJjpjLLjgZXjgowsIFtbcmVzdW1lXV0oKSDmmYLjgavnmbrngavjgZnjgosgKOaXouWumilcbiAgICAgKi9cbiAgICBzdXNwZW5kKG5vUmVjb3JkID0gZmFsc2UpOiB0aGlzIHtcbiAgICAgICAgdmVyaWZ5T2JzZXJ2YWJsZSh0aGlzKTtcbiAgICAgICAgdGhpc1tfaW50ZXJuYWxdLnN0YXRlID0gbm9SZWNvcmQgPyBPYnNlcnZhYmxlU3RhdGUuRElTQUJMRUQgOiBPYnNlcnZhYmxlU3RhdGUuU1VTRVBOREVEO1xuICAgICAgICBpZiAobm9SZWNvcmQpIHtcbiAgICAgICAgICAgIHRoaXNbX2ludGVybmFsXS5yZWNvcmRzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFJlc3VtZSBvZiB0aGUgZXZlbnQgc3Vic2NyaXB0aW9uIHN0YXRlLlxuICAgICAqIEBqYSDjgqTjg5njg7Pjg4jos7zoqq3nirbmhYvjga7jg6rjgrjjg6Xjg7zjg6BcbiAgICAgKi9cbiAgICByZXN1bWUoKTogdGhpcyB7XG4gICAgICAgIHZlcmlmeU9ic2VydmFibGUodGhpcyk7XG4gICAgICAgIGNvbnN0IGludGVybmFsID0gdGhpc1tfaW50ZXJuYWxdO1xuICAgICAgICBpZiAoT2JzZXJ2YWJsZVN0YXRlLkFDVElWRSAhPT0gaW50ZXJuYWwuc3RhdGUpIHtcbiAgICAgICAgICAgIGludGVybmFsLnN0YXRlID0gT2JzZXJ2YWJsZVN0YXRlLkFDVElWRTtcbiAgICAgICAgICAgIHBvc3QoKCkgPT4gdGhpc1tfbm90aWZ5Q2hhbmdlc10oKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIG9ic2VydmF0aW9uIHN0YXRlXG4gICAgICogQGphIOizvOiqreWPr+iDveeKtuaFi1xuICAgICAqL1xuICAgIGdldE9ic2VydmFibGVTdGF0ZSgpOiBPYnNlcnZhYmxlU3RhdGUge1xuICAgICAgICB2ZXJpZnlPYnNlcnZhYmxlKHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpc1tfaW50ZXJuYWxdLnN0YXRlO1xuICAgIH1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIG92ZXJyaWRlOiBBcnJheSBtZXRob2RzXG5cbiAgICAvKipcbiAgICAgKiBTb3J0cyBhbiBhcnJheS5cbiAgICAgKiBAcGFyYW0gY29tcGFyZUZuIFRoZSBuYW1lIG9mIHRoZSBmdW5jdGlvbiB1c2VkIHRvIGRldGVybWluZSB0aGUgb3JkZXIgb2YgdGhlIGVsZW1lbnRzLiBJZiBvbWl0dGVkLCB0aGUgZWxlbWVudHMgYXJlIHNvcnRlZCBpbiBhc2NlbmRpbmcsIEFTQ0lJIGNoYXJhY3RlciBvcmRlci5cbiAgICAgKi9cbiAgICBzb3J0KGNvbXBhcmF0b3I/OiAobGhzOiBULCByaHM6IFQpID0+IG51bWJlcik6IHRoaXMge1xuICAgICAgICB2ZXJpZnlPYnNlcnZhYmxlKHRoaXMpO1xuICAgICAgICBjb25zdCBpbnRlcm5hbCA9IHRoaXNbX2ludGVybmFsXTtcbiAgICAgICAgY29uc3Qgb2xkID0gQXJyYXkuZnJvbSh0aGlzKTtcbiAgICAgICAgaW50ZXJuYWwuYnlNZXRob2QgPSB0cnVlO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBzdXBlci5zb3J0KGNvbXBhcmF0b3IpO1xuICAgICAgICBpbnRlcm5hbC5ieU1ldGhvZCA9IGZhbHNlO1xuICAgICAgICBpZiAoT2JzZXJ2YWJsZVN0YXRlLkRJU0FCTEVEICE9PSBpbnRlcm5hbC5zdGF0ZSkge1xuICAgICAgICAgICAgY29uc3QgbGVuID0gb2xkLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IG9sZFtpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IHRoaXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlICE9PSBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW19zdG9ja0NoYW5nZV0oQXJyYXlDaGFuZ2VUeXBlLlVQREFURSwgaSwgbmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGVsZW1lbnRzIGZyb20gYW4gYXJyYXkgYW5kLCBpZiBuZWNlc3NhcnksIGluc2VydHMgbmV3IGVsZW1lbnRzIGluIHRoZWlyIHBsYWNlLCByZXR1cm5pbmcgdGhlIGRlbGV0ZWQgZWxlbWVudHMuXG4gICAgICogQHBhcmFtIHN0YXJ0IFRoZSB6ZXJvLWJhc2VkIGxvY2F0aW9uIGluIHRoZSBhcnJheSBmcm9tIHdoaWNoIHRvIHN0YXJ0IHJlbW92aW5nIGVsZW1lbnRzLlxuICAgICAqIEBwYXJhbSBkZWxldGVDb3VudCBUaGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRvIHJlbW92ZS5cbiAgICAgKi9cbiAgICBzcGxpY2Uoc3RhcnQ6IG51bWJlciwgZGVsZXRlQ291bnQ/OiBudW1iZXIpOiBPYnNlcnZhYmxlQXJyYXk8VD47XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBlbGVtZW50cyBmcm9tIGFuIGFycmF5IGFuZCwgaWYgbmVjZXNzYXJ5LCBpbnNlcnRzIG5ldyBlbGVtZW50cyBpbiB0aGVpciBwbGFjZSwgcmV0dXJuaW5nIHRoZSBkZWxldGVkIGVsZW1lbnRzLlxuICAgICAqIEBwYXJhbSBzdGFydCBUaGUgemVyby1iYXNlZCBsb2NhdGlvbiBpbiB0aGUgYXJyYXkgZnJvbSB3aGljaCB0byBzdGFydCByZW1vdmluZyBlbGVtZW50cy5cbiAgICAgKiBAcGFyYW0gZGVsZXRlQ291bnQgVGhlIG51bWJlciBvZiBlbGVtZW50cyB0byByZW1vdmUuXG4gICAgICogQHBhcmFtIGl0ZW1zIEVsZW1lbnRzIHRvIGluc2VydCBpbnRvIHRoZSBhcnJheSBpbiBwbGFjZSBvZiB0aGUgZGVsZXRlZCBlbGVtZW50cy5cbiAgICAgKi9cbiAgICBzcGxpY2Uoc3RhcnQ6IG51bWJlciwgZGVsZXRlQ291bnQ6IG51bWJlciwgLi4uaXRlbXM6IFRbXSk6IE9ic2VydmFibGVBcnJheTxUPjtcbiAgICBzcGxpY2Uoc3RhcnQ6IG51bWJlciwgZGVsZXRlQ291bnQ/OiBudW1iZXIsIC4uLml0ZW1zOiBUW10pOiBPYnNlcnZhYmxlQXJyYXk8VD4ge1xuICAgICAgICB2ZXJpZnlPYnNlcnZhYmxlKHRoaXMpO1xuICAgICAgICBjb25zdCBpbnRlcm5hbCA9IHRoaXNbX2ludGVybmFsXTtcbiAgICAgICAgY29uc3Qgb2xkTGVuID0gdGhpcy5sZW5ndGg7XG4gICAgICAgIGludGVybmFsLmJ5TWV0aG9kID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gKHN1cGVyLnNwbGljZSBhcyBhbnkpKC4uLmFyZ3VtZW50cykgYXMgT2JzZXJ2YWJsZUFycmF5PFQ+O1xuICAgICAgICBpbnRlcm5hbC5ieU1ldGhvZCA9IGZhbHNlO1xuICAgICAgICBpZiAoT2JzZXJ2YWJsZVN0YXRlLkRJU0FCTEVEICE9PSBpbnRlcm5hbC5zdGF0ZSkge1xuICAgICAgICAgICAgc3RhcnQgPSBNYXRoLnRydW5jKHN0YXJ0KTtcbiAgICAgICAgICAgIGNvbnN0IGZyb20gPSBzdGFydCA8IDAgPyBNYXRoLm1heChvbGRMZW4gKyBzdGFydCwgMCkgOiBNYXRoLm1pbihzdGFydCwgb2xkTGVuKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSByZXN1bHQubGVuZ3RoOyAtLWkgPj0gMDspIHtcbiAgICAgICAgICAgICAgICB0aGlzW19zdG9ja0NoYW5nZV0oQXJyYXlDaGFuZ2VUeXBlLlJFTU9WRSwgZnJvbSArIGksIHVuZGVmaW5lZCwgcmVzdWx0W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IGl0ZW1zLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzW19zdG9ja0NoYW5nZV0oQXJyYXlDaGFuZ2VUeXBlLklOU0VSVCwgZnJvbSArIGksIGl0ZW1zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGZpcnN0IGVsZW1lbnQgZnJvbSBhbiBhcnJheSBhbmQgcmV0dXJucyBpdC5cbiAgICAgKi9cbiAgICBzaGlmdCgpOiBUIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgdmVyaWZ5T2JzZXJ2YWJsZSh0aGlzKTtcbiAgICAgICAgY29uc3QgaW50ZXJuYWwgPSB0aGlzW19pbnRlcm5hbF07XG4gICAgICAgIGNvbnN0IG9sZExlbiA9IHRoaXMubGVuZ3RoO1xuICAgICAgICBpbnRlcm5hbC5ieU1ldGhvZCA9IHRydWU7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHN1cGVyLnNoaWZ0KCk7XG4gICAgICAgIGludGVybmFsLmJ5TWV0aG9kID0gZmFsc2U7XG4gICAgICAgIGlmIChPYnNlcnZhYmxlU3RhdGUuRElTQUJMRUQgIT09IGludGVybmFsLnN0YXRlICYmIHRoaXMubGVuZ3RoIDwgb2xkTGVuKSB7XG4gICAgICAgICAgICB0aGlzW19zdG9ja0NoYW5nZV0oQXJyYXlDaGFuZ2VUeXBlLlJFTU9WRSwgMCwgdW5kZWZpbmVkLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyBuZXcgZWxlbWVudHMgYXQgdGhlIHN0YXJ0IG9mIGFuIGFycmF5LlxuICAgICAqIEBwYXJhbSBpdGVtcyAgRWxlbWVudHMgdG8gaW5zZXJ0IGF0IHRoZSBzdGFydCBvZiB0aGUgQXJyYXkuXG4gICAgICovXG4gICAgdW5zaGlmdCguLi5pdGVtczogVFtdKTogbnVtYmVyIHtcbiAgICAgICAgdmVyaWZ5T2JzZXJ2YWJsZSh0aGlzKTtcbiAgICAgICAgY29uc3QgaW50ZXJuYWwgPSB0aGlzW19pbnRlcm5hbF07XG4gICAgICAgIGludGVybmFsLmJ5TWV0aG9kID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gc3VwZXIudW5zaGlmdCguLi5pdGVtcyk7XG4gICAgICAgIGludGVybmFsLmJ5TWV0aG9kID0gZmFsc2U7XG4gICAgICAgIGlmIChPYnNlcnZhYmxlU3RhdGUuRElTQUJMRUQgIT09IGludGVybmFsLnN0YXRlKSB7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSBpdGVtcy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpc1tfc3RvY2tDaGFuZ2VdKEFycmF5Q2hhbmdlVHlwZS5JTlNFUlQsIGksIGl0ZW1zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxzIGEgZGVmaW5lZCBjYWxsYmFjayBmdW5jdGlvbiBvbiBlYWNoIGVsZW1lbnQgb2YgYW4gYXJyYXksIGFuZCByZXR1cm5zIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIHJlc3VsdHMuXG4gICAgICogQHBhcmFtIGNhbGxiYWNrZm4gQSBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgdXAgdG8gdGhyZWUgYXJndW1lbnRzLiBUaGUgbWFwIG1ldGhvZCBjYWxscyB0aGUgY2FsbGJhY2tmbiBmdW5jdGlvbiBvbmUgdGltZSBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBhcnJheS5cbiAgICAgKiBAcGFyYW0gdGhpc0FyZyBBbiBvYmplY3QgdG8gd2hpY2ggdGhlIHRoaXMga2V5d29yZCBjYW4gcmVmZXIgaW4gdGhlIGNhbGxiYWNrZm4gZnVuY3Rpb24uIElmIHRoaXNBcmcgaXMgb21pdHRlZCwgdW5kZWZpbmVkIGlzIHVzZWQgYXMgdGhlIHRoaXMgdmFsdWUuXG4gICAgICovXG4gICAgbWFwPFU+KGNhbGxiYWNrZm46ICh2YWx1ZTogVCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IFRbXSkgPT4gVSwgdGhpc0FyZz86IGFueSk6IE9ic2VydmFibGVBcnJheTxVPiB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIFtOT1RFXSBvcmlnaW5hbCBpbXBsZW1lbnQgaXMgdmVyeSB2ZXJ5IGhpZ2gtY29zdC5cbiAgICAgICAgICogICAgICAgIHNvIGl0J3MgY29udmVydGVkIG5hdGl2ZSBBcnJheSBvbmNlLCBhbmQgcmVzdG9yZWQuXG4gICAgICAgICAqXG4gICAgICAgICAqIHJldHVybiAoc3VwZXIubWFwIGFzIGFueSkoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiBPYnNlcnZhYmxlQXJyYXkuZnJvbShbLi4udGhpc10ubWFwKGNhbGxiYWNrZm4sIHRoaXNBcmcpKTtcbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBpbXBsZW1lbnRzOiBJT2JzZXJ2YWJsZUV2ZW50QnJva2VyQWNjZXNzXG5cbiAgICAvKiogQGludGVybmFsICovXG4gICAgZ2V0QnJva2VyKCk6IEV2ZW50QnJva2VyPElBcnJheUNoYW5nZUV2ZW50PFQ+PiB7XG4gICAgICAgIGNvbnN0IHsgYnJva2VyIH0gPSB0aGlzW19pbnRlcm5hbF07XG4gICAgICAgIHJldHVybiBicm9rZXIuZ2V0KCk7XG4gICAgfVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gcHJpdmF0ZSBtZWh0b2RzOlxuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByaXZhdGUgW19zdG9ja0NoYW5nZV0odHlwZTogQXJyYXlDaGFuZ2VUeXBlLCBpbmRleDogbnVtYmVyLCBuZXdWYWx1ZT86IFQsIG9sZFZhbHVlPzogVCk6IHZvaWQge1xuICAgICAgICBjb25zdCB7IHN0YXRlLCBpbmRleGVzLCByZWNvcmRzIH0gPSB0aGlzW19pbnRlcm5hbF07XG4gICAgICAgIGNvbnN0IHJjaSA9IGluZGV4ZXMuaGFzKGluZGV4KSA/IGZpbmRSZWxhdGVkQ2hhbmdlSW5kZXgocmVjb3JkcywgdHlwZSwgaW5kZXgpIDogLTE7XG4gICAgICAgIGNvbnN0IGxlbiA9IHJlY29yZHMubGVuZ3RoO1xuICAgICAgICBpZiAocmNpID49IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHJjdCA9IHJlY29yZHNbcmNpXS50eXBlO1xuICAgICAgICAgICAgaWYgKCFyY3QgLyogVVBEQVRFICovKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldlJlY29yZCA9IHJlY29yZHMuc3BsaWNlKHJjaSwgMSlbMF07XG4gICAgICAgICAgICAgICAgLy8gVVBEQVRFID0+IFVQREFURSA6IFVQREFURVxuICAgICAgICAgICAgICAgIC8vIFVQREFURSA9PiBSRU1PVkUgOiBJTlNFUlRcbiAgICAgICAgICAgICAgICB0aGlzW19zdG9ja0NoYW5nZV0odHlwZSwgaW5kZXgsIG5ld1ZhbHVlLCBwcmV2UmVjb3JkLm9sZFZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgciwgaSA9IGxlbjsgLS1pID4gcmNpOykge1xuICAgICAgICAgICAgICAgICAgICByID0gcmVjb3Jkc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgKHIuaW5kZXggPj0gaW5kZXgpICYmIChyLmluZGV4IC09IHJjdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZSZWNvcmQgPSByZWNvcmRzLnNwbGljZShyY2ksIDEpWzBdO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlICE9PSBBcnJheUNoYW5nZVR5cGUuUkVNT1ZFKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElOU0VSVCA9PiBVUERBVEUgOiBJTlNFUlRcbiAgICAgICAgICAgICAgICAgICAgLy8gUkVNT1ZFID0+IElOU0VSVCA6IFVQREFURVxuICAgICAgICAgICAgICAgICAgICB0aGlzW19zdG9ja0NoYW5nZV0oTnVtYmVyKCF0eXBlKSwgaW5kZXgsIG5ld1ZhbHVlLCBwcmV2UmVjb3JkLm9sZFZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaW5kZXhlcy5hZGQoaW5kZXgpO1xuICAgICAgICByZWNvcmRzW2xlbl0gPSB7IHR5cGUsIGluZGV4LCBuZXdWYWx1ZSwgb2xkVmFsdWUgfTtcbiAgICAgICAgaWYgKE9ic2VydmFibGVTdGF0ZS5BQ1RJVkUgPT09IHN0YXRlICYmIDAgPT09IGxlbikge1xuICAgICAgICAgICAgcG9zdCgoKSA9PiB0aGlzW19ub3RpZnlDaGFuZ2VzXSgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcml2YXRlIFtfbm90aWZ5Q2hhbmdlc10oKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHsgc3RhdGUsIHJlY29yZHMgfSA9IHRoaXNbX2ludGVybmFsXTtcbiAgICAgICAgaWYgKE9ic2VydmFibGVTdGF0ZS5BQ1RJVkUgIT09IHN0YXRlIHx8IDAgPT09IHJlY29yZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCByIG9mIHJlY29yZHMpIHtcbiAgICAgICAgICAgIE9iamVjdC5mcmVlemUocik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpc1tfbm90aWZ5XShPYmplY3QuZnJlZXplKHJlY29yZHMpIGFzIEFycmF5Q2hhbmdlUmVjb3JkPFQ+W10pO1xuICAgICAgICB0aGlzW19pbnRlcm5hbF0ucmVjb3JkcyA9IFtdO1xuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcml2YXRlIFtfbm90aWZ5XShyZWNvcmRzOiBBcnJheUNoYW5nZVJlY29yZDxUPltdKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGludGVybmFsID0gdGhpc1tfaW50ZXJuYWxdO1xuICAgICAgICBpbnRlcm5hbC5pbmRleGVzLmNsZWFyKCk7XG4gICAgICAgIGludGVybmFsLmJyb2tlci5nZXQoKS50cmlnZ2VyKCdAJywgcmVjb3Jkcyk7XG4gICAgfVxufVxuXG4vL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fLy9cblxuLyoqXG4gKiBPdmVycmlkZSByZXR1cm4gdHlwZSBvZiBwcm90b3R5cGUgbWV0aG9kc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIE9ic2VydmFibGVBcnJheTxUPiB7XG4gICAgLyoqXG4gICAgICogQ29tYmluZXMgdHdvIG9yIG1vcmUgYXJyYXlzLlxuICAgICAqIEBwYXJhbSBpdGVtcyBBZGRpdGlvbmFsIGl0ZW1zIHRvIGFkZCB0byB0aGUgZW5kIG9mIGFycmF5MS5cbiAgICAgKi9cbiAgICBjb25jYXQoLi4uaXRlbXM6IFRbXVtdKTogT2JzZXJ2YWJsZUFycmF5PFQ+O1xuICAgIC8qKlxuICAgICAqIENvbWJpbmVzIHR3byBvciBtb3JlIGFycmF5cy5cbiAgICAgKiBAcGFyYW0gaXRlbXMgQWRkaXRpb25hbCBpdGVtcyB0byBhZGQgdG8gdGhlIGVuZCBvZiBhcnJheTEuXG4gICAgICovXG4gICAgY29uY2F0KC4uLml0ZW1zOiAoVCB8IFRbXSlbXSk6IE9ic2VydmFibGVBcnJheTxUPjtcbiAgICAvKipcbiAgICAgKiBSZXZlcnNlcyB0aGUgZWxlbWVudHMgaW4gYW4gQXJyYXkuXG4gICAgICovXG4gICAgcmV2ZXJzZSgpOiB0aGlzO1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzZWN0aW9uIG9mIGFuIGFycmF5LlxuICAgICAqIEBwYXJhbSBzdGFydCBUaGUgYmVnaW5uaW5nIG9mIHRoZSBzcGVjaWZpZWQgcG9ydGlvbiBvZiB0aGUgYXJyYXkuXG4gICAgICogQHBhcmFtIGVuZCBUaGUgZW5kIG9mIHRoZSBzcGVjaWZpZWQgcG9ydGlvbiBvZiB0aGUgYXJyYXkuXG4gICAgICovXG4gICAgc2xpY2Uoc3RhcnQ/OiBudW1iZXIsIGVuZD86IG51bWJlcik6IE9ic2VydmFibGVBcnJheTxUPjtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBlbGVtZW50cyBvZiBhbiBhcnJheSB0aGF0IG1lZXQgdGhlIGNvbmRpdGlvbiBzcGVjaWZpZWQgaW4gYSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tmbiBBIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyB1cCB0byB0aHJlZSBhcmd1bWVudHMuIFRoZSBmaWx0ZXIgbWV0aG9kIGNhbGxzIHRoZSBjYWxsYmFja2ZuIGZ1bmN0aW9uIG9uZSB0aW1lIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGFycmF5LlxuICAgICAqIEBwYXJhbSB0aGlzQXJnIEFuIG9iamVjdCB0byB3aGljaCB0aGUgdGhpcyBrZXl3b3JkIGNhbiByZWZlciBpbiB0aGUgY2FsbGJhY2tmbiBmdW5jdGlvbi4gSWYgdGhpc0FyZyBpcyBvbWl0dGVkLCB1bmRlZmluZWQgaXMgdXNlZCBhcyB0aGUgdGhpcyB2YWx1ZS5cbiAgICAgKi9cbiAgICBmaWx0ZXI8UyBleHRlbmRzIFQ+KGNhbGxiYWNrZm46ICh2YWx1ZTogVCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IFRbXSkgPT4gdmFsdWUgaXMgUywgdGhpc0FyZz86IGFueSk6IE9ic2VydmFibGVBcnJheTxTPjtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBlbGVtZW50cyBvZiBhbiBhcnJheSB0aGF0IG1lZXQgdGhlIGNvbmRpdGlvbiBzcGVjaWZpZWQgaW4gYSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tmbiBBIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyB1cCB0byB0aHJlZSBhcmd1bWVudHMuIFRoZSBmaWx0ZXIgbWV0aG9kIGNhbGxzIHRoZSBjYWxsYmFja2ZuIGZ1bmN0aW9uIG9uZSB0aW1lIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGFycmF5LlxuICAgICAqIEBwYXJhbSB0aGlzQXJnIEFuIG9iamVjdCB0byB3aGljaCB0aGUgdGhpcyBrZXl3b3JkIGNhbiByZWZlciBpbiB0aGUgY2FsbGJhY2tmbiBmdW5jdGlvbi4gSWYgdGhpc0FyZyBpcyBvbWl0dGVkLCB1bmRlZmluZWQgaXMgdXNlZCBhcyB0aGUgdGhpcyB2YWx1ZS5cbiAgICAgKi9cbiAgICBmaWx0ZXIoY2FsbGJhY2tmbjogKHZhbHVlOiBULCBpbmRleDogbnVtYmVyLCBhcnJheTogVFtdKSA9PiBhbnksIHRoaXNBcmc/OiBhbnkpOiBPYnNlcnZhYmxlQXJyYXk8VD47XG59XG5cbi8qKlxuICogT3ZlcnJpZGUgcmV0dXJuIHR5cGUgb2Ygc3RhdGljIG1ldGhvZHNcbiAqL1xuZXhwb3J0IGRlY2xhcmUgbmFtZXNwYWNlIE9ic2VydmFibGVBcnJheSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5hbWVzcGFjZVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgZnJvbSBhbiBhcnJheS1saWtlIG9iamVjdC5cbiAgICAgKiBAcGFyYW0gYXJyYXlMaWtlIEFuIGFycmF5LWxpa2Ugb3IgaXRlcmFibGUgb2JqZWN0IHRvIGNvbnZlcnQgdG8gYW4gYXJyYXkuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZnJvbTxUPihhcnJheUxpa2U6IEFycmF5TGlrZTxUPiB8IEl0ZXJhYmxlPFQ+KTogT2JzZXJ2YWJsZUFycmF5PFQ+O1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgZnJvbSBhbiBhcnJheS1saWtlIG9iamVjdC5cbiAgICAgKiBAcGFyYW0gYXJyYXlMaWtlIEFuIGFycmF5LWxpa2Ugb3IgaXRlcmFibGUgb2JqZWN0IHRvIGNvbnZlcnQgdG8gYW4gYXJyYXkuXG4gICAgICogQHBhcmFtIG1hcGZuIEEgbWFwcGluZyBmdW5jdGlvbiB0byBjYWxsIG9uIGV2ZXJ5IGVsZW1lbnQgb2YgdGhlIGFycmF5LlxuICAgICAqIEBwYXJhbSB0aGlzQXJnIFZhbHVlIG9mICd0aGlzJyB1c2VkIHRvIGludm9rZSB0aGUgbWFwZm4uXG4gICAgICovXG4gICAgZnVuY3Rpb24gZnJvbTxULCBVPihhcnJheUxpa2U6IEFycmF5TGlrZTxUPiB8IEl0ZXJhYmxlPFQ+LCBtYXBmbjogKHRoaXM6IHZvaWQsIHY6IFQsIGs6IG51bWJlcikgPT4gVSwgdGhpc0FyZz86IHVuZGVmaW5lZCk6IE9ic2VydmFibGVBcnJheTxVPjtcbiAgICBmdW5jdGlvbiBmcm9tPFgsIFQsIFU+KGFycmF5TGlrZTogQXJyYXlMaWtlPFQ+IHwgSXRlcmFibGU8VD4sIG1hcGZuOiAodGhpczogWCwgdjogVCwgazogbnVtYmVyKSA9PiBVLCB0aGlzQXJnOiBYKTogT2JzZXJ2YWJsZUFycmF5PFU+O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBuZXcgYXJyYXkgZnJvbSBhIHNldCBvZiBlbGVtZW50cy5cbiAgICAgKiBAcGFyYW0gaXRlbXMgQSBzZXQgb2YgZWxlbWVudHMgdG8gaW5jbHVkZSBpbiB0aGUgbmV3IGFycmF5IG9iamVjdC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBvZjxUPiguLi5pdGVtczogVFtdKTogT2JzZXJ2YWJsZUFycmF5PFQ+O1xufVxuIiwiLyogZXNsaW50LWRpc2FibGVcbiAgIG5vLWlubmVyLWRlY2xhcmF0aW9uc1xuICwgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5hbWVzcGFjZVxuICwgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gKi9cblxuLypcbiAqIE5PVEU6IOWGhemDqOODouOCuOODpeODvOODq+OBqyBgQ0RQYCBuYW1lc3BhY2Ug44KS5L2/55So44GX44Gm44GX44G+44GG44GoLCDlpJbpg6jjg6Ljgrjjg6Xjg7zjg6vjgafjga/lrqPoqIDjgafjgY3jgarjgY/jgarjgosuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzk2MTFcbiAqL1xubmFtZXNwYWNlIENEUF9ERUNMQVJFIHtcblxuICAgIC8qKlxuICAgICAqIEBlbiBDb25zdGFudCBkZWZpbml0aW9uIGFib3V0IHJhbmdlIG9mIHRoZSByZXN1bHQgY29kZS5cbiAgICAgKiBAamEg44Oq44K244Or44OI44Kz44O844OJ44Gu56+E5Zuy44Gr6Zai44GZ44KL5a6a5pWw5a6a576pXG4gICAgICovXG4gICAgZXhwb3J0IGNvbnN0IGVudW0gUkVTVUxUX0NPREVfUkFOR0Uge1xuICAgICAgICAvKipcbiAgICAgICAgICogQGVuIFRoZSBhc3NpZ25hYmxlIHJhbmdlIGZvciB0aGUgY2xpZW50J3MgbG9jYWwgcmVzdWx0IGNvcmQgYnkgd2hpY2ggZXhwYW5zaW9uIGlzIHBvc3NpYmxlLlxuICAgICAgICAgKiBAamEg44Kv44Op44Kk44Ki44Oz44OI44GM5ouh5by15Y+v6IO944Gq44Ot44O844Kr44Or44Oq44K244Or44OI44Kz44O844OJ44Gu44Ki44K144Kk44Oz5Y+v6IO96aCY5Z+fXG4gICAgICAgICAqL1xuICAgICAgICBNQVggPSAxMDAwLFxuICAgICAgICAvKipcbiAgICAgICAgICogQGVuIFJlc2VydmVkIHJhbmdlIG9mIGZyYW1ld29yay5cbiAgICAgICAgICogQGphIOODleODrOODvOODoOODr+ODvOOCr+OBruS6iOe0hOmgmOWfn1xuICAgICAgICAgKi9cbiAgICAgICAgUkVTRVJWRUQgPSAxMDAwLFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBUaGUgYXNzaWdubWVudCByYW5nZSBndWlkZWxpbmUgZGVmaW5pdGlvbiB1c2VkIGluIHRoZSBtb2R1bGUuXG4gICAgICogQGphIOODouOCuOODpeODvOODq+WGheOBp+S9v+eUqOOBmeOCi+OCouOCteOCpOODs+mgmOWfn+OCrOOCpOODieODqeOCpOODs+WumuaVsOWumue+qVxuICAgICAqL1xuICAgIGV4cG9ydCBjb25zdCBlbnVtIExPQ0FMX0NPREVfUkFOR0VfR1VJREUge1xuICAgICAgICAvKipcbiAgICAgICAgICogQGVuIFRoZSBhc3NpZ25tZW50IHJhbmdlIGd1aWRlbGluZSBwZXIgMSBtb2R1bGUuXG4gICAgICAgICAqIEBqYSAx44Oi44K444Ol44O844Or5b2T44Gf44KK44Gr5Ymy44KK5b2T44Gm44KL44Ki44K144Kk44Oz6aCY5Z+f44Ks44Kk44OJ44Op44Kk44OzXG4gICAgICAgICAqL1xuICAgICAgICBNT0RVTEUgPSAxMDAsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAZW4gVGhlIGFzc2lnbm1lbnQgcmFuZ2UgZ3VpZGVsaW5lIHBlciAxIGZ1bmN0aW9uLlxuICAgICAgICAgKiBAamEgMeapn+iDveW9k+OBn+OCiuOBq+WJsuOCiuW9k+OBpuOCi+OCouOCteOCpOODs+mgmOWfn+OCrOOCpOODieODqeOCpOODs1xuICAgICAgICAgKi9cbiAgICAgICAgRlVOQ1RJT04gPSAyMCxcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gT2Zmc2V0IHZhbHVlIGVudW1lcmF0aW9uIGZvciBbW1JFU1VMVF9DT0RFXV0uIDxicj5cbiAgICAgKiAgICAgVGhlIGNsaWVudCBjYW4gZXhwYW5kIGEgZGVmaW5pdGlvbiBpbiBvdGhlciBtb2R1bGUuXG4gICAgICogQGphIFtbUkVTVUxUX0NPREVdXSDjga7jgqrjg5Xjgrvjg4Pjg4jlgKQgPGJyPlxuICAgICAqICAgICDjgqjjg6njg7zjgrPjg7zjg4nlr77lv5zjgZnjgovjg6Ljgrjjg6Xjg7zjg6vlhoXjgacg5a6a576p44KS5ouh5by144GZ44KLLlxuICAgICAqXG4gICAgICogQGV4YW1wbGUgPGJyPlxuICAgICAqXG4gICAgICogYGBgdHNcbiAgICAgKiAgY29uc3QgZW51bSBMT0NBTF9DT0RFX0JBU0Uge1xuICAgICAqICAgICAgQ09NTU9OICAgICAgPSAwLFxuICAgICAqICAgICAgU09NRU1PRFVMRSAgPSAxICogTE9DQUxfQ09ERV9SQU5HRV9HVUlERS5GVU5DVElPTixcbiAgICAgKiAgICAgIFNPTUVNT0RVTEUyID0gMiAqIExPQ0FMX0NPREVfUkFOR0VfR1VJREUuRlVOQ1RJT04sXG4gICAgICogIH1cbiAgICAgKlxuICAgICAqICBleHBvcnQgZW51bSBSRVNVTFRfQ09ERSB7XG4gICAgICogICAgICBTT01FTU9EVUxFX0RFQ0xBUkUgICAgICAgICAgID0gUkVTVUxUX0NPREVfQkFTRS5ERUNMQVJFLCAvLyBmb3IgYXZvaWQgVFMyNDMyLlxuICAgICAqICAgICAgRVJST1JfU09NRU1PRFVMRV9VTkVYUEVDVEVEICA9IERFQ0xBUkVfRVJST1JfQ09ERShSRVNVTFRfQ09ERV9CQVNFLlNPTUVNT0RVTEUsIExPQ0FMX0NPREVfQkFTRS5TT01FTU9EVUxFICsgMSwgXCJlcnJvciB1bmV4cGVjdGVkLlwiKSxcbiAgICAgKiAgICAgIEVSUk9SX1NPTUVNT0RVTEVfSU5WQUxJRF9BUkcgPSBERUNMQVJFX0VSUk9SX0NPREUoUkVTVUxUX0NPREVfQkFTRS5TT01FTU9EVUxFLCBMT0NBTF9DT0RFX0JBU0UuU09NRU1PRFVMRSArIDIsIFwiaW52YWxpZCBhcmd1bWVudHMuXCIpLFxuICAgICAqICB9XG4gICAgICogIEFTU0lHTl9SRVNVTFRfQ09ERShSRVNVTFRfQ09ERSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgZXhwb3J0IGNvbnN0IGVudW0gUkVTVUxUX0NPREVfQkFTRSB7XG4gICAgICAgIERFQ0xBUkUgPSA5MDA3MTk5MjU0NzQwOTkxLCAvLyBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUlxuICAgICAgICBDT01NT04gID0gMCxcbiAgICAgICAgQ0RQICAgICA9IDEgKiBMT0NBTF9DT0RFX1JBTkdFX0dVSURFLk1PRFVMRSwgLy8gY2RwIHJlc2VydmVkLiBhYnMoMCDvvZ4gMTAwMClcbi8vICAgICAgTU9EVUxFX0EgPSAxICogUkVTVUxUX0NPREVfUkFOR0UuTUFYLCAgICAvLyBleCkgbW9kdWxlQTogYWJzKDEwMDEg772eIDE5OTkpXG4vLyAgICAgIE1PRFVMRV9CID0gMiAqIFJFU1VMVF9DT0RFX1JBTkdFLk1BWCwgICAgLy8gZXgpIG1vZHVsZUI6IGFicygyMDAxIO+9niAyOTk5KVxuLy8gICAgICBNT0RVTEVfQyA9IDMgKiBSRVNVTFRfQ09ERV9SQU5HRS5NQVgsICAgIC8vIGV4KSBtb2R1bGVDOiBhYnMoMzAwMSDvvZ4gMzk5OSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gS25vd24gQ0RQIG1vZHVsZSBvZmZlc3QgZGVmaW5pdGlvbi5cbiAgICAgKiBAamEg566h6L2E44GX44Gm44GE44KLIENEUCDjg6Ljgrjjg6Xjg7zjg6vjga7jgqrjg5Xjgrvjg4Pjg4jlrprnvqlcbiAgICAgKlxuICAgICAqIEBleGFtcGxlIDxicj5cbiAgICAgKlxuICAgICAqIGBgYHRzXG4gICAgICogY29uc3QgZW51bSBMT0NBTF9DT0RFX0JBU0Uge1xuICAgICAqICAgIEFKQVggPSBDRFBfS05PV05fTU9EVUxFLkFKQVggKiBMT0NBTF9DT0RFX1JBTkdFX0dVSURFLkZVTkNUSU9OLFxuICAgICAqIH1cbiAgICAgKlxuICAgICAqIGV4cG9ydCBlbnVtIFJFU1VMVF9DT0RFIHtcbiAgICAgKiAgIEFKQVhfREVDTEFSRSAgICAgICAgPSBSRVNVTFRfQ09ERV9CQVNFLkRFQ0xBUkUsXG4gICAgICogICBFUlJPUl9BSkFYX1JFU1BPTlNFID0gREVDTEFSRV9FUlJPUl9DT0RFKFJFU1VMVF9DT0RFX0JBU0UuQ0RQLCBMT0NBTF9DT0RFX0JBU0UuQUpBWCArIDEsICduZXR3b3JrIGVycm9yLicpLFxuICAgICAqICAgRVJST1JfQUpBWF9USU1FT1VUICA9IERFQ0xBUkVfRVJST1JfQ09ERShSRVNVTFRfQ09ERV9CQVNFLkNEUCwgTE9DQUxfQ09ERV9CQVNFLkFKQVggKyAyLCAncmVxdWVzdCB0aW1lb3V0LicpLFxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBleHBvcnQgY29uc3QgZW51bSBDRFBfS05PV05fTU9EVUxFIHtcbiAgICAgICAgLyoqIGBAY2RwL2FqYXhgICovXG4gICAgICAgIEFKQVggPSAxLFxuICAgICAgICAvKiogYEBjZHAvaTE4bmAgKi9cbiAgICAgICAgSTE4TiA9IDIsXG4gICAgICAgIC8qKiBgQGNkcC9kYXRhLXN5bmNgLCBgQGNkcC9tb2RlbGAgKi9cbiAgICAgICAgTVZDICA9IDMsXG4gICAgICAgIC8qKiBvZmZzZXQgZm9yIHVua25vd24gbW9kdWxlICovXG4gICAgICAgIE9GRlNFVCxcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQ29tbW9uIHJlc3VsdCBjb2RlIGZvciB0aGUgYXBwbGljYXRpb24uXG4gICAgICogQGphIOOCouODl+ODquOCseODvOOCt+ODp+ODs+WFqOS9k+OBp+S9v+eUqOOBmeOCi+WFsemAmuOCqOODqeODvOOCs+ODvOODieWumue+qVxuICAgICAqL1xuICAgIGV4cG9ydCBlbnVtIFJFU1VMVF9DT0RFIHtcbiAgICAgICAgLyoqIGBlbmAgZ2VuZXJhbCBzdWNjZXNzIGNvZGUgICAgICAgICAgICAgPGJyPiBgamFgIOaxjueUqOaIkOWKn+OCs+ODvOODiSAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgU1VDQ0VTUyA9IDAsXG4gICAgICAgIC8qKiBgZW5gIGdlbmVyYWwgY2FuY2VsIGNvZGUgICAgICAgICAgICAgIDxicj4gYGphYCDmsY7nlKjjgq3jg6Pjg7Pjgrvjg6vjgrPjg7zjg4kgICAgICAgICAgICAgICAgICovXG4gICAgICAgIEFCT1JUID0gMSxcbiAgICAgICAgLyoqIGBlbmAgZ2VuZXJhbCBwZW5kaW5nIGNvZGUgICAgICAgICAgICAgPGJyPiBgamFgIOaxjueUqOOCquODmuODrOODvOOCt+ODp+ODs+acquWun+ihjOOCqOODqeODvOOCs+ODvOODiSAqL1xuICAgICAgICBQRU5ESU5HID0gMixcbiAgICAgICAgLyoqIGBlbmAgZ2VuZXJhbCBzdWNjZXNzIGJ1dCBub29wIGNvZGUgICAgPGJyPiBgamFgIOaxjueUqOWun+ihjOS4jeimgeOCs+ODvOODiSAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICBOT09QID0gMyxcbiAgICAgICAgLyoqIGBlbmAgZ2VuZXJhbCBlcnJvciBjb2RlICAgICAgICAgICAgICAgPGJyPiBgamFgIOaxjueUqOOCqOODqeODvOOCs+ODvOODiSAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgIEZBSUwgPSAtMSxcbiAgICAgICAgLyoqIGBlbmAgZ2VuZXJhbCBmYXRhbCBlcnJvciBjb2RlICAgICAgICAgPGJyPiBgamFgIOaxjueUqOiHtOWRveeahOOCqOODqeODvOOCs+ODvOODiSAgICAgICAgICAgICAgICovXG4gICAgICAgIEZBVEFMID0gLTIsXG4gICAgICAgIC8qKiBgZW5gIGdlbmVyYWwgbm90IHN1cHBvcnRlZCBlcnJvciBjb2RlIDxicj4gYGphYCDmsY7nlKjjgqrjg5rjg6zjg7zjgrfjg6fjg7Pjgqjjg6njg7zjgrPjg7zjg4kgICAgICAgKi9cbiAgICAgICAgTk9UX1NVUFBPUlRFRCA9IC0zLFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBBc3NpZ24gZGVjbGFyZWQgW1tSRVNVTFRfQ09ERV1dIHRvIHJvb3QgZW51bWVyYXRpb24uXG4gICAgICogICAgIChJdCdzIGVuYWJsZSB0byBtZXJnZSBlbnVtIGluIHRoZSBtb2R1bGUgc3lzdGVtIGVudmlyb25tZW50LilcbiAgICAgKiBAamEg5ouh5by144GX44GfIFtbUkVTVUxUX0NPREVdXSDjgpIg44Or44O844OIIGVudW0g44Gr44Ki44K144Kk44OzXG4gICAgICogICAgIOODouOCuOODpeODvOODq+OCt+OCueODhuODoOeSsOWig+OBq+OBiuOBhOOBpuOCguOAgWVudW0g44KS44Oe44O844K444KS5Y+v6IO944Gr44GZ44KLXG4gICAgICovXG4gICAgZXhwb3J0IGZ1bmN0aW9uIEFTU0lHTl9SRVNVTFRfQ09ERShleHRlbmQ6IG9iamVjdCk6IHZvaWQge1xuICAgICAgICBPYmplY3QuYXNzaWduKFJFU1VMVF9DT0RFLCBleHRlbmQpO1xuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBjb25zdCBfY29kZTJtZXNzYWdlOiB7IFtjb2RlOiBzdHJpbmddOiBzdHJpbmc7IH0gPSB7XG4gICAgICAgICcwJzogJ29wZXJhdGlvbiBzdWNjZWVkZWQuJyxcbiAgICAgICAgJzEnOiAnb3BlcmF0aW9uIGFib3J0ZWQuJyxcbiAgICAgICAgJzInOiAnb3BlcmF0aW9uIHBlbmRpbmcuJyxcbiAgICAgICAgJzMnOiAnbm8gb3BlcmF0aW9uLicsXG4gICAgICAgICctMSc6ICdvcGVyYXRpb24gZmFpbGVkLicsXG4gICAgICAgICctMic6ICd1bmV4cGVjdGVkIGVycm9yIG9jY3VyZWQuJyxcbiAgICAgICAgJy0zJzogJ29wZXJhdGlvbiBub3Qgc3VwcG9ydGVkLicsXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBlbiBBY2Nlc3MgdG8gZXJyb3IgbWVzc2FnZSBtYXAuXG4gICAgICogQGphIOOCqOODqeODvOODoeODg+OCu+ODvOOCuOODnuODg+ODl+OBruWPluW+l1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgZXhwb3J0IGZ1bmN0aW9uIEVSUk9SX01FU1NBR0VfTUFQKCk6IHsgW2NvZGU6IHN0cmluZ106IHN0cmluZzsgfSB7XG4gICAgICAgIHJldHVybiBfY29kZTJtZXNzYWdlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBHZW5lcmF0ZSBzdWNjZXNzIGNvZGUuXG4gICAgICogQGphIOaIkOWKn+OCs+ODvOODieOCkueUn+aIkFxuICAgICAqXG4gICAgICogQHBhcmFtIGJhc2VcbiAgICAgKiAgLSBgZW5gIHNldCBiYXNlIG9mZnNldCBhcyBbW1JFU1VMVF9DT0RFX0JBU0VdXVxuICAgICAqICAtIGBqYWAg44Kq44OV44K744OD44OI5YCk44KSIFtbUkVTVUxUX0NPREVfQkFTRV1dIOOBqOOBl+OBpuaMh+WumlxuICAgICAqIEBwYXJhbSBjb2RlXG4gICAgICogIC0gYGVuYCBzZXQgbG9jYWwgY29kZSBmb3IgZGVjbGFyYXRpb24uIGV4KSAnMSdcbiAgICAgKiAgLSBgamFgIOWuo+iogOeUqOOBruODreODvOOCq+ODq+OCs+ODvOODieWApOOCkuaMh+WumiAg5L6LKSAnMSdcbiAgICAgKiBAcGFyYW0gbWVzc2FnZVxuICAgICAqICAtIGBlbmAgc2V0IGVycm9yIG1lc3NhZ2UgZm9yIGhlbHAgc3RyaW5nLlxuICAgICAqICAtIGBqYWAg44OY44Or44OX44K544OI44Oq44Oz44Kw55So44Ko44Op44O844Oh44OD44K744O844K444KS5oyH5a6aXG4gICAgICovXG4gICAgZXhwb3J0IGZ1bmN0aW9uIERFQ0xBUkVfU1VDQ0VTU19DT0RFKGJhc2U6IFJFU1VMVF9DT0RFX0JBU0UsIGNvZGU6IG51bWJlciwgbWVzc2FnZT86IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBkZWNsYXJlUmVzdWx0Q29kZShiYXNlLCBjb2RlLCBtZXNzYWdlLCB0cnVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gR2VuZXJhdGUgZXJyb3IgY29kZS5cbiAgICAgKiBAamEg44Ko44Op44O844Kz44O844OJ55Sf5oiQXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYmFzZVxuICAgICAqICAtIGBlbmAgc2V0IGJhc2Ugb2Zmc2V0IGFzIFtbUkVTVUxUX0NPREVfQkFTRV1dXG4gICAgICogIC0gYGphYCDjgqrjg5Xjgrvjg4Pjg4jlgKTjgpIgW1tSRVNVTFRfQ09ERV9CQVNFXV0g44Go44GX44Gm5oyH5a6aXG4gICAgICogQHBhcmFtIGNvZGVcbiAgICAgKiAgLSBgZW5gIHNldCBsb2NhbCBjb2RlIGZvciBkZWNsYXJhdGlvbi4gZXgpICcxJ1xuICAgICAqICAtIGBqYWAg5a6j6KiA55So44Gu44Ot44O844Kr44Or44Kz44O844OJ5YCk44KS5oyH5a6aICDkvospICcxJ1xuICAgICAqIEBwYXJhbSBtZXNzYWdlXG4gICAgICogIC0gYGVuYCBzZXQgZXJyb3IgbWVzc2FnZSBmb3IgaGVscCBzdHJpbmcuXG4gICAgICogIC0gYGphYCDjg5jjg6vjg5fjgrnjg4jjg6rjg7PjgrDnlKjjgqjjg6njg7zjg6Hjg4Pjgrvjg7zjgrjjgpLmjIflrppcbiAgICAgKi9cbiAgICBleHBvcnQgZnVuY3Rpb24gREVDTEFSRV9FUlJPUl9DT0RFKGJhc2U6IFJFU1VMVF9DT0RFX0JBU0UsIGNvZGU6IG51bWJlciwgbWVzc2FnZT86IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBkZWNsYXJlUmVzdWx0Q29kZShiYXNlLCBjb2RlLCBtZXNzYWdlLCBmYWxzZSk7XG4gICAgfVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gcHJpdmF0ZSBzZWN0aW9uOlxuXG4gICAgLyoqIEBpbnRlcm5hbCByZWdpc3RlciBmb3IgW1tSRVNVTFRfQ09ERV1dICovXG4gICAgZnVuY3Rpb24gZGVjbGFyZVJlc3VsdENvZGUoYmFzZTogUkVTVUxUX0NPREVfQkFTRSwgY29kZTogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsIHN1Y2NlZWRlZDogYm9vbGVhbik6IG51bWJlciB8IG5ldmVyIHtcbiAgICAgICAgaWYgKGNvZGUgPCAwIHx8IFJFU1VMVF9DT0RFX1JBTkdFLk1BWCA8PSBjb2RlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgZGVjbGFyZVJlc3VsdENvZGUoKSwgaW52YWxpZCBsb2NhbC1jb2RlIHJhbmdlLiBbY29kZTogJHtjb2RlfV1gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzaWduZWQgPSBzdWNjZWVkZWQgPyAxIDogLTE7XG4gICAgICAgIGNvbnN0IHJlc3VsdENvZGUgPSBzaWduZWQgKiAoYmFzZSBhcyBudW1iZXIgKyBjb2RlKTtcbiAgICAgICAgX2NvZGUybWVzc2FnZVtyZXN1bHRDb2RlXSA9IG1lc3NhZ2UgPyBtZXNzYWdlIDogKGBbQ09ERTogJHtyZXN1bHRDb2RlfV1gKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdENvZGU7XG4gICAgfVxufVxuIiwiaW1wb3J0IFJFU1VMVF9DT0RFICAgICAgICAgICAgICA9IENEUF9ERUNMQVJFLlJFU1VMVF9DT0RFO1xuaW1wb3J0IFJFU1VMVF9DT0RFX0JBU0UgICAgICAgICA9IENEUF9ERUNMQVJFLlJFU1VMVF9DT0RFX0JBU0U7XG5pbXBvcnQgUkVTVUxUX0NPREVfUkFOR0UgICAgICAgID0gQ0RQX0RFQ0xBUkUuUkVTVUxUX0NPREVfUkFOR0U7XG5pbXBvcnQgTE9DQUxfQ09ERV9SQU5HRV9HVUlERSAgID0gQ0RQX0RFQ0xBUkUuTE9DQUxfQ09ERV9SQU5HRV9HVUlERTtcbmltcG9ydCBERUNMQVJFX1NVQ0NFU1NfQ09ERSAgICAgPSBDRFBfREVDTEFSRS5ERUNMQVJFX1NVQ0NFU1NfQ09ERTtcbmltcG9ydCBERUNMQVJFX0VSUk9SX0NPREUgICAgICAgPSBDRFBfREVDTEFSRS5ERUNMQVJFX0VSUk9SX0NPREU7XG5pbXBvcnQgQVNTSUdOX1JFU1VMVF9DT0RFICAgICAgID0gQ0RQX0RFQ0xBUkUuQVNTSUdOX1JFU1VMVF9DT0RFO1xuaW1wb3J0IEVSUk9SX01FU1NBR0VfTUFQICAgICAgICA9IENEUF9ERUNMQVJFLkVSUk9SX01FU1NBR0VfTUFQO1xuXG5jb25zdCBlbnVtIERlc2NyaXB0aW9uIHtcbiAgICBVTktOT1dOX0VSUk9SX05BTUUgPSdVTktOT1dOJyxcbn1cblxuZXhwb3J0IHtcbiAgICBSRVNVTFRfQ09ERSxcbiAgICBSRVNVTFRfQ09ERV9CQVNFLFxuICAgIFJFU1VMVF9DT0RFX1JBTkdFLFxuICAgIExPQ0FMX0NPREVfUkFOR0VfR1VJREUsXG4gICAgREVDTEFSRV9TVUNDRVNTX0NPREUsXG4gICAgREVDTEFSRV9FUlJPUl9DT0RFLFxuICAgIEFTU0lHTl9SRVNVTFRfQ09ERSxcbn07XG5cbi8qKlxuICogQGVuIEp1ZGdlIGZhaWwgb3Igbm90LlxuICogQGphIOWkseaVl+WIpOWumlxuICpcbiAqIEBwYXJhbSBjb2RlIFtbUkVTVUxUX0NPREVdXVxuICogQHJldHVybnMgdHJ1ZTogZmFpbCByZXN1bHQgLyBmYWxzZTogc3VjY2VzcyByZXN1bHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZBSUxFRChjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gY29kZSA8IDA7XG59XG5cbi8qKlxuICogQGVuIEp1ZGdlIHN1Y2Nlc3Mgb3Igbm90LlxuICogQGphIOaIkOWKn+WIpOWumlxuICpcbiAqIEBwYXJhbSBjb2RlIFtbUkVTVUxUX0NPREVdXVxuICogQHJldHVybnMgdHJ1ZTogc3VjY2VzcyByZXN1bHQgLyBmYWxzZTogZmFpbCByZXN1bHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNVQ0NFRURFRChjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIUZBSUxFRChjb2RlKTtcbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydCB0byBbW1JFU1VMVF9DT0RFXV0gYG5hbWVgIHN0cmluZyBmcm9tIFtbUkVTVUxUX0NPREVdXS5cbiAqIEBqYSBbW1JFU1VMVF9DT0RFXV0g44KSIFtbUkVTVUxUX0NPREVdXSDmloflrZfliJfjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gY29kZSBbW1JFU1VMVF9DT0RFXV1cbiAqIEBwYXJhbSB0YWcgIGN1c3RvbSB0YWcgaWYgbmVlZGVkLlxuICogQHJldHVybnMgbmFtZSBzdHJpbmcgZXgpIFwiW3RhZ11bTk9UX1NVUFBPUlRFRF1cIlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9OYW1lU3RyaW5nKGNvZGU6IG51bWJlciwgdGFnPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBwcmVmaXggPSB0YWcgPyBgWyR7dGFnfV1gIDogJyc7XG4gICAgaWYgKFJFU1VMVF9DT0RFW2NvZGVdKSB7XG4gICAgICAgIHJldHVybiBgJHtwcmVmaXh9WyR7UkVTVUxUX0NPREVbY29kZV19XWA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGAke3ByZWZpeH1bJHtEZXNjcmlwdGlvbi5VTktOT1dOX0VSUk9SX05BTUV9XWA7XG4gICAgfVxufVxuXG4vKipcbiAqIEBlbiBDb252ZXJ0IHRvIGhlbHAgc3RyaW5nIGZyb20gW1tSRVNVTFRfQ09ERV1dLlxuICogQGphIFtbUkVTVUxUX0NPREVdXSDjgpLjg5jjg6vjg5fjgrnjg4jjg6rjg7PjgrDjgavlpInmj5tcbiAqXG4gKiBAcGFyYW0gY29kZSBbW1JFU1VMVF9DT0RFXV1cbiAqIEByZXR1cm5zIHJlZ2lzdGVyZWQgaGVscCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvSGVscFN0cmluZyhjb2RlOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IG1hcCA9IEVSUk9SX01FU1NBR0VfTUFQKCk7XG4gICAgaWYgKG1hcFtjb2RlXSkge1xuICAgICAgICByZXR1cm4gbWFwW2NvZGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBgdW5yZWdpc3RlcmVkIHJlc3VsdCBjb2RlLiBbY29kZTogJHtjb2RlfV1gO1xuICAgIH1cbn1cbiIsIi8qIGVzbGludC1kaXNhYmxlXG4gICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gKi9cblxuaW1wb3J0IHtcbiAgICBjbGFzc05hbWUsXG4gICAgaXNOaWwsXG4gICAgaXNTdHJpbmcsXG4gICAgaXNDaGFuY2VsTGlrZUVycm9yLFxufSBmcm9tICdAY2RwL2NvcmUtdXRpbHMnO1xuaW1wb3J0IHtcbiAgICBSRVNVTFRfQ09ERSxcbiAgICBTVUNDRUVERUQsXG4gICAgRkFJTEVELFxuICAgIHRvTmFtZVN0cmluZyxcbiAgICB0b0hlbHBTdHJpbmcsXG59IGZyb20gJy4vcmVzdWx0LWNvZGUnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3VuYm91bmQtbWV0aG9kICovXG5jb25zdCBpc051bWJlciA9IE51bWJlci5pc0Zpbml0ZTtcblxuY29uc3QgZW51bSBUYWcge1xuICAgIEVSUk9SICA9ICdFcnJvcicsXG4gICAgUkVTVUxUID0gJ1Jlc3VsdCcsXG59XG5cbi8qKlxuICogQGVuIEEgcmVzdWx0IGhvbGRlciBjbGFzcy4gPGJyPlxuICogICAgIERlcml2ZWQgbmF0aXZlIGBFcnJvcmAgY2xhc3MuXG4gKiBAamEg5Yem55CG57WQ5p6c5Lyd6YGU44Kv44Op44K5IDxicj5cbiAqICAgICDjg43jgqTjg4bjgqPjg5YgYEVycm9yYCDjga7mtL7nlJ/jgq/jg6njgrlcbiAqL1xuZXhwb3J0IGNsYXNzIFJlc3VsdCBleHRlbmRzIEVycm9yIHtcblxuICAgIC8qKlxuICAgICAqIGNvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY29kZVxuICAgICAqICAtIGBlbmAgcmVzdWx0IGNvZGVcbiAgICAgKiAgLSBgamFgIOe1kOaenOOCs+ODvOODiVxuICAgICAqIEBwYXJhbSBtZXNzYWdlXG4gICAgICogIC0gYGVuYCByZXN1bHQgaW5mbyBtZXNzYWdlXG4gICAgICogIC0gYGphYCDntZDmnpzmg4XloLHjg6Hjg4Pjgrvjg7zjgrhcbiAgICAgKiBAcGFyYW0gY2F1c2VcbiAgICAgKiAgLSBgZW5gIGxvdy1sZXZlbCBlcnJvciBpbmZvcm1hdGlvblxuICAgICAqICAtIGBqYWAg5LiL5L2N44Gu44Ko44Op44O85oOF5aCxXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY29kZT86IG51bWJlciwgbWVzc2FnZT86IHN0cmluZywgY2F1c2U/OiBhbnkpIHtcbiAgICAgICAgY29kZSA9IGlzTmlsKGNvZGUpID8gUkVTVUxUX0NPREUuU1VDQ0VTUyA6IGlzTnVtYmVyKGNvZGUpID8gTWF0aC50cnVuYyhjb2RlKSA6IFJFU1VMVF9DT0RFLkZBSUw7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UgfHwgdG9IZWxwU3RyaW5nKGNvZGUpKTtcbiAgICAgICAgbGV0IHRpbWUgPSBpc0Vycm9yKGNhdXNlKSA/IChjYXVzZSBhcyBSZXN1bHQpLnRpbWUgOiB1bmRlZmluZWQ7XG4gICAgICAgIGlzTnVtYmVyKHRpbWUgYXMgbnVtYmVyKSB8fCAodGltZSA9IERhdGUubm93KCkpO1xuICAgICAgICBjb25zdCBkZXNjcmlwdG9yczogUHJvcGVydHlEZXNjcmlwdG9yTWFwID0ge1xuICAgICAgICAgICAgY29kZTogIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IGNvZGUgIH0sXG4gICAgICAgICAgICBjYXVzZTogeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogY2F1c2UgfSxcbiAgICAgICAgICAgIHRpbWU6ICB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB0aW1lICB9LFxuICAgICAgICB9O1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCBkZXNjcmlwdG9ycyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFtbUkVTVUxUX0NPREVdXSB2YWx1ZS5cbiAgICAgKiBAamEgW1tSRVNVTFRfQ09ERV1dIOOBruWApFxuICAgICAqL1xuICAgIHJlYWRvbmx5IGNvZGUhOiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBAZW4gU3RvY2sgbG93LWxldmVsIGVycm9yIGluZm9ybWF0aW9uLlxuICAgICAqIEBqYSDkuIvkvY3jga7jgqjjg6njg7zmg4XloLHjgpLmoLzntI1cbiAgICAgKi9cbiAgICByZWFkb25seSBjYXVzZTogYW55O1xuXG4gICAgLyoqXG4gICAgICogQGVuIEdlbmVyYXRlZCB0aW1lIGluZm9ybWF0aW9uLlxuICAgICAqIEBqYSDnlJ/miJDjgZXjgozjgZ/mmYLliLvmg4XloLFcbiAgICAgKi9cbiAgICByZWFkb25seSB0aW1lITogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogQGVuIEp1ZGdlIHN1Y2NlZWRlZCBvciBub3QuXG4gICAgICogQGphIOaIkOWKn+WIpOWumlxuICAgICAqL1xuICAgIGdldCBpc1N1Y2NlZWRlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIFNVQ0NFRURFRCh0aGlzLmNvZGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBKdWRnZSBmYWlsZWQgb3Igbm90LlxuICAgICAqIEBqYSDlpLHmlZfliKTlrppcbiAgICAgKi9cbiAgICBnZXQgaXNGYWlsZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBGQUlMRUQodGhpcy5jb2RlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gSnVkZ2UgY2FuY2VsZWQgb3Igbm90LlxuICAgICAqIEBqYSDjgq3jg6Pjg7Pjgrvjg6vjgqjjg6njg7zliKTlrppcbiAgICAgKi9cbiAgICBnZXQgaXNDYW5jZWxlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29kZSA9PT0gUkVTVUxUX0NPREUuQUJPUlQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIEdldCBmb3JtYXR0ZWQgW1tSRVNVTFRfQ09ERV1dIG5hbWUgc3RyaW5nLlxuICAgICAqIEBqYSDjg5Xjgqnjg7zjg57jg4Pjg4jjgZXjgozjgZ8gW1tSRVNVTFRfQ09ERV1dIOWQjeaWh+Wtl+WIl+OCkuWPluW+l1xuICAgICAqL1xuICAgIGdldCBjb2RlTmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdG9OYW1lU3RyaW5nKHRoaXMuY29kZSwgdGhpcy5uYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gR2V0IFtbUkVTVUxUX0NPREVdXSBoZWxwIHN0cmluZy5cbiAgICAgKiBAamEgW1tSRVNVTFRfQ09ERV1dIOOBruODmOODq+ODl+OCueODiOODquODs+OCsOOCkuWPluW+l1xuICAgICAqL1xuICAgIGdldCBoZWxwKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0b0hlbHBTdHJpbmcodGhpcy5jb2RlKTtcbiAgICB9XG5cbiAgICAvKiogQGludGVybmFsICovXG4gICAgcHJpdmF0ZSBnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKTogVGFnLlJFU1VMVCB7XG4gICAgICAgIHJldHVybiBUYWcuUkVTVUxUO1xuICAgIH1cbn1cblxuUmVzdWx0LnByb3RvdHlwZS5uYW1lID0gVGFnLlJFU1VMVDtcblxuLyoqIEBpbnRlcm5hIGxSZXR1cm5zIGB0cnVlYCBpZiBgeGAgaXMgYEVycm9yYCwgYGZhbHNlYCBvdGhlcndpc2UuICovXG5mdW5jdGlvbiBpc0Vycm9yKHg6IHVua25vd24pOiB4IGlzIEVycm9yIHtcbiAgICByZXR1cm4geCBpbnN0YW5jZW9mIEVycm9yIHx8IGNsYXNzTmFtZSh4KSA9PT0gVGFnLkVSUk9SO1xufVxuXG4vKiogUmV0dXJucyBgdHJ1ZWAgaWYgYHhgIGlzIGBSZXN1bHRgLCBgZmFsc2VgIG90aGVyd2lzZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Jlc3VsdCh4OiB1bmtub3duKTogeCBpcyBSZXN1bHQge1xuICAgIHJldHVybiB4IGluc3RhbmNlb2YgUmVzdWx0IHx8IGNsYXNzTmFtZSh4KSA9PT0gVGFnLlJFU1VMVDtcbn1cblxuLyoqXG4gKiBAZW4gQ29udmVydCB0byBbW1Jlc3VsdF1dIG9iamVjdC5cbiAqIEBqYSBbW1Jlc3VsdF1dIOOCquODluOCuOOCp+OCr+ODiOOBq+WkieaPm1xuICovXG5leHBvcnQgZnVuY3Rpb24gdG9SZXN1bHQobzogdW5rbm93bik6IFJlc3VsdCB7XG4gICAgaWYgKG8gaW5zdGFuY2VvZiBSZXN1bHQpIHtcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1jb25zdCAqL1xuICAgICAgICBsZXQgeyBjb2RlLCBjYXVzZSwgdGltZSB9ID0gbztcbiAgICAgICAgY29kZSA9IGlzTmlsKGNvZGUpID8gUkVTVUxUX0NPREUuU1VDQ0VTUyA6IGlzTnVtYmVyKGNvZGUpID8gTWF0aC50cnVuYyhjb2RlKSA6IFJFU1VMVF9DT0RFLkZBSUw7XG4gICAgICAgIGlzTnVtYmVyKHRpbWUpIHx8ICh0aW1lID0gRGF0ZS5ub3coKSk7XG4gICAgICAgIC8vIERvIG5vdGhpbmcgaWYgYWxyZWFkeSBkZWZpbmVkXG4gICAgICAgIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkobywgJ2NvZGUnLCAgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogY29kZSAgfSk7XG4gICAgICAgIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkobywgJ2NhdXNlJywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogY2F1c2UgfSk7XG4gICAgICAgIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkobywgJ3RpbWUnLCAgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdGltZSAgfSk7XG4gICAgICAgIHJldHVybiBvO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGUgPSBPYmplY3QobykgYXMgUmVzdWx0O1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gaXNTdHJpbmcoZS5tZXNzYWdlKSA/IGUubWVzc2FnZSA6IGlzU3RyaW5nKG8pID8gbyA6IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgY29kZSA9IGlzQ2hhbmNlbExpa2VFcnJvcihtZXNzYWdlKSA/IFJFU1VMVF9DT0RFLkFCT1JUIDogaXNOdW1iZXIoZS5jb2RlKSA/IGUuY29kZSA6IG8gYXMgYW55O1xuICAgICAgICBjb25zdCBjYXVzZSA9IGlzRXJyb3IoZS5jYXVzZSkgPyBlLmNhdXNlIDogaXNFcnJvcihvKSA/IG8gOiBpc1N0cmluZyhvKSA/IG5ldyBFcnJvcihvKSA6IG87XG4gICAgICAgIHJldHVybiBuZXcgUmVzdWx0KGNvZGUsIG1lc3NhZ2UsIGNhdXNlKTtcbiAgICB9XG59XG5cbi8qKlxuICogQGVuIENyZWF0ZSBbW1Jlc3VsdF1dIGhlbHBlci5cbiAqIEBqYSBbW1Jlc3VsdF1dIOOCquODluOCuOOCp+OCr+ODiOani+evieODmOODq+ODkeODvFxuICpcbiAqIEBwYXJhbSBjb2RlXG4gKiAgLSBgZW5gIHJlc3VsdCBjb2RlXG4gKiAgLSBgamFgIOe1kOaenOOCs+ODvOODiVxuICogQHBhcmFtIG1lc3NhZ2VcbiAqICAtIGBlbmAgcmVzdWx0IGluZm8gbWVzc2FnZVxuICogIC0gYGphYCDntZDmnpzmg4XloLHjg6Hjg4Pjgrvjg7zjgrhcbiAqIEBwYXJhbSBjYXVzZVxuICogIC0gYGVuYCBsb3ctbGV2ZWwgZXJyb3IgaW5mb3JtYXRpb25cbiAqICAtIGBqYWAg5LiL5L2N44Gu44Ko44Op44O85oOF5aCxXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlUmVzdWx0KGNvZGU6IG51bWJlciwgbWVzc2FnZT86IHN0cmluZywgY2F1c2U/OiBhbnkpOiBSZXN1bHQge1xuICAgIHJldHVybiBuZXcgUmVzdWx0KGNvZGUsIG1lc3NhZ2UsIGNhdXNlKTtcbn1cblxuLyoqXG4gKiBAZW4gQ3JlYXRlIGNhbmNlbGVkIFtbUmVzdWx0XV0gaGVscGVyLlxuICogQGphIOOCreODo+ODs+OCu+ODq+aDheWgseagvOe0jSBbW1Jlc3VsdF1dIOOCquODluOCuOOCp+OCr+ODiOani+evieODmOODq+ODkeODvFxuICpcbiAqIEBwYXJhbSBtZXNzYWdlXG4gKiAgLSBgZW5gIHJlc3VsdCBpbmZvIG1lc3NhZ2VcbiAqICAtIGBqYWAg57WQ5p6c5oOF5aCx44Oh44OD44K744O844K4XG4gKiBAcGFyYW0gY2F1c2VcbiAqICAtIGBlbmAgbG93LWxldmVsIGVycm9yIGluZm9ybWF0aW9uXG4gKiAgLSBgamFgIOS4i+S9jeOBruOCqOODqeODvOaDheWgsVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUNhbmNlbGVkUmVzdWx0KG1lc3NhZ2U/OiBzdHJpbmcsIGNhdXNlPzogYW55KTogUmVzdWx0IHtcbiAgICByZXR1cm4gbmV3IFJlc3VsdChSRVNVTFRfQ09ERS5BQk9SVCwgbWVzc2FnZSwgY2F1c2UpO1xufVxuIiwiLyogZXNsaW50LWRpc2FibGVcbiAgIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAqL1xuXG5pbXBvcnQge1xuICAgIFBsYWluT2JqZWN0LFxuICAgIEtleXMsXG4gICAgVHlwZXMsXG4gICAgS2V5VG9UeXBlLFxuICAgIGRlZXBFcXVhbCxcbiAgICBpc0VtcHR5T2JqZWN0LFxuICAgIGZyb21UeXBlZERhdGEsXG4gICAgZHJvcFVuZGVmaW5lZCxcbiAgICByZXN0b3JlTmlsLFxufSBmcm9tICdAY2RwL2NvcmUtdXRpbHMnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uLCBFdmVudEJyb2tlciB9IGZyb20gJ0BjZHAvZXZlbnRzJztcbmltcG9ydCB7XG4gICAgQ2FuY2VsYWJsZSxcbiAgICBjaGVja0NhbmNlbGVkIGFzIGNjLFxufSBmcm9tICdAY2RwL3Byb21pc2UnO1xuaW1wb3J0IHtcbiAgICBTdG9yYWdlRGF0YVR5cGVMaXN0LFxuICAgIFN0b3JhZ2VJbnB1dERhdGFUeXBlTGlzdCxcbiAgICBJU3RvcmFnZU9wdGlvbnMsXG4gICAgSVN0b3JhZ2VEYXRhT3B0aW9ucyxcbiAgICBJU3RvcmFnZURhdGFSZXR1cm5UeXBlLFxuICAgIElTdG9yYWdlRXZlbnRDYWxsYmFjayxcbiAgICBJU3RvcmFnZSxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuLyoqIE1lbW9yeVN0b3JhZ2UgSS9PIG9wdGlvbnMgKi9cbmV4cG9ydCB0eXBlIE1lbW9yeVN0b3JhZ2VPcHRpb25zPEsgZXh0ZW5kcyBLZXlzPFN0b3JhZ2VEYXRhVHlwZUxpc3Q+PiA9IElTdG9yYWdlRGF0YU9wdGlvbnM8U3RvcmFnZURhdGFUeXBlTGlzdCwgSz47XG4vKiogTWVtb3J5U3RvcmFnZSByZXR1cm4gdmFsdWUgKi9cbmV4cG9ydCB0eXBlIE1lbW9yeVN0b3JhZ2VSZXN1bHQ8SyBleHRlbmRzIEtleXM8U3RvcmFnZURhdGFUeXBlTGlzdD4+ID0gS2V5VG9UeXBlPFN0b3JhZ2VEYXRhVHlwZUxpc3QsIEs+O1xuLyoqIE1lbW9yeVN0b3JhZ2UgZGF0YSB0eXBlICovXG5leHBvcnQgdHlwZSBNZW1vcnlTdG9yYWdlRGF0YVR5cGVzID0gVHlwZXM8U3RvcmFnZURhdGFUeXBlTGlzdD47XG4vKiogTWVtb3J5U3RvcmFnZSByZXR1cm4gdHlwZSAqL1xuZXhwb3J0IHR5cGUgTWVtb3J5U3RvcmFnZVJldHVyblR5cGU8RCBleHRlbmRzIE1lbW9yeVN0b3JhZ2VEYXRhVHlwZXM+ID0gSVN0b3JhZ2VEYXRhUmV0dXJuVHlwZTxTdG9yYWdlRGF0YVR5cGVMaXN0LCBEPjtcbi8qKiBNZW1vcnlTdG9yYWdlIGlucHV0IGRhdGEgdHlwZSAqL1xuZXhwb3J0IHR5cGUgTWVtb3J5U3RvcmFnZUlucHV0RGF0YVR5cGVzID0gU3RvcmFnZUlucHV0RGF0YVR5cGVMaXN0PFN0b3JhZ2VEYXRhVHlwZUxpc3Q+O1xuLyoqIE1lbW9yeVN0b3JhZ2UgZXZlbnQgY2FsbGJhY2sgKi9cbmV4cG9ydCB0eXBlIE1lbW9yeVN0b3JhZ2VFdmVudENhbGxiYWNrID0gSVN0b3JhZ2VFdmVudENhbGxiYWNrPFN0b3JhZ2VEYXRhVHlwZUxpc3Q+O1xuXG4vKiogQGludGVybmFsICovXG5pbnRlcmZhY2UgTWVtb3J5U3RvcmFnZUV2ZW50IHtcbiAgICAnQCc6IFtzdHJpbmcgfCBudWxsLCBNZW1vcnlTdG9yYWdlRGF0YVR5cGVzIHwgbnVsbCwgTWVtb3J5U3RvcmFnZURhdGFUeXBlcyB8IG51bGxdO1xufVxuXG4vL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fLy9cblxuLyoqXG4gKiBAZW4gTWVtb3J5IHN0b3JhZ2UgY2xhc3MuIFRoaXMgY2xhc3MgZG9lc24ndCBzdXBwb3J0IHBlcm1hbmVjaWF0aW9uIGRhdGEuXG4gKiBAamEg44Oh44Oi44Oq44O844K544OI44Os44O844K444Kv44Op44K5LiDmnKzjgq/jg6njgrnjga/jg4fjg7zjgr/jga7msLjntprljJbjgpLjgrXjg53jg7zjg4jjgZfjgarjgYRcbiAqL1xuZXhwb3J0IGNsYXNzIE1lbW9yeVN0b3JhZ2UgaW1wbGVtZW50cyBJU3RvcmFnZSB7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IF9icm9rZXIgPSBuZXcgRXZlbnRCcm9rZXI8TWVtb3J5U3RvcmFnZUV2ZW50PigpO1xuICAgIHByaXZhdGUgX3N0b3JhZ2U6IFBsYWluT2JqZWN0ID0ge307XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBpbXBsZW1lbnRzOiBJU3RvcmFnZVxuXG4gICAgLyoqXG4gICAgICogQGVuIFtbSVN0b3JhZ2VdXSBraW5kIHNpZ25hdHVyZS5cbiAgICAgKiBAamEgW1tJU3RvcmFnZV1dIOOBrueoruWIpeOCkuihqOOBmeitmOWIpeWtkFxuICAgICAqL1xuICAgIGdldCBraW5kKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAnbWVtb3J5JztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gUmV0dXJucyB0aGUgY3VycmVudCB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGtleSwgb3IgbnVsbCBpZiB0aGUgZ2l2ZW4ga2V5IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgb2JqZWN0LlxuICAgICAqIEBqYSDjgq3jg7zjgavlr77lv5zjgZnjgovlgKTjgpLlj5blvpcuIOWtmOWcqOOBl+OBquOBhOWgtOWQiOOBryBudWxsIOOCkui/lOWNtFxuICAgICAqXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqICAtIGBlbmAgYWNjZXNzIGtleVxuICAgICAqICAtIGBqYWAg44Ki44Kv44K744K544Kt44O8XG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKiAgLSBgZW5gIEkvTyBvcHRpb25zXG4gICAgICogIC0gYGphYCBJL08g44Kq44OX44K344On44OzXG4gICAgICogQHJldHVybnNcbiAgICAgKiAgLSBgZW5gIFJldHVybnMgdGhlIHZhbHVlIHdoaWNoIGNvcnJlc3BvbmRzIHRvIGEga2V5IHdpdGggdHlwZSBjaGFuZ2UgZGVzaWduYXRlZCBpbiBgZGF0YVR5cGVgLlxuICAgICAqICAtIGBqYWAgYGRhdGFUeXBlYCDjgafmjIflrprjgZXjgozjgZ/lnovlpInmj5vjgpLooYzjgaPjgaYsIOOCreODvOOBq+WvvuW/nOOBmeOCi+WApOOCkui/lOWNtFxuICAgICAqL1xuICAgIGdldEl0ZW08RCBleHRlbmRzIE1lbW9yeVN0b3JhZ2VEYXRhVHlwZXMgPSBNZW1vcnlTdG9yYWdlRGF0YVR5cGVzPihcbiAgICAgICAga2V5OiBzdHJpbmcsXG4gICAgICAgIG9wdGlvbnM/OiBNZW1vcnlTdG9yYWdlT3B0aW9uczxuZXZlcj5cbiAgICApOiBQcm9taXNlPE1lbW9yeVN0b3JhZ2VSZXR1cm5UeXBlPEQ+PjtcblxuICAgIC8qKlxuICAgICAqIEBlbiBSZXR1cm5zIHRoZSBjdXJyZW50IHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZ2l2ZW4ga2V5LCBvciBudWxsIGlmIHRoZSBnaXZlbiBrZXkgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBvYmplY3QuXG4gICAgICogQGphIOOCreODvOOBq+WvvuW/nOOBmeOCi+WApOOCkuWPluW+ly4g5a2Y5Zyo44GX44Gq44GE5aC05ZCI44GvIG51bGwg44KS6L+U5Y20XG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogIC0gYGVuYCBhY2Nlc3Mga2V5XG4gICAgICogIC0gYGphYCDjgqLjgq/jgrvjgrnjgq3jg7xcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqICAtIGBlbmAgSS9PIG9wdGlvbnNcbiAgICAgKiAgLSBgamFgIEkvTyDjgqrjg5fjgrfjg6fjg7NcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqICAtIGBlbmAgUmV0dXJucyB0aGUgdmFsdWUgd2hpY2ggY29ycmVzcG9uZHMgdG8gYSBrZXkgd2l0aCB0eXBlIGNoYW5nZSBkZXNpZ25hdGVkIGluIGBkYXRhVHlwZWAuXG4gICAgICogIC0gYGphYCBgZGF0YVR5cGVgIOOBp+aMh+WumuOBleOCjOOBn+Wei+WkieaPm+OCkuihjOOBo+OBpiwg44Kt44O844Gr5a++5b+c44GZ44KL5YCk44KS6L+U5Y20XG4gICAgICovXG4gICAgZ2V0SXRlbTxLIGV4dGVuZHMgS2V5czxTdG9yYWdlRGF0YVR5cGVMaXN0Pj4oXG4gICAgICAgIGtleTogc3RyaW5nLFxuICAgICAgICBvcHRpb25zPzogTWVtb3J5U3RvcmFnZU9wdGlvbnM8Sz5cbiAgICApOiBQcm9taXNlPE1lbW9yeVN0b3JhZ2VSZXN1bHQ8Sz4gfCBudWxsPjtcblxuICAgIGFzeW5jIGdldEl0ZW0oa2V5OiBzdHJpbmcsIG9wdGlvbnM/OiBNZW1vcnlTdG9yYWdlT3B0aW9uczxhbnk+KTogUHJvbWlzZTxNZW1vcnlTdG9yYWdlRGF0YVR5cGVzIHwgbnVsbD4ge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgYXdhaXQgY2Mob3B0aW9ucy5jYW5jZWwpO1xuXG4gICAgICAgIC8vIGB1bmRlZmluZWRgIOKGkiBgbnVsbGBcbiAgICAgICAgY29uc3QgdmFsdWUgPSBkcm9wVW5kZWZpbmVkKHRoaXMuX3N0b3JhZ2Vba2V5XSk7XG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5kYXRhVHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gZnJvbVR5cGVkRGF0YSh2YWx1ZSkgYXMgc3RyaW5nO1xuICAgICAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyKHJlc3RvcmVOaWwodmFsdWUpKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgICAgIHJldHVybiBCb29sZWFuKHJlc3RvcmVOaWwodmFsdWUpKTtcbiAgICAgICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdChyZXN0b3JlTmlsKHZhbHVlKSk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiByZXN0b3JlTmlsKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBTZXRzIHRoZSB2YWx1ZSBvZiB0aGUgcGFpciBpZGVudGlmaWVkIGJ5IGtleSB0byB2YWx1ZSwgY3JlYXRpbmcgYSBuZXcga2V5L3ZhbHVlIHBhaXIgaWYgbm9uZSBleGlzdGVkIGZvciBrZXkgcHJldmlvdXNseS5cbiAgICAgKiBAamEg44Kt44O844KS5oyH5a6a44GX44Gm5YCk44KS6Kit5a6aLiDlrZjlnKjjgZfjgarjgYTloLTlkIjjga/mlrDopo/jgavkvZzmiJBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiAgLSBgZW5gIGFjY2VzcyBrZXlcbiAgICAgKiAgLSBgamFgIOOCouOCr+OCu+OCueOCreODvFxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogIC0gYGVuYCBJL08gb3B0aW9uc1xuICAgICAqICAtIGBqYWAgSS9PIOOCquODl+OCt+ODp+ODs1xuICAgICAqL1xuICAgIGFzeW5jIHNldEl0ZW08ViBleHRlbmRzIE1lbW9yeVN0b3JhZ2VJbnB1dERhdGFUeXBlcz4oa2V5OiBzdHJpbmcsIHZhbHVlOiBWLCBvcHRpb25zPzogTWVtb3J5U3RvcmFnZU9wdGlvbnM8bmV2ZXI+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBhd2FpdCBjYyhvcHRpb25zLmNhbmNlbCk7XG4gICAgICAgIGNvbnN0IG5ld1ZhbCA9IGRyb3BVbmRlZmluZWQodmFsdWUsIHRydWUpOyAgICAgICAgIC8vIGBudWxsYCBvciBgdW5kZWZpbmVkYCDihpIgJ251bGwnIG9yICd1bmRlZmluZWQnXG4gICAgICAgIGNvbnN0IG9sZFZhbCA9IGRyb3BVbmRlZmluZWQodGhpcy5fc3RvcmFnZVtrZXldKTsgIC8vIGB1bmRlZmluZWRgIOKGkiBgbnVsbGBcbiAgICAgICAgaWYgKCFkZWVwRXF1YWwob2xkVmFsLCBuZXdWYWwpKSB7XG4gICAgICAgICAgICB0aGlzLl9zdG9yYWdlW2tleV0gPSBuZXdWYWw7XG4gICAgICAgICAgICAhb3B0aW9ucy5zaWxlbnQgJiYgdGhpcy5fYnJva2VyLnRyaWdnZXIoJ0AnLCBrZXksIG5ld1ZhbCwgb2xkVmFsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBSZW1vdmVzIHRoZSBrZXkvdmFsdWUgcGFpciB3aXRoIHRoZSBnaXZlbiBrZXkgZnJvbSB0aGUgbGlzdCBhc3NvY2lhdGVkIHdpdGggdGhlIG9iamVjdCwgaWYgYSBrZXkvdmFsdWUgcGFpciB3aXRoIHRoZSBnaXZlbiBrZXkgZXhpc3RzLlxuICAgICAqIEBqYSDmjIflrprjgZXjgozjgZ/jgq3jg7zjgavlr77lv5zjgZnjgovlgKTjgYzlrZjlnKjjgZnjgozjgbDliYrpmaRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogIC0gYGVuYCBzdG9yYWdlIG9wdGlvbnNcbiAgICAgKiAgLSBgamFgIOOCueODiOODrOODvOOCuOOCquODl+OCt+ODp+ODs1xuICAgICAqL1xuICAgIGFzeW5jIHJlbW92ZUl0ZW0oa2V5OiBzdHJpbmcsIG9wdGlvbnM/OiBJU3RvcmFnZU9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIGF3YWl0IGNjKG9wdGlvbnMuY2FuY2VsKTtcbiAgICAgICAgY29uc3Qgb2xkVmFsID0gdGhpcy5fc3RvcmFnZVtrZXldO1xuICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBvbGRWYWwpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9zdG9yYWdlW2tleV07XG4gICAgICAgICAgICAhb3B0aW9ucy5zaWxlbnQgJiYgdGhpcy5fYnJva2VyLnRyaWdnZXIoJ0AnLCBrZXksIG51bGwsIG9sZFZhbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gRW1wdGllcyB0aGUgbGlzdCBhc3NvY2lhdGVkIHdpdGggdGhlIG9iamVjdCBvZiBhbGwga2V5L3ZhbHVlIHBhaXJzLCBpZiB0aGVyZSBhcmUgYW55LlxuICAgICAqIEBqYSDjgZnjgbnjgabjga7jgq3jg7zjgavlr77lv5zjgZnjgovlgKTjgpLliYrpmaRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogIC0gYGVuYCBzdG9yYWdlIG9wdGlvbnNcbiAgICAgKiAgLSBgamFgIOOCueODiOODrOODvOOCuOOCquODl+OCt+ODp+ODs1xuICAgICAqL1xuICAgIGFzeW5jIGNsZWFyKG9wdGlvbnM/OiBJU3RvcmFnZU9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIGF3YWl0IGNjKG9wdGlvbnMuY2FuY2VsKTtcbiAgICAgICAgaWYgKCFpc0VtcHR5T2JqZWN0KHRoaXMuX3N0b3JhZ2UpKSB7XG4gICAgICAgICAgICB0aGlzLl9zdG9yYWdlID0ge307XG4gICAgICAgICAgICAhb3B0aW9ucy5zaWxlbnQgJiYgdGhpcy5fYnJva2VyLnRyaWdnZXIoJ0AnLCBudWxsLCBudWxsLCBudWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBSZXR1cm5zIGFsbCBlbnRyeSBrZXlzLlxuICAgICAqIEBqYSDjgZnjgbnjgabjga7jgq3jg7zkuIDopqfjgpLov5TljbRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogIC0gYGVuYCBjYW5jZWwgb3B0aW9uc1xuICAgICAqICAtIGBqYWAg44Kt44Oj44Oz44K744Or44Kq44OX44K344On44OzXG4gICAgICovXG4gICAgYXN5bmMga2V5cyhvcHRpb25zPzogQ2FuY2VsYWJsZSk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICAgICAgYXdhaXQgY2Mob3B0aW9ucyAmJiBvcHRpb25zLmNhbmNlbCk7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9zdG9yYWdlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gU3Vic2NyaXZlIGV2ZW50KHMpLlxuICAgICAqIEBqYSDjgqTjg5njg7Pjg4jos7zoqq3oqK3lrppcbiAgICAgKlxuICAgICAqIEBwYXJhbSBsaXN0ZW5lclxuICAgICAqICAtIGBlbmAgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICogIC0gYGphYCDjgrPjg7zjg6vjg5Djg4Pjgq/plqLmlbBcbiAgICAgKi9cbiAgICBvbihsaXN0ZW5lcjogTWVtb3J5U3RvcmFnZUV2ZW50Q2FsbGJhY2spOiBTdWJzY3JpcHRpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5fYnJva2VyLm9uKCdAJywgbGlzdGVuZXIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBVbnN1YnNjcmliZSBldmVudChzKS5cbiAgICAgKiBAamEg44Kk44OZ44Oz44OI6LO86Kqt6Kej6ZmkXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXJcbiAgICAgKiAgLSBgZW5gIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAqICAgICAgICAgV2hlbiBub3Qgc2V0IHRoaXMgcGFyYW1ldGVyLCBsaXN0ZW5lcnMgYXJlIHJlbGVhc2VkLlxuICAgICAqICAtIGBqYWAg44Kz44O844Or44OQ44OD44Kv6Zai5pWwXG4gICAgICogICAgICAgICDmjIflrprjgZfjgarjgYTloLTlkIjjga/jgZnjgbnjgabjgpLop6PpmaRcbiAgICAgKi9cbiAgICBvZmYobGlzdGVuZXI/OiBNZW1vcnlTdG9yYWdlRXZlbnRDYWxsYmFjayk6IHZvaWQge1xuICAgICAgICB0aGlzLl9icm9rZXIub2ZmKCdAJywgbGlzdGVuZXIpO1xuICAgIH1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIG9wZXJhdGlvbnM6XG5cbiAgICAvKipcbiAgICAgKiBAZW4gUmV0dXJuIGEgc2hhbGxvdyBjb3B5IG9mIHRoZSBzdG9yYWdlJ3MgYXR0cmlidXRlcyBmb3IgSlNPTiBzdHJpbmdpZmljYXRpb24uXG4gICAgICogQGphIEpTT04gc3RyaW5naWZ5IOOBruOBn+OCgeOBq+OCueODiOODrOODvOOCuOODl+ODreODkeODhuOCo+OBruOCt+ODo+ODreODvOOCs+ODlOODvOi/lOWNtFxuICAgICAqL1xuICAgIGdldCBjb250ZXh0KCk6IFBsYWluT2JqZWN0IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0b3JhZ2U7XG4gICAgfVxufVxuXG4vLyBkZWZhdWx0IHN0b3JhZ2VcbmV4cG9ydCBjb25zdCBtZW1vcnlTdG9yYWdlID0gbmV3IE1lbW9yeVN0b3JhZ2UoKTtcbiIsIi8qIGVzbGludC1kaXNhYmxlXG4gICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gKi9cblxuaW1wb3J0IHtcbiAgICBQbGFpbk9iamVjdCxcbiAgICBwb3N0LFxuICAgIGRlZXBFcXVhbCxcbiAgICBkZWVwQ29weSxcbiAgICBkcm9wVW5kZWZpbmVkLFxufSBmcm9tICdAY2RwL2NvcmUtdXRpbHMnO1xuaW1wb3J0IHsgRXZlbnRQdWJsaXNoZXIgfSBmcm9tICdAY2RwL2V2ZW50cyc7XG5pbXBvcnQge1xuICAgIElTdG9yYWdlLFxuICAgIElTdG9yYWdlT3B0aW9ucyxcbiAgICBJU3RvcmFnZUZvcm1hdE9wdGlvbnMsXG4gICAgUmVnaXN0cnlTY2hlbWFCYXNlLFxuICAgIFJlZ2lzdHJ5RXZlbnQsXG4gICAgUmVnaXN0cnlSZWFkT3B0aW9ucyxcbiAgICBSZWdpc3RyeVdyaXRlT3B0aW9ucyxcbiAgICBSZWdpc3RyeVNhdmVPcHRpb25zLFxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIEBlbiBSZWdpc3RyeSBtYW5hZ2VtZW50IGNsYXNzIGZvciBzeW5jaHJvbm91cyBSZWFkL1dyaXRlIGFjY2Vzc2libGUgZnJvbSBhbnkgW1tJU3RvcmFnZV1dIG9iamVjdC5cbiAqIEBqYSDku7vmhI/jga4gW1tJU3RvcmFnZV1dIOOCquODluOCuOOCp+OCr+ODiOOBi+OCieWQjOacnyBSZWFkL1dyaXRlIOOCouOCr+OCu+OCueWPr+iDveOBquODrOOCuOOCueODiOODqueuoeeQhuOCr+ODqeOCuVxuICpcbiAqIEBleGFtcGxlIDxicj5cbiAqXG4gKiBgYGB0c1xuICogLy8gMS4gZGVmaW5lIHJlZ2lzdHJ5IHNjaGVtYVxuICogaW50ZXJmYWNlIFNjaGVtYSBleHRlbmRzIFJlZ2lzdHJ5U2NoZW1hQmFzZSB7XG4gKiAgICAnY29tbW9uL21vZGUnOiAnbm9ybWFsJyB8ICdzcGVjaWZpZWQnO1xuICogICAgJ2NvbW1vbi92YWx1ZSc6IG51bWJlcjtcbiAqICAgICd0cmFkZS9sb2NhbCc6IHsgdW5pdDogJ+WGhicgfCAnJCc7IHJhdGU6IG51bWJlcjsgfTtcbiAqICAgICd0cmFkZS9jaGVjayc6IGJvb2xlYW47XG4gKiAgICAnZXh0cmEvdXNlcic6IHN0cmluZztcbiAqIH1cbiAqXG4gKiAvLyAyLiBwcmVwYXJlIElTdG9yYWdlIGluc3RhbmNlXG4gKiAvLyBleFxuICogaW1wb3J0IHsgd2ViU3RvcmFnZSB9IGZyb20gJ0BjZHAvd2ViLXN0b3JhZ2UnO1xuICpcbiAqIC8vIDMuIGluc3RhbnRpYXRlIHRoaXMgY2xhc3NcbiAqIGNvbnN0IHJlZyA9IG5ldyBSZWdpc3RyeTxTY2hlbWE+KHdlYlN0b3JhZ2UsICdAdGVzdCcpO1xuICpcbiAqIC8vIDQuIHJlYWQgZXhhbXBsZVxuICogY29uc3QgdmFsID0gcmVnLnJlYWQoJ2NvbW1vbi9tb2RlJyk7IC8vICdub3JtYWwnIHwgJ3NwZWNpZmllZCcgfCBudWxsXG4gKlxuICogLy8gNS4gd3JpdGUgZXhhbXBsZVxuICogcmVnLndyaXRlKCdjb21tb24vbW9kZScsICdzcGVjaWZpZWQnKTtcbiAqIC8vIHJlZy53cml0ZSgnY29tbW9uL21vZGUnLCAnaG9nZScpOyAvLyBjb21waWxlIGVycm9yXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJlZ2lzdHJ5PFQgZXh0ZW5kcyBSZWdpc3RyeVNjaGVtYUJhc2UgPSBhbnk+IGV4dGVuZHMgRXZlbnRQdWJsaXNoZXI8UmVnaXN0cnlFdmVudDxUPj4ge1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBfc3RvcmFnZTogSVN0b3JhZ2U7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfcm9vdEtleTogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2RlZmF1bHRPcHRpb25zOiBJU3RvcmFnZUZvcm1hdE9wdGlvbnM7XG4gICAgcHJpdmF0ZSBfc3RvcmU6IFBsYWluT2JqZWN0ID0ge307XG5cbiAgICAvKipcbiAgICAgKiBjb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHN0b3JhZ2VcbiAgICAgKiAgLSBgZW5gIFJvb3Qga2V5IGZvciBbW0lTdG9yYWdlXV0uXG4gICAgICogIC0gYGphYCBbW0lTdG9yYWdlXV0g44Gr5L2/55So44GZ44KL44Or44O844OI44Kt44O8XG4gICAgICogQHBhcmFtIHJvb3RLZXlcbiAgICAgKiAgLSBgZW5gIFJvb3Qga2V5IGZvciBbW0lTdG9yYWdlXV0uXG4gICAgICogIC0gYGphYCBbW0lTdG9yYWdlXV0g44Gr5L2/55So44GZ44KL44Or44O844OI44Kt44O8XG4gICAgICogQHBhcmFtIGZvcm1hdFNwYWNlXG4gICAgICogIC0gYGVuYCBmb3IgSlNPTiBmb3JtYXQgc3BhY2UuXG4gICAgICogIC0gYGphYCBKU09OIOODleOCqeODvOODnuODg+ODiOOCueODmuODvOOCueOCkuaMh+WumlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHN0b3JhZ2U6IElTdG9yYWdlPGFueT4sIHJvb3RLZXk6IHN0cmluZywgZm9ybWF0U3BhY2U/OiBudW1iZXIpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fc3RvcmFnZSA9IHN0b3JhZ2U7XG4gICAgICAgIHRoaXMuX3Jvb3RLZXkgPSByb290S2V5O1xuICAgICAgICB0aGlzLl9kZWZhdWx0T3B0aW9ucyA9IHsganNvblNwYWNlOiBmb3JtYXRTcGFjZSB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBBY2Nlc3MgdG8gcm9vdCBrZXkuXG4gICAgICogQGphIOODq+ODvOODiOOCreODvOOCkuWPluW+l1xuICAgICAqL1xuICAgIGdldCByb290S2V5KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290S2V5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBBY2Nlc3MgdG8gW1tJU3RvcmFnZV1dIG9iamVjdC5cbiAgICAgKiBAamEgW1tJU3RvcmFnZV1dIOOCquODluOCuOOCp+OCr+ODiOOCkuWPluW+l1xuICAgICAqL1xuICAgIGdldCBzdG9yYWdlKCk6IElTdG9yYWdlPGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RvcmFnZTtcbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBwdWJsaWMgbWV0aG9kczpcblxuICAgIC8qKlxuICAgICAqIEBlbiBSZWFkIHBlcnNpc3RlbmNlIGRhdGEgZnJvbSBbW0lTdG9yYWdlXV0uIFRoZSBkYXRhIGxvYWRlZCBhbHJlYWR5IHdpbGwgYmUgY2xlYXJlZC5cbiAgICAgKiBAamEgW1tJU3RvcmFnZV1dIOOBi+OCieawuOe2muWMluOBl+OBn+ODh+ODvOOCv+OCkuiqreOBv+i+vOOBvy4g44GZ44Gn44Gr44Kt44Oj44OD44K344Ol44GV44KM44Gm44GE44KL44OH44O844K/44Gv56C05qOE44GV44KM44KLXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGxvYWQob3B0aW9ucz86IElTdG9yYWdlT3B0aW9ucyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgdGhpcy5fc3RvcmUgPSAoYXdhaXQgdGhpcy5fc3RvcmFnZS5nZXRJdGVtKHRoaXMuX3Jvb3RLZXksIG9wdGlvbnMpKSB8fCB7fTtcbiAgICAgICAgaWYgKCFvcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgcG9zdCgoKSA9PiB0aGlzLnB1Ymxpc2goJ2NoYW5nZScsICcqJykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFBlcnNpc3QgZGF0YSB0byBbW0lTdG9yYWdlXV0uXG4gICAgICogQGphIFtbSVN0b3JhZ2VdXSDjgavjg4fjg7zjgr/jgpLmsLjntprljJZcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgc2F2ZShvcHRpb25zPzogUmVnaXN0cnlTYXZlT3B0aW9ucyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBvcHRzOiBSZWdpc3RyeVNhdmVPcHRpb25zID0geyAuLi50aGlzLl9kZWZhdWx0T3B0aW9ucywgLi4ub3B0aW9ucyB9O1xuICAgICAgICBpZiAoIW9wdHMuc2lsZW50KSB7XG4gICAgICAgICAgICB0aGlzLnB1Ymxpc2goJ3dpbGwtc2F2ZScpO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IHRoaXMuX3N0b3JhZ2Uuc2V0SXRlbSh0aGlzLl9yb290S2V5LCB0aGlzLl9zdG9yZSwgb3B0cyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGVuIFJlYWQgcmVnaXN0cnkgdmFsdWUuXG4gICAgICogQGphIOODrOOCuOOCueODiOODquWApOOBruiqreOBv+WPluOCilxuICAgICAqXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqICAtIGBlbmAgdGFyZ2V0IHJlZ2lzdHJ5IGtleS5cbiAgICAgKiAgLSBgamFgIOWvvuixoeOBruODrOOCuOOCueODiOODquOCreODvOOCkuaMh+WumlxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogIC0gYGVuYCByZWFkIG9wdGlvbnMuXG4gICAgICogIC0gYGphYCDoqq3jgb/lj5bjgorjgqrjg5fjgrfjg6fjg7PjgpLmjIflrppcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZDxLIGV4dGVuZHMga2V5b2YgVD4oa2V5OiBLLCBvcHRpb25zPzogUmVnaXN0cnlSZWFkT3B0aW9ucyk6IFRbS10gfCBudWxsIHtcbiAgICAgICAgY29uc3QgeyBmaWVsZCB9ID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgY29uc3Qgc3RydWN0dXJlID0gU3RyaW5nKGtleSkuc3BsaXQoJy8nKTtcbiAgICAgICAgY29uc3QgbGFzdEtleSA9IHN0cnVjdHVyZS5wb3AoKSBhcyBzdHJpbmc7XG5cbiAgICAgICAgbGV0IG5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHJlZyA9IHRoaXMudGFyZ2V0Um9vdChmaWVsZCk7XG5cbiAgICAgICAgd2hpbGUgKG5hbWUgPSBzdHJ1Y3R1cmUuc2hpZnQoKSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbmQtYXNzaWduXG4gICAgICAgICAgICBpZiAoIShuYW1lIGluIHJlZykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlZyA9IHJlZ1tuYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJldHVybiBkZWVwIGNvcHlcbiAgICAgICAgcmV0dXJuIChudWxsICE9IHJlZ1tsYXN0S2V5XSkgPyBkZWVwQ29weShyZWdbbGFzdEtleV0pIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gV3JpdGUgcmVnaXN0cnkgdmFsdWUuXG4gICAgICogQGphIOODrOOCuOOCueODiOODquWApOOBruabuOOBjei+vOOBv1xuICAgICAqXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqICAtIGBlbmAgdGFyZ2V0IHJlZ2lzdHJ5IGtleS5cbiAgICAgKiAgLSBgamFgIOWvvuixoeOBruODrOOCuOOCueODiOODquOCreODvOOCkuaMh+WumlxuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqICAtIGBlbmAgdXBkYXRlIHZhbHVlLiBpZiBgbnVsbGAgc2V0IHRvIGRlbGV0ZS5cbiAgICAgKiAgLSBgamFgIOabtOaWsOOBmeOCi+WApC4gYG51bGxgIOOBr+WJiumZpFxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogIC0gYGVuYCB3cml0ZSBvcHRpb25zLlxuICAgICAqICAtIGBqYWAg5pu444GN6L6844G/44Kq44OX44K344On44Oz44KS5oyH5a6aXG4gICAgICovXG4gICAgcHVibGljIHdyaXRlPEsgZXh0ZW5kcyBrZXlvZiBUPihrZXk6IEssIHZhbHVlOiBUW0tdIHwgbnVsbCwgb3B0aW9ucz86IFJlZ2lzdHJ5V3JpdGVPcHRpb25zKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHsgZmllbGQsIG5vU2F2ZSwgc2lsZW50IH0gPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBjb25zdCByZW1vdmUgPSAobnVsbCA9PSB2YWx1ZSk7XG4gICAgICAgIGNvbnN0IHN0cnVjdHVyZSA9IFN0cmluZyhrZXkpLnNwbGl0KCcvJyk7XG4gICAgICAgIGNvbnN0IGxhc3RLZXkgPSBzdHJ1Y3R1cmUucG9wKCkgYXMgc3RyaW5nO1xuXG4gICAgICAgIGxldCBuYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCByZWcgPSB0aGlzLnRhcmdldFJvb3QoZmllbGQpO1xuXG4gICAgICAgIHdoaWxlIChuYW1lID0gc3RydWN0dXJlLnNoaWZ0KCkpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25kLWFzc2lnblxuICAgICAgICAgICAgaWYgKG5hbWUgaW4gcmVnKSB7XG4gICAgICAgICAgICAgICAgcmVnID0gcmVnW25hbWVdO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZW1vdmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIOOBmeOBp+OBq+imquOCreODvOOBjOOBquOBhOOBn+OCgeS9leOCguOBl+OBquOBhFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWcgPSByZWdbbmFtZV0gPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5ld1ZhbCA9IHJlbW92ZSA/IG51bGwgOiB2YWx1ZTtcbiAgICAgICAgY29uc3Qgb2xkVmFsID0gZHJvcFVuZGVmaW5lZChyZWdbbGFzdEtleV0pO1xuICAgICAgICBpZiAoZGVlcEVxdWFsKG9sZFZhbCwgbmV3VmFsKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyDmm7TmlrDjgarjgZdcbiAgICAgICAgfSBlbHNlIGlmIChyZW1vdmUpIHtcbiAgICAgICAgICAgIGRlbGV0ZSByZWdbbGFzdEtleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWdbbGFzdEtleV0gPSBkZWVwQ29weShuZXdWYWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFub1NhdmUpIHtcbiAgICAgICAgICAgIC8vIG5vIGZpcmUgbm90aWZpY2F0aW9uXG4gICAgICAgICAgICB0aGlzLl9zdG9yYWdlLnNldEl0ZW0odGhpcy5fcm9vdEtleSwgdGhpcy5fc3RvcmUsIHsgLi4udGhpcy5fZGVmYXVsdE9wdGlvbnMsIC4uLm9wdGlvbnMgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNpbGVudCkge1xuICAgICAgICAgICAgcG9zdCgoKSA9PiB0aGlzLnB1Ymxpc2goJ2NoYW5nZScsIGtleSwgbmV3VmFsLCBvbGRWYWwpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBEZWxldGUgcmVnaXN0cnkga2V5LlxuICAgICAqIEBqYSDjg6zjgrjjgrnjg4jjg6rjgq3jg7zjga7liYrpmaRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBrZXlcbiAgICAgKiAgLSBgZW5gIHRhcmdldCByZWdpc3RyeSBrZXkuXG4gICAgICogIC0gYGphYCDlr77osaHjga7jg6zjgrjjgrnjg4jjg6rjgq3jg7zjgpLmjIflrppcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqICAtIGBlbmAgcmVhZCBvcHRpb25zLlxuICAgICAqICAtIGBqYWAg5pu444GN6L6844G/44Kq44OX44K344On44Oz44KS5oyH5a6aXG4gICAgICovXG4gICAgcHVibGljIGRlbGV0ZTxLIGV4dGVuZHMga2V5b2YgVD4oa2V5OiBLLCBvcHRpb25zPzogUmVnaXN0cnlXcml0ZU9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgdGhpcy53cml0ZShrZXksIG51bGwsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBlbiBDbGVhciBhbGwgcmVnaXN0cnkuXG4gICAgICogQGphIOODrOOCuOOCueODiOODquOBruWFqOWJiumZpFxuICAgICAqXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKiAgLSBgZW5gIHJlYWQgb3B0aW9ucy5cbiAgICAgKiAgLSBgamFgIOabuOOBjei+vOOBv+OCquODl+OCt+ODp+ODs+OCkuaMh+WumlxuICAgICAqL1xuICAgIHB1YmxpYyBjbGVhcihvcHRpb25zPzogUmVnaXN0cnlXcml0ZU9wdGlvbnMpOiB2b2lkIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIHRoaXMuX3N0b3JlID0ge307XG4gICAgICAgIHRoaXMuX3N0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLl9yb290S2V5LCBvcHRpb25zKTtcbiAgICAgICAgaWYgKCFvcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgdGhpcy5wdWJsaXNoKCdjaGFuZ2UnLCBudWxsLCBudWxsLCBudWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHByaXZhdGUgbWV0aG9kczpcblxuICAgIC8qKiBnZXQgcm9vdCBvYmplY3QgKi9cbiAgICBwcml2YXRlIHRhcmdldFJvb3QoZmllbGQ/OiBzdHJpbmcpOiBQbGFpbk9iamVjdCB7XG4gICAgICAgIGlmIChmaWVsZCkge1xuICAgICAgICAgICAgLy8gZW5zdXJlIFtmaWVsZF0gb2JqZWN0LlxuICAgICAgICAgICAgdGhpcy5fc3RvcmVbZmllbGRdID0gdGhpcy5fc3RvcmVbZmllbGRdIHx8IHt9O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3N0b3JlW2ZpZWxkXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zdG9yZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IGVzY2FwZUhUTUwgfSBmcm9tICdAY2RwL2NvcmUtdXRpbHMnO1xuaW1wb3J0IHtcbiAgICBUZW1wbGF0ZVRhZ3MsXG4gICAgVGVtcGxhdGVXcml0ZXIsXG4gICAgVGVtcGxhdGVFc2NhcGVyLFxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vKiogKHN0cmluZyB8IFRva2VuW10pICovXG50eXBlIFRva2VuTGlzdCA9IHVua25vd247XG5cbi8qKlxuICogQGVuIFtbVGVtcGxhdGVFbmdpbmVdXSB0b2tlbiBzdHJ1Y3R1cmUuXG4gKiBAamEgW1tUZW1wbGF0ZUVuZ2luZV1dIHRva2VuIOWei1xuICovXG5leHBvcnQgdHlwZSBUb2tlbiA9IFtzdHJpbmcsIHN0cmluZywgbnVtYmVyLCBudW1iZXIsIFRva2VuTGlzdD8sIG51bWJlcj8sIGJvb2xlYW4/XTtcblxuLyoqXG4gKiBAZW4gW1tUb2tlbl1dIGFkZHJlc3MgaWQuXG4gKiBAamEgW1tUb2tlbl1dIOOCouODieODrOOCueitmOWIpeWtkFxuICovXG5leHBvcnQgY29uc3QgZW51bSBUb2tlbkFkZHJlc3Mge1xuICAgIFRZUEUgPSAwLFxuICAgIFZBTFVFLFxuICAgIFNUQVJULFxuICAgIEVORCxcbiAgICBUT0tFTl9MSVNULFxuICAgIFRBR19JTkRFWCxcbiAgICBIQVNfTk9fU1BBQ0UsXG59XG5cbi8qKlxuICogQGVuIEludGVybmFsIGRlbGltaXRlcnMgZGVmaW5pdGlvbiBmb3IgW1tUZW1wbGF0ZUVuZ2luZV1dLiBleCkgWyd7eycsJ319J10gb3IgJ3t7IH19J1xuICogQGphIFtbVGVtcGxhdGVFbmdpbmVdXSDjga7lhoXpg6jjgafkvb/nlKjjgZnjgovljLrliIfjgormloflrZcgZXgpIFsne3snLCd9fSddIG9yICd7eyB9fSdcbiAqL1xuZXhwb3J0IHR5cGUgRGVsaW1pdGVycyA9IHN0cmluZyB8IFRlbXBsYXRlVGFncztcblxuZXhwb3J0IGNvbnN0IGdsb2JhbFNldHRpbmdzID0ge1xuICAgIHRhZ3M6IFsne3snLCAnfX0nXSxcbiAgICBlc2NhcGU6IGVzY2FwZUhUTUwsXG59IGFzIHtcbiAgICB0YWdzOiBUZW1wbGF0ZVRhZ3M7XG4gICAgZXNjYXBlOiBUZW1wbGF0ZUVzY2FwZXI7XG4gICAgd3JpdGVyOiBUZW1wbGF0ZVdyaXRlcjtcbn07XG4iLCJpbXBvcnQge1xuICAgIFBsYWluT2JqZWN0LFxuICAgIGVuc3VyZU9iamVjdCxcbiAgICBnZXRHbG9iYWxOYW1lc3BhY2UsXG59IGZyb20gJ0BjZHAvY29yZS11dGlscyc7XG5pbXBvcnQgeyBUZW1wbGF0ZVRhZ3MgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIEBlbiBDYWNoZSBsb2NhdGlvbiBpbmZvcm1hdGlvbi5cbiAqIEBqYSDjgq3jg6Pjg4Pjgrfjg6Xjg63jgrHjg7zjgrfjg6fjg7Pmg4XloLFcbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gQ2FjaGVMb2NhdGlvbiB7XG4gICAgTkFNRVNQQUNFID0gJ0NEUF9ERUNMQVJFJyxcbiAgICBST09UICAgICAgPSAnVEVNUExBVEVfQ0FDSEUnLFxufVxuXG4vKipcbiAqIEBlbiBCdWlsZCBjYWNoZSBrZXkuXG4gKiBAamEg44Kt44Oj44OD44K344Ol44Kt44O844Gu55Sf5oiQXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENhY2hlS2V5KHRlbXBsYXRlOiBzdHJpbmcsIHRhZ3M6IFRlbXBsYXRlVGFncyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RlbXBsYXRlfToke3RhZ3Muam9pbignOicpfWA7XG59XG5cbi8qKlxuICogQGVuIENsZWFycyBhbGwgY2FjaGVkIHRlbXBsYXRlcyBpbiBjYWNoZSBwb29sLlxuICogQGphIOOBmeOBueOBpuOBruODhuODs+ODl+ODrOODvOODiOOCreODo+ODg+OCt+ODpeOCkuegtOajhFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJDYWNoZSgpOiB2b2lkIHtcbiAgICBjb25zdCBuYW1lc3BhY2UgPSBnZXRHbG9iYWxOYW1lc3BhY2UoQ2FjaGVMb2NhdGlvbi5OQU1FU1BBQ0UpO1xuICAgIG5hbWVzcGFjZVtDYWNoZUxvY2F0aW9uLlJPT1RdID0ge307XG59XG5cbi8qKiBnbG9iYWwgY2FjaGUgcG9vbCAqL1xuZXhwb3J0IGNvbnN0IGNhY2hlID0gZW5zdXJlT2JqZWN0PFBsYWluT2JqZWN0PihudWxsLCBDYWNoZUxvY2F0aW9uLk5BTUVTUEFDRSwgQ2FjaGVMb2NhdGlvbi5ST09UKTtcbiIsImltcG9ydCB7IGlzQXJyYXksIGlzUHJpbWl0aXZlIH0gZnJvbSAnQGNkcC9jb3JlLXV0aWxzJztcbmV4cG9ydCB7XG4gICAgUGxhaW5PYmplY3QsXG4gICAgaXNTdHJpbmcsXG4gICAgaXNBcnJheSxcbiAgICBpc0Z1bmN0aW9uLFxuICAgIGhhcyxcbiAgICBlc2NhcGVIVE1MLFxufSBmcm9tICdAY2RwL2NvcmUtdXRpbHMnO1xuXG4vKipcbiAqIE1vcmUgY29ycmVjdCB0eXBlb2Ygc3RyaW5nIGhhbmRsaW5nIGFycmF5XG4gKiB3aGljaCBub3JtYWxseSByZXR1cm5zIHR5cGVvZiAnb2JqZWN0J1xuICovXG5leHBvcnQgZnVuY3Rpb24gdHlwZVN0cmluZyhzcmM6IHVua25vd24pOiBzdHJpbmcge1xuICAgIHJldHVybiBpc0FycmF5KHNyYykgPyAnYXJyYXknIDogdHlwZW9mIHNyYztcbn1cblxuLyoqXG4gKiBFc2NhcGUgZm9yIHRlbXBsYXRlJ3MgZXhwcmVzc2lvbiBjaGFyYWN0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlVGVtcGxhdGVFeHAoc3JjOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgIHJldHVybiBzcmMucmVwbGFjZSgvWy1cXFtcXF17fSgpKis/LixcXFxcXFxeJHwjXFxzXS9nLCAnXFxcXCQmJyk7XG59XG5cbi8qKlxuICogU2FmZSB3YXkgb2YgZGV0ZWN0aW5nIHdoZXRoZXIgb3Igbm90IHRoZSBnaXZlbiB0aGluZyBpcyBhIHByaW1pdGl2ZSBhbmRcbiAqIHdoZXRoZXIgaXQgaGFzIHRoZSBnaXZlbiBwcm9wZXJ0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJpbWl0aXZlSGFzT3duUHJvcGVydHkoc3JjOiB1bmtub3duLCBwcm9wTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzUHJpbWl0aXZlKHNyYykgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNyYywgcHJvcE5hbWUpO1xufVxuXG4vKipcbiAqIENoZWNrIHdoaXRlc3BhY2UgY2hhcmFjdG9yIGV4aXN0cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzV2hpdGVzcGFjZShzcmM6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhL1xcUy8udGVzdChzcmMpO1xufVxuIiwiaW1wb3J0IHsgVGVtcGxhdGVTY2FubmVyIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBBIHNpbXBsZSBzdHJpbmcgc2Nhbm5lciB0aGF0IGlzIHVzZWQgYnkgdGhlIHRlbXBsYXRlIHBhcnNlciB0byBmaW5kXG4gKiB0b2tlbnMgaW4gdGVtcGxhdGUgc3RyaW5ncy5cbiAqL1xuZXhwb3J0IGNsYXNzIFNjYW5uZXIgaW1wbGVtZW50cyBUZW1wbGF0ZVNjYW5uZXIge1xuICAgIHByaXZhdGUgX3NvdXJjZTogc3RyaW5nO1xuICAgIHByaXZhdGUgX3RhaWw6IHN0cmluZztcbiAgICBwcml2YXRlIF9wb3M6IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc3JjOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fc291cmNlID0gdGhpcy5fdGFpbCA9IHNyYztcbiAgICAgICAgdGhpcy5fcG9zID0gMDtcbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBwdWJsaWMgbWV0aG9kczpcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgY3VycmVudCBzY2FubmluZyBwb3NpdGlvbi5cbiAgICAgKi9cbiAgICBnZXQgcG9zKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wb3M7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBzdHJpbmcgIHNvdXJjZS5cbiAgICAgKi9cbiAgICBnZXQgc291cmNlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHRhaWwgaXMgZW1wdHkgKGVuZCBvZiBzdHJpbmcpLlxuICAgICAqL1xuICAgIGdldCBlb3MoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAnJyA9PT0gdGhpcy5fdGFpbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmllcyB0byBtYXRjaCB0aGUgZ2l2ZW4gcmVndWxhciBleHByZXNzaW9uIGF0IHRoZSBjdXJyZW50IHBvc2l0aW9uLlxuICAgICAqIFJldHVybnMgdGhlIG1hdGNoZWQgdGV4dCBpZiBpdCBjYW4gbWF0Y2gsIHRoZSBlbXB0eSBzdHJpbmcgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHNjYW4ocmVnZXhwOiBSZWdFeHApOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHJlZ2V4cC5leGVjKHRoaXMuX3RhaWwpO1xuXG4gICAgICAgIGlmICghbWF0Y2ggfHwgMCAhPT0gbWF0Y2guaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN0cmluZyA9IG1hdGNoWzBdO1xuXG4gICAgICAgIHRoaXMuX3RhaWwgPSB0aGlzLl90YWlsLnN1YnN0cmluZyhzdHJpbmcubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5fcG9zICs9IHN0cmluZy5sZW5ndGg7XG5cbiAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTa2lwcyBhbGwgdGV4dCB1bnRpbCB0aGUgZ2l2ZW4gcmVndWxhciBleHByZXNzaW9uIGNhbiBiZSBtYXRjaGVkLiBSZXR1cm5zXG4gICAgICogdGhlIHNraXBwZWQgc3RyaW5nLCB3aGljaCBpcyB0aGUgZW50aXJlIHRhaWwgaWYgbm8gbWF0Y2ggY2FuIGJlIG1hZGUuXG4gICAgICovXG4gICAgc2NhblVudGlsKHJlZ2V4cDogUmVnRXhwKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl90YWlsLnNlYXJjaChyZWdleHApO1xuICAgICAgICBsZXQgbWF0Y2g6IHN0cmluZztcblxuICAgICAgICBzd2l0Y2ggKGluZGV4KSB7XG4gICAgICAgICAgICBjYXNlIC0xOlxuICAgICAgICAgICAgICAgIG1hdGNoID0gdGhpcy5fdGFpbDtcbiAgICAgICAgICAgICAgICB0aGlzLl90YWlsID0gJyc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSAnJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSB0aGlzLl90YWlsLnN1YnN0cmluZygwLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGFpbCA9IHRoaXMuX3RhaWwuc3Vic3RyaW5nKGluZGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3BvcyArPSBtYXRjaC5sZW5ndGg7XG5cbiAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH1cbn1cbiIsIi8qIGVzbGludC1kaXNhYmxlXG4gICBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuICovXG5cbmltcG9ydCB7IFRlbXBsYXRlQ29udGV4dCB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge1xuICAgIFBsYWluT2JqZWN0LFxuICAgIGlzRnVuY3Rpb24sXG4gICAgaGFzLFxuICAgIHByaW1pdGl2ZUhhc093blByb3BlcnR5LFxufSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgcmVuZGVyaW5nIGNvbnRleHQgYnkgd3JhcHBpbmcgYSB2aWV3IG9iamVjdCBhbmRcbiAqIG1haW50YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBwYXJlbnQgY29udGV4dC5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbnRleHQgaW1wbGVtZW50cyBUZW1wbGF0ZUNvbnRleHQge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX3ZpZXc6IFBsYWluT2JqZWN0O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX3BhcmVudD86IENvbnRleHQ7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfY2FjaGU6IFBsYWluT2JqZWN0O1xuXG4gICAgLyoqIGNvbnN0cnVjdG9yICovXG4gICAgY29uc3RydWN0b3IodmlldzogUGxhaW5PYmplY3QsIHBhcmVudENvbnRleHQ/OiBDb250ZXh0KSB7XG4gICAgICAgIHRoaXMuX3ZpZXcgICA9IHZpZXc7XG4gICAgICAgIHRoaXMuX2NhY2hlICA9IHsgJy4nOiB0aGlzLl92aWV3IH07XG4gICAgICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudENvbnRleHQ7XG4gICAgfVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gcHVibGljIG1ldGhvZHM6XG5cbiAgICAvKipcbiAgICAgKiBWaWV3IHBhcmFtZXRlciBnZXR0ZXIuXG4gICAgICovXG4gICAgZ2V0IHZpZXcoKTogUGxhaW5PYmplY3Qge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmlldztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGNvbnRleHQgdXNpbmcgdGhlIGdpdmVuIHZpZXcgd2l0aCB0aGlzIGNvbnRleHRcbiAgICAgKiBhcyB0aGUgcGFyZW50LlxuICAgICAqL1xuICAgIHB1c2godmlldzogUGxhaW5PYmplY3QpOiBDb250ZXh0IHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb250ZXh0KHZpZXcsIHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBuYW1lIGluIHRoaXMgY29udGV4dCwgdHJhdmVyc2luZ1xuICAgICAqIHVwIHRoZSBjb250ZXh0IGhpZXJhcmNoeSBpZiB0aGUgdmFsdWUgaXMgYWJzZW50IGluIHRoaXMgY29udGV4dCdzIHZpZXcuXG4gICAgICovXG4gICAgbG9va3VwKG5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIGNvbnN0IGNhY2hlID0gdGhpcy5fY2FjaGU7XG5cbiAgICAgICAgbGV0IHZhbHVlOiBhbnk7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY2FjaGUsIG5hbWUpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGNhY2hlW25hbWVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGNvbnRleHQ6IENvbnRleHQgfCB1bmRlZmluZWQgPSB0aGlzO1xuICAgICAgICAgICAgbGV0IGludGVybWVkaWF0ZVZhbHVlOiBQbGFpbk9iamVjdDtcbiAgICAgICAgICAgIGxldCBuYW1lczogc3RyaW5nW107XG4gICAgICAgICAgICBsZXQgaW5kZXg6IG51bWJlcjtcbiAgICAgICAgICAgIGxldCBsb29rdXBIaXQgPSBmYWxzZTtcblxuICAgICAgICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoMCA8IG5hbWUuaW5kZXhPZignLicpKSB7XG4gICAgICAgICAgICAgICAgICAgIGludGVybWVkaWF0ZVZhbHVlID0gY29udGV4dC5fdmlldztcbiAgICAgICAgICAgICAgICAgICAgbmFtZXMgPSBuYW1lLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVXNpbmcgdGhlIGRvdCBub3Rpb24gcGF0aCBpbiBgbmFtZWAsIHdlIGRlc2NlbmQgdGhyb3VnaCB0aGVcbiAgICAgICAgICAgICAgICAgICAgICogbmVzdGVkIG9iamVjdHMuXG4gICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAqIFRvIGJlIGNlcnRhaW4gdGhhdCB0aGUgbG9va3VwIGhhcyBiZWVuIHN1Y2Nlc3NmdWwsIHdlIGhhdmUgdG9cbiAgICAgICAgICAgICAgICAgICAgICogY2hlY2sgaWYgdGhlIGxhc3Qgb2JqZWN0IGluIHRoZSBwYXRoIGFjdHVhbGx5IGhhcyB0aGUgcHJvcGVydHlcbiAgICAgICAgICAgICAgICAgICAgICogd2UgYXJlIGxvb2tpbmcgZm9yLiBXZSBzdG9yZSB0aGUgcmVzdWx0IGluIGBsb29rdXBIaXRgLlxuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKiBUaGlzIGlzIHNwZWNpYWxseSBuZWNlc3NhcnkgZm9yIHdoZW4gdGhlIHZhbHVlIGhhcyBiZWVuIHNldCB0b1xuICAgICAgICAgICAgICAgICAgICAgKiBgdW5kZWZpbmVkYCBhbmQgd2Ugd2FudCB0byBhdm9pZCBsb29raW5nIHVwIHBhcmVudCBjb250ZXh0cy5cbiAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICogSW4gdGhlIGNhc2Ugd2hlcmUgZG90IG5vdGF0aW9uIGlzIHVzZWQsIHdlIGNvbnNpZGVyIHRoZSBsb29rdXBcbiAgICAgICAgICAgICAgICAgICAgICogdG8gYmUgc3VjY2Vzc2Z1bCBldmVuIGlmIHRoZSBsYXN0IFwib2JqZWN0XCIgaW4gdGhlIHBhdGggaXNcbiAgICAgICAgICAgICAgICAgICAgICogbm90IGFjdHVhbGx5IGFuIG9iamVjdCBidXQgYSBwcmltaXRpdmUgKGUuZy4sIGEgc3RyaW5nLCBvciBhblxuICAgICAgICAgICAgICAgICAgICAgKiBpbnRlZ2VyKSwgYmVjYXVzZSBpdCBpcyBzb21ldGltZXMgdXNlZnVsIHRvIGFjY2VzcyBhIHByb3BlcnR5XG4gICAgICAgICAgICAgICAgICAgICAqIG9mIGFuIGF1dG9ib3hlZCBwcmltaXRpdmUsIHN1Y2ggYXMgdGhlIGxlbmd0aCBvZiBhIHN0cmluZy5cbiAgICAgICAgICAgICAgICAgICAgICoqL1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAobnVsbCAhPSBpbnRlcm1lZGlhdGVWYWx1ZSAmJiBpbmRleCA8IG5hbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSBuYW1lcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9va3VwSGl0ID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXMoaW50ZXJtZWRpYXRlVmFsdWUsIG5hbWVzW2luZGV4XSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWl0aXZlSGFzT3duUHJvcGVydHkoaW50ZXJtZWRpYXRlVmFsdWUsIG5hbWVzW2luZGV4XSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJtZWRpYXRlVmFsdWUgPSBpbnRlcm1lZGlhdGVWYWx1ZVtuYW1lc1tpbmRleCsrXV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcm1lZGlhdGVWYWx1ZSA9IGNvbnRleHQuX3ZpZXdbbmFtZV07XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIE9ubHkgY2hlY2tpbmcgYWdhaW5zdCBgaGFzUHJvcGVydHlgLCB3aGljaCBhbHdheXMgcmV0dXJucyBgZmFsc2VgIGlmXG4gICAgICAgICAgICAgICAgICAgICAqIGBjb250ZXh0LnZpZXdgIGlzIG5vdCBhbiBvYmplY3QuIERlbGliZXJhdGVseSBvbWl0dGluZyB0aGUgY2hlY2tcbiAgICAgICAgICAgICAgICAgICAgICogYWdhaW5zdCBgcHJpbWl0aXZlSGFzT3duUHJvcGVydHlgIGlmIGRvdCBub3RhdGlvbiBpcyBub3QgdXNlZC5cbiAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICogQ29uc2lkZXIgdGhpcyBleGFtcGxlOlxuICAgICAgICAgICAgICAgICAgICAgKiBgYGBcbiAgICAgICAgICAgICAgICAgICAgICogTXVzdGFjaGUucmVuZGVyKFwiVGhlIGxlbmd0aCBvZiBhIGZvb3RiYWxsIGZpZWxkIGlzIHt7I2xlbmd0aH19e3tsZW5ndGh9fXt7L2xlbmd0aH19LlwiLCB7bGVuZ3RoOiBcIjEwMCB5YXJkc1wifSlcbiAgICAgICAgICAgICAgICAgICAgICogYGBgXG4gICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAqIElmIHdlIHdlcmUgdG8gY2hlY2sgYWxzbyBhZ2FpbnN0IGBwcmltaXRpdmVIYXNPd25Qcm9wZXJ0eWAsIGFzIHdlIGRvXG4gICAgICAgICAgICAgICAgICAgICAqIGluIHRoZSBkb3Qgbm90YXRpb24gY2FzZSwgdGhlbiByZW5kZXIgY2FsbCB3b3VsZCByZXR1cm46XG4gICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAqIFwiVGhlIGxlbmd0aCBvZiBhIGZvb3RiYWxsIGZpZWxkIGlzIDkuXCJcbiAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICogcmF0aGVyIHRoYW4gdGhlIGV4cGVjdGVkOlxuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKiBcIlRoZSBsZW5ndGggb2YgYSBmb290YmFsbCBmaWVsZCBpcyAxMDAgeWFyZHMuXCJcbiAgICAgICAgICAgICAgICAgICAgICoqL1xuICAgICAgICAgICAgICAgICAgICBsb29rdXBIaXQgPSBoYXMoY29udGV4dC5fdmlldywgbmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxvb2t1cEhpdCkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGludGVybWVkaWF0ZVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gY29udGV4dC5fcGFyZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYWNoZVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmNhbGwodGhpcy5fdmlldyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtcbiAgICBUb2tlbixcbiAgICBUb2tlbkFkZHJlc3MgYXMgJCxcbiAgICBEZWxpbWl0ZXJzLFxuICAgIGdsb2JhbFNldHRpbmdzLFxufSBmcm9tICcuL2ludGVybmFsJztcbmltcG9ydCB7XG4gICAgaXNTdHJpbmcsXG4gICAgaXNBcnJheSxcbiAgICBpc1doaXRlc3BhY2UsXG4gICAgZXNjYXBlVGVtcGxhdGVFeHAsXG59IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgU2Nhbm5lciB9IGZyb20gJy4vc2Nhbm5lcic7XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmNvbnN0IF9yZWdleHAgPSB7XG4gICAgd2hpdGU6IC9cXHMqLyxcbiAgICBzcGFjZTogL1xccysvLFxuICAgIGVxdWFsczogL1xccyo9LyxcbiAgICBjdXJseTogL1xccypcXH0vLFxuICAgIHRhZzogLyN8XFxefFxcL3w+fFxce3wmfD18IS8sXG59O1xuXG4vKipcbiAqIEBpbnRlcm5hbFxuICogQ29tYmluZXMgdGhlIHZhbHVlcyBvZiBjb25zZWN1dGl2ZSB0ZXh0IHRva2VucyBpbiB0aGUgZ2l2ZW4gYHRva2Vuc2AgYXJyYXkgdG8gYSBzaW5nbGUgdG9rZW4uXG4gKi9cbmZ1bmN0aW9uIHNxdWFzaFRva2Vucyh0b2tlbnM6IFRva2VuW10pOiBUb2tlbltdIHtcbiAgICBjb25zdCBzcXVhc2hlZFRva2VuczogVG9rZW5bXSA9IFtdO1xuXG4gICAgbGV0IGxhc3RUb2tlbiE6IFRva2VuO1xuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgICAgaWYgKCd0ZXh0JyA9PT0gdG9rZW5bJC5UWVBFXSAmJiBsYXN0VG9rZW4gJiYgJ3RleHQnID09PSBsYXN0VG9rZW5bJC5UWVBFXSkge1xuICAgICAgICAgICAgICAgIGxhc3RUb2tlblskLlZBTFVFXSArPSB0b2tlblskLlZBTFVFXTtcbiAgICAgICAgICAgICAgICBsYXN0VG9rZW5bJC5FTkRdID0gdG9rZW5bJC5FTkRdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcXVhc2hlZFRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzcXVhc2hlZFRva2Vucztcbn1cblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqIEZvcm1zIHRoZSBnaXZlbiBhcnJheSBvZiBgdG9rZW5zYCBpbnRvIGEgbmVzdGVkIHRyZWUgc3RydWN0dXJlIHdoZXJlXG4gKiB0b2tlbnMgdGhhdCByZXByZXNlbnQgYSBzZWN0aW9uIGhhdmUgdHdvIGFkZGl0aW9uYWwgaXRlbXM6IDEpIGFuIGFycmF5IG9mXG4gKiBhbGwgdG9rZW5zIHRoYXQgYXBwZWFyIGluIHRoYXQgc2VjdGlvbiBhbmQgMikgdGhlIGluZGV4IGluIHRoZSBvcmlnaW5hbFxuICogdGVtcGxhdGUgdGhhdCByZXByZXNlbnRzIHRoZSBlbmQgb2YgdGhhdCBzZWN0aW9uLlxuICovXG5mdW5jdGlvbiBuZXN0VG9rZW5zKHRva2VuczogVG9rZW5bXSk6IFRva2VuW10ge1xuICAgIGNvbnN0IG5lc3RlZFRva2VuczogVG9rZW5bXSA9IFtdO1xuICAgIGxldCBjb2xsZWN0b3IgPSBuZXN0ZWRUb2tlbnM7XG4gICAgY29uc3Qgc2VjdGlvbnM6IFRva2VuW10gPSBbXTtcblxuICAgIGxldCBzZWN0aW9uITogVG9rZW47XG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgICAgc3dpdGNoICh0b2tlblskLlRZUEVdKSB7XG4gICAgICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgIGNhc2UgJ14nOlxuICAgICAgICAgICAgICAgIGNvbGxlY3Rvci5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBzZWN0aW9ucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb2xsZWN0b3IgPSB0b2tlblskLlRPS0VOX0xJU1RdID0gW107XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcvJzpcbiAgICAgICAgICAgICAgICBzZWN0aW9uID0gc2VjdGlvbnMucG9wKCkgYXMgVG9rZW47XG4gICAgICAgICAgICAgICAgc2VjdGlvblskLlRBR19JTkRFWF0gPSB0b2tlblskLlNUQVJUXTtcbiAgICAgICAgICAgICAgICBjb2xsZWN0b3IgPSBzZWN0aW9ucy5sZW5ndGggPiAwID8gc2VjdGlvbnNbc2VjdGlvbnMubGVuZ3RoIC0gMV1bJC5UT0tFTl9MSVNUXSBhcyBUb2tlbltdIDogbmVzdGVkVG9rZW5zO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb2xsZWN0b3IucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5lc3RlZFRva2Vucztcbn1cblxuLyoqXG4gKiBCcmVha3MgdXAgdGhlIGdpdmVuIGB0ZW1wbGF0ZWAgc3RyaW5nIGludG8gYSB0cmVlIG9mIHRva2Vucy4gSWYgdGhlIGB0YWdzYFxuICogYXJndW1lbnQgaXMgZ2l2ZW4gaGVyZSBpdCBtdXN0IGJlIGFuIGFycmF5IHdpdGggdHdvIHN0cmluZyB2YWx1ZXM6IHRoZVxuICogb3BlbmluZyBhbmQgY2xvc2luZyB0YWdzIHVzZWQgaW4gdGhlIHRlbXBsYXRlIChlLmcuIFsgXCI8JVwiLCBcIiU+XCIgXSkuIE9mXG4gKiBjb3Vyc2UsIHRoZSBkZWZhdWx0IGlzIHRvIHVzZSBtdXN0YWNoZXMgKGkuZS4gbXVzdGFjaGUudGFncykuXG4gKlxuICogQSB0b2tlbiBpcyBhbiBhcnJheSB3aXRoIGF0IGxlYXN0IDQgZWxlbWVudHMuIFRoZSBmaXJzdCBlbGVtZW50IGlzIHRoZVxuICogbXVzdGFjaGUgc3ltYm9sIHRoYXQgd2FzIHVzZWQgaW5zaWRlIHRoZSB0YWcsIGUuZy4gXCIjXCIgb3IgXCImXCIuIElmIHRoZSB0YWdcbiAqIGRpZCBub3QgY29udGFpbiBhIHN5bWJvbCAoaS5lLiB7e215VmFsdWV9fSkgdGhpcyBlbGVtZW50IGlzIFwibmFtZVwiLiBGb3JcbiAqIGFsbCB0ZXh0IHRoYXQgYXBwZWFycyBvdXRzaWRlIGEgc3ltYm9sIHRoaXMgZWxlbWVudCBpcyBcInRleHRcIi5cbiAqXG4gKiBUaGUgc2Vjb25kIGVsZW1lbnQgb2YgYSB0b2tlbiBpcyBpdHMgXCJ2YWx1ZVwiLiBGb3IgbXVzdGFjaGUgdGFncyB0aGlzIGlzXG4gKiB3aGF0ZXZlciBlbHNlIHdhcyBpbnNpZGUgdGhlIHRhZyBiZXNpZGVzIHRoZSBvcGVuaW5nIHN5bWJvbC4gRm9yIHRleHQgdG9rZW5zXG4gKiB0aGlzIGlzIHRoZSB0ZXh0IGl0c2VsZi5cbiAqXG4gKiBUaGUgdGhpcmQgYW5kIGZvdXJ0aCBlbGVtZW50cyBvZiB0aGUgdG9rZW4gYXJlIHRoZSBzdGFydCBhbmQgZW5kIGluZGljZXMsXG4gKiByZXNwZWN0aXZlbHksIG9mIHRoZSB0b2tlbiBpbiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUuXG4gKlxuICogVG9rZW5zIHRoYXQgYXJlIHRoZSByb290IG5vZGUgb2YgYSBzdWJ0cmVlIGNvbnRhaW4gdHdvIG1vcmUgZWxlbWVudHM6IDEpIGFuXG4gKiBhcnJheSBvZiB0b2tlbnMgaW4gdGhlIHN1YnRyZWUgYW5kIDIpIHRoZSBpbmRleCBpbiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgYXRcbiAqIHdoaWNoIHRoZSBjbG9zaW5nIHRhZyBmb3IgdGhhdCBzZWN0aW9uIGJlZ2lucy5cbiAqXG4gKiBUb2tlbnMgZm9yIHBhcnRpYWxzIGFsc28gY29udGFpbiB0d28gbW9yZSBlbGVtZW50czogMSkgYSBzdHJpbmcgdmFsdWUgb2ZcbiAqIGluZGVuZGF0aW9uIHByaW9yIHRvIHRoYXQgdGFnIGFuZCAyKSB0aGUgaW5kZXggb2YgdGhhdCB0YWcgb24gdGhhdCBsaW5lIC1cbiAqIGVnIGEgdmFsdWUgb2YgMiBpbmRpY2F0ZXMgdGhlIHBhcnRpYWwgaXMgdGhlIHRoaXJkIHRhZyBvbiB0aGlzIGxpbmUuXG4gKlxuICogQHBhcmFtIHRlbXBsYXRlIHRlbXBsYXRlIHN0cmluZ1xuICogQHBhcmFtIHRhZ3MgZGVsaW1pdGVycyBleCkgWyd7eycsJ319J10gb3IgJ3t7IH19J1xuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZTogc3RyaW5nLCB0YWdzPzogRGVsaW1pdGVycyk6IFRva2VuW10ge1xuICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGxldCBsaW5lSGFzTm9uU3BhY2UgICAgID0gZmFsc2U7XG4gICAgY29uc3Qgc2VjdGlvbnM6IFRva2VuW10gPSBbXTsgICAgICAgLy8gU3RhY2sgdG8gaG9sZCBzZWN0aW9uIHRva2Vuc1xuICAgIGNvbnN0IHRva2VuczogVG9rZW5bXSAgID0gW107ICAgICAgIC8vIEJ1ZmZlciB0byBob2xkIHRoZSB0b2tlbnNcbiAgICBjb25zdCBzcGFjZXM6IG51bWJlcltdICA9IFtdOyAgICAgICAvLyBJbmRpY2VzIG9mIHdoaXRlc3BhY2UgdG9rZW5zIG9uIHRoZSBjdXJyZW50IGxpbmVcbiAgICBsZXQgaGFzVGFnICAgICAgICAgICAgICA9IGZhbHNlOyAgICAvLyBJcyB0aGVyZSBhIHt7dGFnfX0gb24gdGhlIGN1cnJlbnQgbGluZT9cbiAgICBsZXQgbm9uU3BhY2UgICAgICAgICAgICA9IGZhbHNlOyAgICAvLyBJcyB0aGVyZSBhIG5vbi1zcGFjZSBjaGFyIG9uIHRoZSBjdXJyZW50IGxpbmU/XG4gICAgbGV0IGluZGVudGF0aW9uICAgICAgICAgPSAnJzsgICAgICAgLy8gVHJhY2tzIGluZGVudGF0aW9uIGZvciB0YWdzIHRoYXQgdXNlIGl0XG4gICAgbGV0IHRhZ0luZGV4ICAgICAgICAgICAgPSAwOyAgICAgICAgLy8gU3RvcmVzIGEgY291bnQgb2YgbnVtYmVyIG9mIHRhZ3MgZW5jb3VudGVyZWQgb24gYSBsaW5lXG5cbiAgICAvLyBTdHJpcHMgYWxsIHdoaXRlc3BhY2UgdG9rZW5zIGFycmF5IGZvciB0aGUgY3VycmVudCBsaW5lXG4gICAgLy8gaWYgdGhlcmUgd2FzIGEge3sjdGFnfX0gb24gaXQgYW5kIG90aGVyd2lzZSBvbmx5IHNwYWNlLlxuICAgIGNvbnN0IHN0cmlwU3BhY2UgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGlmIChoYXNUYWcgJiYgIW5vblNwYWNlKSB7XG4gICAgICAgICAgICB3aGlsZSAoc3BhY2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0b2tlbnNbc3BhY2VzLnBvcCgpIGFzIG51bWJlcl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzcGFjZXMubGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgICAgICBoYXNUYWcgPSBmYWxzZTtcbiAgICAgICAgbm9uU3BhY2UgPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgY29uc3QgY29tcGlsZVRhZ3MgPSAodGFnc1RvQ29tcGlsZTogc3RyaW5nIHwgc3RyaW5nW10pOiB7IG9wZW5pbmdUYWc6IFJlZ0V4cDsgY2xvc2luZ1RhZzogUmVnRXhwOyBjbG9zaW5nQ3VybHk6IFJlZ0V4cDsgfSA9PiB7XG4gICAgICAgIGNvbnN0IGVudW0gVGFnIHtcbiAgICAgICAgICAgIE9QRU4gPSAwLFxuICAgICAgICAgICAgQ0xPU0UsXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzU3RyaW5nKHRhZ3NUb0NvbXBpbGUpKSB7XG4gICAgICAgICAgICB0YWdzVG9Db21waWxlID0gdGFnc1RvQ29tcGlsZS5zcGxpdChfcmVnZXhwLnNwYWNlLCAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNBcnJheSh0YWdzVG9Db21waWxlKSB8fCAyICE9PSB0YWdzVG9Db21waWxlLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHRhZ3M6ICR7SlNPTi5zdHJpbmdpZnkodGFnc1RvQ29tcGlsZSl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG9wZW5pbmdUYWc6ICAgbmV3IFJlZ0V4cChgJHtlc2NhcGVUZW1wbGF0ZUV4cCh0YWdzVG9Db21waWxlW1RhZy5PUEVOXSl9XFxcXHMqYCksXG4gICAgICAgICAgICBjbG9zaW5nVGFnOiAgIG5ldyBSZWdFeHAoYFxcXFxzKiR7ZXNjYXBlVGVtcGxhdGVFeHAodGFnc1RvQ29tcGlsZVtUYWcuQ0xPU0VdKX1gKSxcbiAgICAgICAgICAgIGNsb3NpbmdDdXJseTogbmV3IFJlZ0V4cChgXFxcXHMqJHtlc2NhcGVUZW1wbGF0ZUV4cChgfSR7dGFnc1RvQ29tcGlsZVtUYWcuQ0xPU0VdfWApfWApLFxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBjb25zdCB7IHRhZzogcmVUYWcsIHdoaXRlOiByZVdoaXRlLCBlcXVhbHM6IHJlRXF1YWxzLCBjdXJseTogcmVDdXJseSB9ID0gX3JlZ2V4cDtcbiAgICBsZXQgX3JlZ3hwVGFncyA9IGNvbXBpbGVUYWdzKHRhZ3MgfHwgZ2xvYmFsU2V0dGluZ3MudGFncyk7XG5cbiAgICBjb25zdCBzY2FubmVyID0gbmV3IFNjYW5uZXIodGVtcGxhdGUpO1xuXG4gICAgbGV0IG9wZW5TZWN0aW9uOiBUb2tlbiB8IHVuZGVmaW5lZDtcbiAgICB3aGlsZSAoIXNjYW5uZXIuZW9zKSB7XG4gICAgICAgIGNvbnN0IHsgb3BlbmluZ1RhZzogcmVPcGVuaW5nVGFnLCBjbG9zaW5nVGFnOiByZUNsb3NpbmdUYWcsIGNsb3NpbmdDdXJseTogcmVDbG9zaW5nQ3VybHkgfSA9IF9yZWd4cFRhZ3M7XG4gICAgICAgIGxldCB0b2tlbjogVG9rZW47XG4gICAgICAgIGxldCBzdGFydCA9IHNjYW5uZXIucG9zO1xuICAgICAgICAvLyBNYXRjaCBhbnkgdGV4dCBiZXR3ZWVuIHRhZ3MuXG4gICAgICAgIGxldCB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKHJlT3BlbmluZ1RhZyk7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIHZhbHVlTGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBpIDwgdmFsdWVMZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNociA9IHZhbHVlLmNoYXJBdChpKTtcblxuICAgICAgICAgICAgICAgIGlmIChpc1doaXRlc3BhY2UoY2hyKSkge1xuICAgICAgICAgICAgICAgICAgICBzcGFjZXMucHVzaCh0b2tlbnMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50YXRpb24gKz0gY2hyO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vblNwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgbGluZUhhc05vblNwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50YXRpb24gKz0gJyAnO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKFsndGV4dCcsIGNociwgc3RhcnQsIHN0YXJ0ICsgMV0pO1xuICAgICAgICAgICAgICAgIHN0YXJ0ICs9IDE7XG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3Igd2hpdGVzcGFjZSBvbiB0aGUgY3VycmVudCBsaW5lLlxuICAgICAgICAgICAgICAgIGlmICgnXFxuJyA9PT0gY2hyKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmlwU3BhY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50YXRpb24gPSAnJztcbiAgICAgICAgICAgICAgICAgICAgdGFnSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICBsaW5lSGFzTm9uU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNYXRjaCB0aGUgb3BlbmluZyB0YWcuXG4gICAgICAgIGlmICghc2Nhbm5lci5zY2FuKHJlT3BlbmluZ1RhZykpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaGFzVGFnID0gdHJ1ZTtcblxuICAgICAgICAvLyBHZXQgdGhlIHRhZyB0eXBlLlxuICAgICAgICBsZXQgdHlwZSA9IHNjYW5uZXIuc2NhbihyZVRhZykgfHwgJ25hbWUnO1xuICAgICAgICBzY2FubmVyLnNjYW4ocmVXaGl0ZSk7XG5cbiAgICAgICAgLy8gR2V0IHRoZSB0YWcgdmFsdWUuXG4gICAgICAgIGlmICgnPScgPT09IHR5cGUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gc2Nhbm5lci5zY2FuVW50aWwocmVFcXVhbHMpO1xuICAgICAgICAgICAgc2Nhbm5lci5zY2FuKHJlRXF1YWxzKTtcbiAgICAgICAgICAgIHNjYW5uZXIuc2NhblVudGlsKHJlQ2xvc2luZ1RhZyk7XG4gICAgICAgIH0gZWxzZSBpZiAoJ3snID09PSB0eXBlKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKHJlQ2xvc2luZ0N1cmx5KTtcbiAgICAgICAgICAgIHNjYW5uZXIuc2NhbihyZUN1cmx5KTtcbiAgICAgICAgICAgIHNjYW5uZXIuc2NhblVudGlsKHJlQ2xvc2luZ1RhZyk7XG4gICAgICAgICAgICB0eXBlID0gJyYnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgPSBzY2FubmVyLnNjYW5VbnRpbChyZUNsb3NpbmdUYWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWF0Y2ggdGhlIGNsb3NpbmcgdGFnLlxuICAgICAgICBpZiAoIXNjYW5uZXIuc2NhbihyZUNsb3NpbmdUYWcpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuY2xvc2VkIHRhZyBhdCAke3NjYW5uZXIucG9zfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCc+JyA9PT0gdHlwZSkge1xuICAgICAgICAgICAgdG9rZW4gPSBbdHlwZSwgdmFsdWUsIHN0YXJ0LCBzY2FubmVyLnBvcywgaW5kZW50YXRpb24sIHRhZ0luZGV4LCBsaW5lSGFzTm9uU3BhY2VdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9rZW4gPSBbdHlwZSwgdmFsdWUsIHN0YXJ0LCBzY2FubmVyLnBvc107XG4gICAgICAgIH1cbiAgICAgICAgdGFnSW5kZXgrKztcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuXG4gICAgICAgIGlmICgnIycgPT09IHR5cGUgfHwgJ14nID09PSB0eXBlKSB7XG4gICAgICAgICAgICBzZWN0aW9ucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfSBlbHNlIGlmICgnLycgPT09IHR5cGUpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIHNlY3Rpb24gbmVzdGluZy5cbiAgICAgICAgICAgIG9wZW5TZWN0aW9uID0gc2VjdGlvbnMucG9wKCk7XG4gICAgICAgICAgICBpZiAoIW9wZW5TZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbm9wZW5lZCBzZWN0aW9uIFwiJHt2YWx1ZX1cIiBhdCAke3N0YXJ0fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9wZW5TZWN0aW9uWzFdICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5jbG9zZWQgc2VjdGlvbiBcIiR7b3BlblNlY3Rpb25bJC5WQUxVRV19XCIgYXQgJHtzdGFydH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICgnbmFtZScgPT09IHR5cGUgfHwgJ3snID09PSB0eXBlIHx8ICcmJyA9PT0gdHlwZSkge1xuICAgICAgICAgICAgbm9uU3BhY2UgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKCc9JyA9PT0gdHlwZSkge1xuICAgICAgICAgICAgLy8gU2V0IHRoZSB0YWdzIGZvciB0aGUgbmV4dCB0aW1lIGFyb3VuZC5cbiAgICAgICAgICAgIF9yZWd4cFRhZ3MgPSBjb21waWxlVGFncyh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdHJpcFNwYWNlKCk7XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlcmUgYXJlIG5vIG9wZW4gc2VjdGlvbnMgd2hlbiB3ZSdyZSBkb25lLlxuICAgIG9wZW5TZWN0aW9uID0gc2VjdGlvbnMucG9wKCk7XG5cbiAgICBpZiAob3BlblNlY3Rpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmNsb3NlZCBzZWN0aW9uIFwiJHtvcGVuU2VjdGlvblskLlZBTFVFXX1cIiBhdCAke3NjYW5uZXIucG9zfWApO1xuICAgIH1cblxuICAgIHJldHVybiBuZXN0VG9rZW5zKHNxdWFzaFRva2Vucyh0b2tlbnMpKTtcbn1cbiIsImltcG9ydCB7IFRlbXBsYXRlVGFncywgVGVtcGxhdGVXcml0ZXIgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtcbiAgICBUb2tlbixcbiAgICBUb2tlbkFkZHJlc3MgYXMgJCxcbiAgICBnbG9iYWxTZXR0aW5ncyxcbn0gZnJvbSAnLi9pbnRlcm5hbCc7XG5pbXBvcnQgeyBjYWNoZSwgYnVpbGRDYWNoZUtleSB9IGZyb20gJy4vY2FjaGUnO1xuaW1wb3J0IHtcbiAgICBQbGFpbk9iamVjdCxcbiAgICBpc0FycmF5LFxuICAgIGlzRnVuY3Rpb24sXG59IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgcGFyc2VUZW1wbGF0ZSB9IGZyb20gJy4vcGFyc2UnO1xuaW1wb3J0IHsgQ29udGV4dCB9IGZyb20gJy4vY29udGV4dCc7XG5cbi8qKlxuICogQSBXcml0ZXIga25vd3MgaG93IHRvIHRha2UgYSBzdHJlYW0gb2YgdG9rZW5zIGFuZCByZW5kZXIgdGhlbSB0byBhXG4gKiBzdHJpbmcsIGdpdmVuIGEgY29udGV4dC4gSXQgYWxzbyBtYWludGFpbnMgYSBjYWNoZSBvZiB0ZW1wbGF0ZXMgdG9cbiAqIGF2b2lkIHRoZSBuZWVkIHRvIHBhcnNlIHRoZSBzYW1lIHRlbXBsYXRlIHR3aWNlLlxuICovXG5leHBvcnQgY2xhc3MgV3JpdGVyIGltcGxlbWVudHMgVGVtcGxhdGVXcml0ZXIge1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gcHVibGljIG1ldGhvZHM6XG5cbiAgICAvKipcbiAgICAgKiBQYXJzZXMgYW5kIGNhY2hlcyB0aGUgZ2l2ZW4gYHRlbXBsYXRlYCBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGB0YWdzYCBvclxuICAgICAqIGBtdXN0YWNoZS50YWdzYCBpZiBgdGFnc2AgaXMgb21pdHRlZCwgIGFuZCByZXR1cm5zIHRoZSBhcnJheSBvZiB0b2tlbnNcbiAgICAgKiB0aGF0IGlzIGdlbmVyYXRlZCBmcm9tIHRoZSBwYXJzZS5cbiAgICAgKi9cbiAgICBwYXJzZSh0ZW1wbGF0ZTogc3RyaW5nLCB0YWdzPzogVGVtcGxhdGVUYWdzKTogeyB0b2tlbnM6IFRva2VuW107IGNhY2hlS2V5OiBzdHJpbmc7IH0ge1xuICAgICAgICBjb25zdCBjYWNoZUtleSA9IGJ1aWxkQ2FjaGVLZXkodGVtcGxhdGUsIHRhZ3MgfHwgZ2xvYmFsU2V0dGluZ3MudGFncyk7XG4gICAgICAgIGxldCB0b2tlbnMgPSBjYWNoZVtjYWNoZUtleV07XG4gICAgICAgIGlmIChudWxsID09IHRva2Vucykge1xuICAgICAgICAgICAgdG9rZW5zID0gY2FjaGVbY2FjaGVLZXldID0gcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZSwgdGFncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgdG9rZW5zLCBjYWNoZUtleSB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhpZ2gtbGV2ZWwgbWV0aG9kIHRoYXQgaXMgdXNlZCB0byByZW5kZXIgdGhlIGdpdmVuIGB0ZW1wbGF0ZWAgd2l0aFxuICAgICAqIHRoZSBnaXZlbiBgdmlld2AuXG4gICAgICpcbiAgICAgKiBUaGUgb3B0aW9uYWwgYHBhcnRpYWxzYCBhcmd1bWVudCBtYXkgYmUgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlXG4gICAgICogbmFtZXMgYW5kIHRlbXBsYXRlcyBvZiBwYXJ0aWFscyB0aGF0IGFyZSB1c2VkIGluIHRoZSB0ZW1wbGF0ZS4gSXQgbWF5XG4gICAgICogYWxzbyBiZSBhIGZ1bmN0aW9uIHRoYXQgaXMgdXNlZCB0byBsb2FkIHBhcnRpYWwgdGVtcGxhdGVzIG9uIHRoZSBmbHlcbiAgICAgKiB0aGF0IHRha2VzIGEgc2luZ2xlIGFyZ3VtZW50OiB0aGUgbmFtZSBvZiB0aGUgcGFydGlhbC5cbiAgICAgKlxuICAgICAqIElmIHRoZSBvcHRpb25hbCBgdGFnc2AgYXJndW1lbnQgaXMgZ2l2ZW4gaGVyZSBpdCBtdXN0IGJlIGFuIGFycmF5IHdpdGggdHdvXG4gICAgICogc3RyaW5nIHZhbHVlczogdGhlIG9wZW5pbmcgYW5kIGNsb3NpbmcgdGFncyB1c2VkIGluIHRoZSB0ZW1wbGF0ZSAoZS5nLlxuICAgICAqIFsgXCI8JVwiLCBcIiU+XCIgXSkuIFRoZSBkZWZhdWx0IGlzIHRvIG11c3RhY2hlLnRhZ3MuXG4gICAgICovXG4gICAgcmVuZGVyKHRlbXBsYXRlOiBzdHJpbmcsIHZpZXc6IFBsYWluT2JqZWN0LCBwYXJ0aWFscz86IFBsYWluT2JqZWN0LCB0YWdzPzogVGVtcGxhdGVUYWdzKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgeyB0b2tlbnMgfSA9IHRoaXMucGFyc2UodGVtcGxhdGUsIHRhZ3MpO1xuICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5zLCB2aWV3LCBwYXJ0aWFscywgdGVtcGxhdGUsIHRhZ3MpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvdy1sZXZlbCBtZXRob2QgdGhhdCByZW5kZXJzIHRoZSBnaXZlbiBhcnJheSBvZiBgdG9rZW5zYCB1c2luZ1xuICAgICAqIHRoZSBnaXZlbiBgY29udGV4dGAgYW5kIGBwYXJ0aWFsc2AuXG4gICAgICpcbiAgICAgKiBOb3RlOiBUaGUgYG9yaWdpbmFsVGVtcGxhdGVgIGlzIG9ubHkgZXZlciB1c2VkIHRvIGV4dHJhY3QgdGhlIHBvcnRpb25cbiAgICAgKiBvZiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgdGhhdCB3YXMgY29udGFpbmVkIGluIGEgaGlnaGVyLW9yZGVyIHNlY3Rpb24uXG4gICAgICogSWYgdGhlIHRlbXBsYXRlIGRvZXNuJ3QgdXNlIGhpZ2hlci1vcmRlciBzZWN0aW9ucywgdGhpcyBhcmd1bWVudCBtYXlcbiAgICAgKiBiZSBvbWl0dGVkLlxuICAgICAqL1xuICAgIHJlbmRlclRva2Vucyh0b2tlbnM6IFRva2VuW10sIHZpZXc6IFBsYWluT2JqZWN0LCBwYXJ0aWFscz86IFBsYWluT2JqZWN0LCBvcmlnaW5hbFRlbXBsYXRlPzogc3RyaW5nLCB0YWdzPzogVGVtcGxhdGVUYWdzKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY29udGV4dCA9ICh2aWV3IGluc3RhbmNlb2YgQ29udGV4dCkgPyB2aWV3IDogbmV3IENvbnRleHQodmlldyk7XG4gICAgICAgIGxldCBidWZmZXIgPSAnJztcblxuICAgICAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgICAgICAgICAgbGV0IHZhbHVlOiBzdHJpbmcgfCB2b2lkO1xuICAgICAgICAgICAgc3dpdGNoICh0b2tlblskLlRZUEVdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5yZW5kZXJTZWN0aW9uKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ14nOlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMucmVuZGVySW52ZXJ0ZWQodG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5yZW5kZXJQYXJ0aWFsKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgdGFncyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMudW5lc2NhcGVkVmFsdWUodG9rZW4sIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICduYW1lJzpcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmVzY2FwZWRWYWx1ZSh0b2tlbiwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMucmF3VmFsdWUodG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG51bGwgIT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBidWZmZXIgKz0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgIH1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHByaXZhdGUgbWV0aG9kczpcblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcml2YXRlIHJlbmRlclNlY3Rpb24odG9rZW46IFRva2VuLCBjb250ZXh0OiBDb250ZXh0LCBwYXJ0aWFscz86IFBsYWluT2JqZWN0LCBvcmlnaW5hbFRlbXBsYXRlPzogc3RyaW5nKTogc3RyaW5nIHwgdm9pZCB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgYnVmZmVyID0gJyc7XG4gICAgICAgIGxldCB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuWyQuVkFMVUVdKTtcblxuICAgICAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gcmVuZGVyIGFuIGFyYml0cmFyeSB0ZW1wbGF0ZVxuICAgICAgICAvLyBpbiB0aGUgY3VycmVudCBjb250ZXh0IGJ5IGhpZ2hlci1vcmRlciBzZWN0aW9ucy5cbiAgICAgICAgY29uc3Qgc3ViUmVuZGVyID0gKHRlbXBsYXRlOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYucmVuZGVyKHRlbXBsYXRlLCBjb250ZXh0LCBwYXJ0aWFscyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHYgb2YgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBidWZmZXIgKz0gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bJC5UT0tFTl9MSVNUXSBhcyBUb2tlbltdLCBjb250ZXh0LnB1c2godiksIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICgnb2JqZWN0JyA9PT0gdHlwZW9mIHZhbHVlIHx8ICdzdHJpbmcnID09PSB0eXBlb2YgdmFsdWUgfHwgJ251bWJlcicgPT09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgICAgYnVmZmVyICs9IHRoaXMucmVuZGVyVG9rZW5zKHRva2VuWyQuVE9LRU5fTElTVF0gYXMgVG9rZW5bXSwgY29udGV4dC5wdXNoKHZhbHVlKSwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgICAgICBpZiAoJ3N0cmluZycgIT09IHR5cGVvZiBvcmlnaW5hbFRlbXBsYXRlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgdXNlIGhpZ2hlci1vcmRlciBzZWN0aW9ucyB3aXRob3V0IHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRXh0cmFjdCB0aGUgcG9ydGlvbiBvZiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgdGhhdCB0aGUgc2VjdGlvbiBjb250YWlucy5cbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuY2FsbChjb250ZXh0LnZpZXcsIG9yaWdpbmFsVGVtcGxhdGUuc2xpY2UodG9rZW5bJC5FTkRdLCB0b2tlblskLlRBR19JTkRFWF0pLCBzdWJSZW5kZXIpO1xuICAgICAgICAgICAgaWYgKG51bGwgIT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBidWZmZXIgKz0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidWZmZXIgKz0gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bJC5UT0tFTl9MSVNUXSBhcyBUb2tlbltdLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICB9XG5cbiAgICAvKiogQGludGVybmFsICovXG4gICAgcHJpdmF0ZSByZW5kZXJJbnZlcnRlZCh0b2tlbjogVG9rZW4sIGNvbnRleHQ6IENvbnRleHQsIHBhcnRpYWxzPzogUGxhaW5PYmplY3QsIG9yaWdpbmFsVGVtcGxhdGU/OiBzdHJpbmcpOiBzdHJpbmcgfCB2b2lkIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBjb250ZXh0Lmxvb2t1cCh0b2tlblskLlZBTFVFXSk7XG4gICAgICAgIGlmICghdmFsdWUgfHwgKGlzQXJyYXkodmFsdWUpICYmIDAgPT09IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlclRva2Vucyh0b2tlblskLlRPS0VOX0xJU1RdIGFzIFRva2VuW10sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcml2YXRlIGluZGVudFBhcnRpYWwocGFydGlhbDogc3RyaW5nLCBpbmRlbnRhdGlvbjogc3RyaW5nLCBsaW5lSGFzTm9uU3BhY2U6IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBmaWx0ZXJlZEluZGVudGF0aW9uID0gaW5kZW50YXRpb24ucmVwbGFjZSgvW14gXFx0XS9nLCAnJyk7XG4gICAgICAgIGNvbnN0IHBhcnRpYWxCeU5sID0gcGFydGlhbC5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFydGlhbEJ5TmwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChwYXJ0aWFsQnlObFtpXS5sZW5ndGggJiYgKGkgPiAwIHx8ICFsaW5lSGFzTm9uU3BhY2UpKSB7XG4gICAgICAgICAgICAgICAgcGFydGlhbEJ5TmxbaV0gPSBmaWx0ZXJlZEluZGVudGF0aW9uICsgcGFydGlhbEJ5TmxbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcnRpYWxCeU5sLmpvaW4oJ1xcbicpO1xuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcml2YXRlIHJlbmRlclBhcnRpYWwodG9rZW46IFRva2VuLCBjb250ZXh0OiBDb250ZXh0LCBwYXJ0aWFsczogUGxhaW5PYmplY3QgfCB1bmRlZmluZWQsIHRhZ3M6IFRlbXBsYXRlVGFncyB8IHVuZGVmaW5lZCk6IHN0cmluZyB8IHZvaWQge1xuICAgICAgICBpZiAoIXBhcnRpYWxzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2YWx1ZSA9IGlzRnVuY3Rpb24ocGFydGlhbHMpID8gcGFydGlhbHModG9rZW5bJC5WQUxVRV0pIDogcGFydGlhbHNbdG9rZW5bJC5WQUxVRV1dO1xuICAgICAgICBpZiAobnVsbCAhPSB2YWx1ZSkge1xuICAgICAgICAgICAgY29uc3QgbGluZUhhc05vblNwYWNlID0gdG9rZW5bJC5IQVNfTk9fU1BBQ0VdO1xuICAgICAgICAgICAgY29uc3QgdGFnSW5kZXggICAgICAgID0gdG9rZW5bJC5UQUdfSU5ERVhdO1xuICAgICAgICAgICAgY29uc3QgaW5kZW50YXRpb24gICAgID0gdG9rZW5bJC5UT0tFTl9MSVNUXTtcbiAgICAgICAgICAgIGxldCBpbmRlbnRlZFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICBpZiAoMCA9PT0gdGFnSW5kZXggJiYgaW5kZW50YXRpb24pIHtcbiAgICAgICAgICAgICAgICBpbmRlbnRlZFZhbHVlID0gdGhpcy5pbmRlbnRQYXJ0aWFsKHZhbHVlLCBpbmRlbnRhdGlvbiBhcyBzdHJpbmcsIGxpbmVIYXNOb25TcGFjZSBhcyBib29sZWFuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHsgdG9rZW5zIH0gPSB0aGlzLnBhcnNlKGluZGVudGVkVmFsdWUsIHRhZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyVG9rZW5zKHRva2VucywgY29udGV4dCwgcGFydGlhbHMsIGluZGVudGVkVmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByaXZhdGUgdW5lc2NhcGVkVmFsdWUodG9rZW46IFRva2VuLCBjb250ZXh0OiBDb250ZXh0KTogc3RyaW5nIHwgdm9pZCB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gY29udGV4dC5sb29rdXAodG9rZW5bJC5WQUxVRV0pO1xuICAgICAgICBpZiAobnVsbCAhPSB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByaXZhdGUgZXNjYXBlZFZhbHVlKHRva2VuOiBUb2tlbiwgY29udGV4dDogQ29udGV4dCk6IHN0cmluZyB8IHZvaWQge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuWyQuVkFMVUVdKTtcbiAgICAgICAgaWYgKG51bGwgIT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBnbG9iYWxTZXR0aW5ncy5lc2NhcGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByaXZhdGUgcmF3VmFsdWUodG9rZW46IFRva2VuKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRva2VuWyQuVkFMVUVdO1xuICAgIH1cbn1cbiIsImltcG9ydCB7XG4gICAgSlNULFxuICAgIFRlbXBsYXRlVGFncyxcbiAgICBJVGVtcGxhdGVFbmdpbmUsXG4gICAgVGVtcGxhdGVTY2FubmVyLFxuICAgIFRlbXBsYXRlQ29udGV4dCxcbiAgICBUZW1wbGF0ZVdyaXRlcixcbiAgICBUZW1wbGF0ZUVzY2FwZXIsXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBnbG9iYWxTZXR0aW5ncyB9IGZyb20gJy4vaW50ZXJuYWwnO1xuaW1wb3J0IHsgQ2FjaGVMb2NhdGlvbiwgY2xlYXJDYWNoZSB9IGZyb20gJy4vY2FjaGUnO1xuaW1wb3J0IHtcbiAgICBQbGFpbk9iamVjdCxcbiAgICBpc1N0cmluZyxcbiAgICB0eXBlU3RyaW5nLFxufSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IFNjYW5uZXIgfSBmcm9tICcuL3NjYW5uZXInO1xuaW1wb3J0IHsgQ29udGV4dCB9IGZyb20gJy4vY29udGV4dCc7XG5pbXBvcnQgeyBXcml0ZXIgfSBmcm9tICcuL3dyaXRlcic7XG5cbi8qKiBbW1RlbXBsYXRlRW5naW5lXV0gY29tbW9uIHNldHRpbmdzICovXG5nbG9iYWxTZXR0aW5ncy53cml0ZXIgPSBuZXcgV3JpdGVyKCk7XG5cbi8qKlxuICogQGVuIFtbVGVtcGxhdGVFbmdpbmVdXSBnbG9iYWwgc2V0dG5nIG9wdGlvbnNcbiAqIEBqYSBbW1RlbXBsYXRlRW5naW5lXV0g44Kw44Ot44O844OQ44Or6Kit5a6a44Kq44OX44K344On44OzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVHbG9iYWxTZXR0aW5ncyB7XG4gICAgd3JpdGVyPzogVGVtcGxhdGVXcml0ZXI7XG4gICAgdGFncz86IFRlbXBsYXRlVGFncztcbiAgICBlc2NhcGU/OiBUZW1wbGF0ZUVzY2FwZXI7XG59XG5cbi8qKlxuICogQGVuIFtbVGVtcGxhdGVFbmdpbmVdXSBjb21waWxlIG9wdGlvbnNcbiAqIEBqYSBbW1RlbXBsYXRlRW5naW5lXV0g44Kz44Oz44OR44Kk44Or44Kq44OX44K344On44OzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVDb21waWxlT3B0aW9ucyB7XG4gICAgdGFncz86IFRlbXBsYXRlVGFncztcbn1cblxuLyoqXG4gKiBAZW4gVGVtcGxhdGVFbmdpbmUgdXRpbGl0eSBjbGFzcy5cbiAqIEBqYSBUZW1wbGF0ZUVuZ2luZSDjg6bjg7zjg4bjgqPjg6rjg4bjgqPjgq/jg6njgrlcbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlRW5naW5lIGltcGxlbWVudHMgSVRlbXBsYXRlRW5naW5lIHtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHB1YmxpYyBzdGF0aWMgbWV0aG9kczpcblxuICAgIC8qKlxuICAgICAqIEBlbiBHZXQgW1tKU1RdXSBmcm9tIHRlbXBsYXRlIHNvdXJjZS5cbiAgICAgKiBAamEg44OG44Oz44OX44Os44O844OI5paH5a2X5YiX44GL44KJIFtbSlNUXV0g44KS5Y+W5b6XXG4gICAgICpcbiAgICAgKiBAcGFja2FnZSB0ZW1wbGF0ZVxuICAgICAqICAtIGBlbmAgdGVtcGxhdGUgc291cmNlIHN0cmluZ1xuICAgICAqICAtIGBqYWAg44OG44Oz44OX44Os44O844OI5paH5a2X5YiXXG4gICAgICogQHBhY2thZ2Ugb3B0aW9uc1xuICAgICAqICAtIGBlbmAgY29tcGlsZSBvcHRpb25zXG4gICAgICogIC0gYGphYCDjgrPjg7Pjg5HjgqTjg6vjgqrjg5fjgrfjg6fjg7NcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNvbXBpbGUodGVtcGxhdGU6IHN0cmluZywgb3B0aW9ucz86IFRlbXBsYXRlQ29tcGlsZU9wdGlvbnMpOiBKU1Qge1xuICAgICAgICBpZiAoIWlzU3RyaW5nKHRlbXBsYXRlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW52YWxpZCB0ZW1wbGF0ZSEgdGhlIGZpcnN0IGFyZ3VtZW50IHNob3VsZCBiZSBhIFwic3RyaW5nXCIgYnV0IFwiJHt0eXBlU3RyaW5nKHRlbXBsYXRlKX1cIiB3YXMgZ2l2ZW4gZm9yIFRlbXBsYXRlRW5naW5lLmNvbXBpbGUodGVtcGxhdGUsIG9wdGlvbnMpYCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7IHRhZ3MgfSA9IG9wdGlvbnMgfHwgZ2xvYmFsU2V0dGluZ3M7XG4gICAgICAgIGNvbnN0IHsgd3JpdGVyIH0gPSBnbG9iYWxTZXR0aW5ncztcblxuICAgICAgICBjb25zdCBqc3QgPSAodmlldz86IFBsYWluT2JqZWN0LCBwYXJ0aWFscz86IFBsYWluT2JqZWN0KTogc3RyaW5nID0+IHtcbiAgICAgICAgICAgIHJldHVybiB3cml0ZXIucmVuZGVyKHRlbXBsYXRlLCB2aWV3IHx8IHt9LCBwYXJ0aWFscywgdGFncyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgeyB0b2tlbnMsIGNhY2hlS2V5IH0gPSB3cml0ZXIucGFyc2UodGVtcGxhdGUsIHRhZ3MpO1xuICAgICAgICBqc3QudG9rZW5zICAgICAgICA9IHRva2VucztcbiAgICAgICAganN0LmNhY2hlS2V5ICAgICAgPSBjYWNoZUtleTtcbiAgICAgICAganN0LmNhY2hlTG9jYXRpb24gPSBbQ2FjaGVMb2NhdGlvbi5OQU1FU1BBQ0UsIENhY2hlTG9jYXRpb24uUk9PVF07XG5cbiAgICAgICAgcmV0dXJuIGpzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQ2xlYXJzIGFsbCBjYWNoZWQgdGVtcGxhdGVzIGluIHRoZSBkZWZhdWx0IFtbVGVtcGxhdGVXcml0ZXJdXS5cbiAgICAgKiBAamEg5pei5a6a44GuIFtbVGVtcGxhdGVXcml0ZXJdXSDjga7jgZnjgbnjgabjga7jgq3jg6Pjg4Pjgrfjg6XjgpLliYrpmaRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNsZWFyQ2FjaGUoKTogdm9pZCB7XG4gICAgICAgIGNsZWFyQ2FjaGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZW4gQ2hhbmdlIFtbVGVtcGxhdGVFbmdpbmVdXSBnbG9iYWwgc2V0dGluZ3MuXG4gICAgICogQGphIFtbVGVtcGxhdGVFbmdpbmVdXSDjgrDjg63jg7zjg5Djg6voqK3lrprjga7mm7TmlrBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzZXR0aW5nc1xuICAgICAqICAtIGBlbmAgbmV3IHNldHRpbmdzXG4gICAgICogIC0gYGphYCDmlrDjgZfjgYToqK3lrprlgKRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqICAtIGBlbmAgb2xkIHNldHRpbmdzXG4gICAgICogIC0gYGphYCDlj6TjgYToqK3lrprlgKRcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHNldEdsb2JhbFNldHRpbmdzKHNldGlpbmdzOiBUZW1wbGF0ZUdsb2JhbFNldHRpbmdzKTogVGVtcGxhdGVHbG9iYWxTZXR0aW5ncyB7XG4gICAgICAgIGNvbnN0IG9sZFNldHRpbmdzID0geyAuLi5nbG9iYWxTZXR0aW5ncyB9O1xuICAgICAgICBjb25zdCB7IHdyaXRlciwgdGFncywgZXNjYXBlIH0gPSBzZXRpaW5ncztcbiAgICAgICAgd3JpdGVyICYmIChnbG9iYWxTZXR0aW5ncy53cml0ZXIgPSB3cml0ZXIpO1xuICAgICAgICB0YWdzICAgJiYgKGdsb2JhbFNldHRpbmdzLnRhZ3MgICA9IHRhZ3MpO1xuICAgICAgICBlc2NhcGUgJiYgKGdsb2JhbFNldHRpbmdzLmVzY2FwZSA9IGVzY2FwZSk7XG4gICAgICAgIHJldHVybiBvbGRTZXR0aW5ncztcbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBwdWJsaWMgc3RhdGljIG1ldGhvZHM6IGZvciBkZWJ1Z1xuXG4gICAgLyoqIEBpbnRlcm5hbCBDcmVhdGUgW1tUZW1wbGF0ZVNjYW5uZXJdXSBpbnN0YW5jZSAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlU2Nhbm5lcihzcmM6IHN0cmluZyk6IFRlbXBsYXRlU2Nhbm5lciB7XG4gICAgICAgIHJldHVybiBuZXcgU2Nhbm5lcihzcmMpO1xuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgQ3JlYXRlIFtbVGVtcGxhdGVDb250ZXh0XV0gaW5zdGFuY2UgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUNvbnRleHQodmlldzogUGxhaW5PYmplY3QsIHBhcmVudENvbnRleHQ/OiBDb250ZXh0KTogVGVtcGxhdGVDb250ZXh0IHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb250ZXh0KHZpZXcsIHBhcmVudENvbnRleHQpO1xuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgQ3JlYXRlIFtbVGVtcGxhdGVXcml0ZXJdXSBpbnN0YW5jZSAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlV3JpdGVyKCk6IFRlbXBsYXRlV3JpdGVyIHtcbiAgICAgICAgcmV0dXJuIG5ldyBXcml0ZXIoKTtcbiAgICB9XG59XG4iXSwibmFtZXMiOlsic2V0VGltZW91dCIsImNsZWFyVGltZW91dCIsIl90b2tlbnMiLCJfcHJveHlIYW5kbGVyIiwiaXNOdW1iZXIiLCJjYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztHQUFBOzs7Ozs7OztZQVFnQixTQUFTOztPQUVyQixPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sVUFBVSxJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztHQUNyRixDQUFDO0dBRUQ7Ozs7Ozs7Ozs7O1lBV2dCLFlBQVksQ0FBb0IsTUFBcUIsRUFBRSxHQUFHLEtBQWU7T0FDckYsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLFNBQVMsRUFBRSxDQUFDO09BQ2pDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1dBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1dBQzlCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckI7T0FDRCxPQUFPLElBQVMsQ0FBQztHQUNyQixDQUFDO0dBRUQ7Ozs7WUFJZ0Isa0JBQWtCLENBQW9CLFNBQWlCO09BQ25FLE9BQU8sWUFBWSxDQUFJLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztHQUM1QyxDQUFDO0dBRUQ7Ozs7OztZQU1nQixTQUFTLENBQW9CLFNBQVMsR0FBRyxLQUFLLEVBQUUsVUFBVSxHQUFHLFFBQVE7T0FDakYsT0FBTyxZQUFZLENBQUksa0JBQWtCLENBQUMsU0FBUyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7R0FDdEU7O0dDakRBOzs7R0E4SkEs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
