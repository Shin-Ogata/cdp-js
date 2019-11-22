import {
    Nillable,
    exists,
    isNil,
    isString,
    isNumber,
    isBoolean,
    isSymbol,
    isPrimitive,
    isArray,
    isObject,
    isPlainObject,
    isEmptyObject,
    isFunction,
    typeOf,
    isIterable,
    isTypedArray,
    instanceOf,
    ownInstanceOf,
    className,
    sameType,
    sameClass,
} from '@cdp/core-utils';
//import { isNil } from './_testee';

class TypeClass {
    public say(): string { return 'hello'; }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('utils/types spec', (): void => {
    beforeEach((): void => {
        // noop.
    });
    afterEach((): void => {
        // noop.
    });

    const _symbol = Symbol('symbol:type');
    const _classInst = new TypeClass();

    it('check exists()', (): void => {
        let val: Nillable<any>;
        expect(exists(val)).toBeFalsy();
        val = undefined;
        expect(exists(val)).toBeFalsy();
        val = null;
        expect(exists(val)).toBeFalsy();

        val = '';
        expect(exists(val)).toBeTruthy();
        val = false;
        expect(exists(val)).toBeTruthy();
        val = 0;
        expect(exists(val)).toBeTruthy();
        val = {};
        expect(exists(val)).toBeTruthy();
        val = [];
        expect(exists(val)).toBeTruthy();
        val = _symbol;
        expect(exists(val)).toBeTruthy();
        val = TypeClass;
        expect(exists(val)).toBeTruthy();
        val = _classInst;
        expect(exists(val)).toBeTruthy();
    });

    it('check isNil()', (): void => {
        let val: Nillable<any>;
        expect(isNil(val)).toBeTruthy();
        val = undefined;
        expect(isNil(val)).toBeTruthy();
        val = null;
        expect(isNil(val)).toBeTruthy();

        val = '';
        expect(isNil(val)).toBeFalsy();
        val = false;
        expect(isNil(val)).toBeFalsy();
        val = 0;
        expect(isNil(val)).toBeFalsy();
        val = {};
        expect(isNil(val)).toBeFalsy();
        val = [];
        expect(isNil(val)).toBeFalsy();
        val = _symbol;
        expect(isNil(val)).toBeFalsy();
        val = TypeClass;
        expect(isNil(val)).toBeFalsy();
        val = _classInst;
        expect(isNil(val)).toBeFalsy();
    });

    it('check isString()', (): void => {
        expect(isString(undefined)).toBeFalsy();
        expect(isString(null)).toBeFalsy();
        expect(isString('')).toBeTruthy();
        expect(isString('hoge')).toBeTruthy();
        expect(isString(true)).toBeFalsy();
        expect(isString(false)).toBeFalsy();
        expect(isString(0)).toBeFalsy();
        expect(isString(1)).toBeFalsy();
        expect(isString(Infinity)).toBeFalsy();
        expect(isString(NaN)).toBeFalsy();
        expect(isString({})).toBeFalsy();
        expect(isString([])).toBeFalsy();
        expect(isString(() => { return 1; })).toBeFalsy();
        expect(isString(_symbol)).toBeFalsy();
        expect(isString(TypeClass)).toBeFalsy();
        expect(isString(_classInst)).toBeFalsy();
    });

    it('check isNumber()', (): void => {
        expect(isNumber(undefined)).toBeFalsy();
        expect(isNumber(null)).toBeFalsy();
        expect(isNumber('')).toBeFalsy();
        expect(isNumber('hoge')).toBeFalsy();
        expect(isNumber(true)).toBeFalsy();
        expect(isNumber(false)).toBeFalsy();
        expect(isNumber(0)).toBeTruthy();
        expect(isNumber(1)).toBeTruthy();
        expect(isNumber(Infinity)).toBeTruthy();
        expect(isNumber(NaN)).toBeTruthy();
        expect(isNumber({})).toBeFalsy();
        expect(isNumber([])).toBeFalsy();
        expect(isNumber(() => { return 1; })).toBeFalsy();
        expect(isNumber(_symbol)).toBeFalsy();
        expect(isNumber(TypeClass)).toBeFalsy();
        expect(isNumber(_classInst)).toBeFalsy();
    });

    it('check isBoolean()', (): void => {
        expect(isBoolean(undefined)).toBeFalsy();
        expect(isBoolean(null)).toBeFalsy();
        expect(isBoolean('')).toBeFalsy();
        expect(isBoolean('hoge')).toBeFalsy();
        expect(isBoolean(true)).toBeTruthy();
        expect(isBoolean(false)).toBeTruthy();
        expect(isBoolean(0)).toBeFalsy();
        expect(isBoolean(1)).toBeFalsy();
        expect(isBoolean(Infinity)).toBeFalsy();
        expect(isBoolean(NaN)).toBeFalsy();
        expect(isBoolean({})).toBeFalsy();
        expect(isBoolean([])).toBeFalsy();
        expect(isBoolean(() => { return 1; })).toBeFalsy();
        expect(isBoolean(_symbol)).toBeFalsy();
        expect(isBoolean(TypeClass)).toBeFalsy();
        expect(isBoolean(_classInst)).toBeFalsy();
    });

    it('check isSymbol()', (): void => {
        expect(isSymbol(undefined)).toBeFalsy();
        expect(isSymbol(null)).toBeFalsy();
        expect(isSymbol('')).toBeFalsy();
        expect(isSymbol('hoge')).toBeFalsy();
        expect(isSymbol(true)).toBeFalsy();
        expect(isSymbol(false)).toBeFalsy();
        expect(isSymbol(0)).toBeFalsy();
        expect(isSymbol(1)).toBeFalsy();
        expect(isSymbol(Infinity)).toBeFalsy();
        expect(isSymbol(NaN)).toBeFalsy();
        expect(isSymbol({})).toBeFalsy();
        expect(isSymbol([])).toBeFalsy();
        expect(isSymbol(() => { return 1; })).toBeFalsy();
        expect(isSymbol(_symbol)).toBeTruthy();
        expect(isSymbol(TypeClass)).toBeFalsy();
        expect(isSymbol(_classInst)).toBeFalsy();
    });

    it('check isPrimitive()', (): void => {
        expect(isPrimitive(undefined)).toBeTruthy();
        expect(isPrimitive(null)).toBeTruthy();
        expect(isPrimitive('')).toBeTruthy();
        expect(isPrimitive('hoge')).toBeTruthy();
        expect(isPrimitive(true)).toBeTruthy();
        expect(isPrimitive(false)).toBeTruthy();
        expect(isPrimitive(0)).toBeTruthy();
        expect(isPrimitive(1)).toBeTruthy();
        expect(isPrimitive(Infinity)).toBeTruthy();
        expect(isPrimitive(NaN)).toBeTruthy();
        expect(isPrimitive({})).toBeFalsy();
        expect(isPrimitive([])).toBeFalsy();
        expect(isPrimitive(() => { return 1; })).toBeFalsy();
        expect(isPrimitive(_symbol)).toBeTruthy();
        expect(isPrimitive(TypeClass)).toBeFalsy();
        expect(isPrimitive(_classInst)).toBeFalsy();
    });

    it('check isArray()', (...args: any[]): void => {
        expect(isArray(undefined)).toBeFalsy();
        expect(isArray(null)).toBeFalsy();
        expect(isArray('')).toBeFalsy();
        expect(isArray('hoge')).toBeFalsy();
        expect(isArray(true)).toBeFalsy();
        expect(isArray(false)).toBeFalsy();
        expect(isArray(0)).toBeFalsy();
        expect(isArray(1)).toBeFalsy();
        expect(isArray(Infinity)).toBeFalsy();
        expect(isArray(NaN)).toBeFalsy();
        expect(isArray({})).toBeFalsy();
        expect(isArray([])).toBeTruthy();
        expect(isArray(args)).toBeTruthy();
        expect(isArray(() => { return 1; })).toBeFalsy();
        expect(isArray(_symbol)).toBeFalsy();
        expect(isArray(TypeClass)).toBeFalsy();
        expect(isArray(_classInst)).toBeFalsy();
    });

    it('check isObject()', (): void => {
        expect(isObject(undefined)).toBeFalsy();
        expect(isObject(null)).toBeFalsy();
        expect(isObject('')).toBeFalsy();
        expect(isObject('hoge')).toBeFalsy();
        expect(isObject(true)).toBeFalsy();
        expect(isObject(false)).toBeFalsy();
        expect(isObject(0)).toBeFalsy();
        expect(isObject(1)).toBeFalsy();
        expect(isObject(Infinity)).toBeFalsy();
        expect(isObject(NaN)).toBeFalsy();
        expect(isObject({})).toBeTruthy();
        expect(isObject([])).toBeTruthy();
        expect(isObject(() => { return 1; })).toBeFalsy();
        expect(isObject(_symbol)).toBeFalsy();
        expect(isObject(TypeClass)).toBeFalsy();
        expect(isObject(_classInst)).toBeTruthy();
    });

    it('check isPlainObject()', (): void => {
        expect(isPlainObject(undefined)).toBeFalsy();
        expect(isPlainObject(null)).toBeFalsy();
        expect(isPlainObject('')).toBeFalsy();
        expect(isPlainObject('hoge')).toBeFalsy();
        expect(isPlainObject(true)).toBeFalsy();
        expect(isPlainObject(false)).toBeFalsy();
        expect(isPlainObject(0)).toBeFalsy();
        expect(isPlainObject(1)).toBeFalsy();
        expect(isPlainObject(Infinity)).toBeFalsy();
        expect(isPlainObject(NaN)).toBeFalsy();
        expect(isPlainObject({})).toBeTruthy();
        expect(isPlainObject([])).toBeFalsy();
        expect(isPlainObject(() => { return 1; })).toBeFalsy();
        expect(isPlainObject(_symbol)).toBeFalsy();
        expect(isPlainObject(TypeClass)).toBeFalsy();
        expect(isPlainObject(_classInst)).toBeFalsy();
        expect(isPlainObject(document)).toBeFalsy();
        expect(isPlainObject(Object.create(null))).toBeTruthy();
    });

    it('check isEmptyObject()', (): void => {
        expect(isEmptyObject(undefined)).toBeFalsy();
        expect(isEmptyObject(null)).toBeFalsy();
        expect(isEmptyObject('')).toBeFalsy();
        expect(isEmptyObject('hoge')).toBeFalsy();
        expect(isEmptyObject(true)).toBeFalsy();
        expect(isEmptyObject(false)).toBeFalsy();
        expect(isEmptyObject(0)).toBeFalsy();
        expect(isEmptyObject(1)).toBeFalsy();
        expect(isEmptyObject(Infinity)).toBeFalsy();
        expect(isEmptyObject(NaN)).toBeFalsy();
        expect(isEmptyObject({})).toBeTruthy();
        expect(isEmptyObject({ name: 'hoge' })).toBeFalsy();
        expect(isEmptyObject([])).toBeFalsy();
        expect(isEmptyObject(() => { return 1; })).toBeFalsy();
        expect(isEmptyObject(_symbol)).toBeFalsy();
        expect(isEmptyObject(TypeClass)).toBeFalsy();
        expect(isEmptyObject(_classInst)).toBeFalsy();
        expect(isEmptyObject(document)).toBeFalsy();
        expect(isEmptyObject(Object.create(null))).toBeTruthy();
    });

    it('check isFunction()', (): void => {
        expect(isFunction(undefined)).toBeFalsy();
        expect(isFunction(null)).toBeFalsy();
        expect(isFunction('')).toBeFalsy();
        expect(isFunction('hoge')).toBeFalsy();
        expect(isFunction(true)).toBeFalsy();
        expect(isFunction(false)).toBeFalsy();
        expect(isFunction(0)).toBeFalsy();
        expect(isFunction(1)).toBeFalsy();
        expect(isFunction(Infinity)).toBeFalsy();
        expect(isFunction(NaN)).toBeFalsy();
        expect(isFunction({})).toBeFalsy();
        expect(isFunction([])).toBeFalsy();
        expect(isFunction(() => { return 1; })).toBeTruthy();
        expect(isFunction(_symbol)).toBeFalsy();
        expect(isFunction(TypeClass)).toBeTruthy();
        expect(isFunction(_classInst)).toBeFalsy();
    });

    it('check typeOf()', (): void => {
        expect(typeOf('string', undefined)).toBeFalsy();
        expect(typeOf('string', '')).toBeTruthy();
        expect(typeOf('string', 'hoge')).toBeTruthy();
        expect(typeOf('number', undefined)).toBeFalsy();
        expect(typeOf('number', 0)).toBeTruthy();
        expect(typeOf('number', 1)).toBeTruthy();
        expect(typeOf('boolean', undefined)).toBeFalsy();
        expect(typeOf('boolean', true)).toBeTruthy();
        expect(typeOf('boolean', false)).toBeTruthy();
        expect(typeOf('symbol', undefined)).toBeFalsy();
        expect(typeOf('symbol', _symbol)).toBeTruthy();
        expect(typeOf('undefined', undefined)).toBeTruthy();
        expect(typeOf('undefined', void 0)).toBeTruthy();
        expect(typeOf('undefined', null)).toBeFalsy();
        expect(typeOf('object', undefined)).toBeFalsy();
        expect(typeOf('object', {})).toBeTruthy();
        expect(typeOf('object', [])).toBeTruthy();
        expect(typeOf('object', _classInst)).toBeTruthy();
        expect(typeOf('function', undefined)).toBeFalsy();
        expect(typeOf('function', () => { return 1; })).toBeTruthy();
        expect(typeOf('function', TypeClass)).toBeTruthy();
    });

    it('check isIterable()', (): void => {
        expect(isIterable(undefined)).toBeFalsy();
        expect(isIterable(null)).toBeFalsy();
        expect(isIterable('')).toBeTruthy();
        expect(isIterable('hoge')).toBeTruthy();
        expect(isIterable(true)).toBeFalsy();
        expect(isIterable(false)).toBeFalsy();
        expect(isIterable(0)).toBeFalsy();
        expect(isIterable(1)).toBeFalsy();
        expect(isIterable(Infinity)).toBeFalsy();
        expect(isIterable(NaN)).toBeFalsy();
        expect(isIterable({})).toBeFalsy();
        expect(isIterable([])).toBeTruthy();
        expect(isIterable(() => { return 1; })).toBeFalsy();
        expect(isIterable(_symbol)).toBeFalsy();
        expect(isIterable(TypeClass)).toBeFalsy();
        expect(isIterable(_classInst)).toBeFalsy();
    });

    it('check isTypedArray()', (): void => {
        expect(isTypedArray(undefined)).toBeFalsy();
        expect(isTypedArray(null)).toBeFalsy();
        expect(isTypedArray('')).toBeFalsy();
        expect(isTypedArray('hoge')).toBeFalsy();
        expect(isTypedArray(true)).toBeFalsy();
        expect(isTypedArray(false)).toBeFalsy();
        expect(isTypedArray(0)).toBeFalsy();
        expect(isTypedArray(1)).toBeFalsy();
        expect(isTypedArray(Infinity)).toBeFalsy();
        expect(isTypedArray(NaN)).toBeFalsy();
        expect(isTypedArray({})).toBeFalsy();
        expect(isTypedArray([])).toBeFalsy();
        expect(isTypedArray(() => { return 1; })).toBeFalsy();
        expect(isTypedArray(_symbol)).toBeFalsy();
        expect(isTypedArray(TypeClass)).toBeFalsy();
        expect(isTypedArray(_classInst)).toBeFalsy();
        expect(isTypedArray(new Int8Array(8))).toBeTruthy();
        expect(isTypedArray(new Uint8Array(8))).toBeTruthy();
        expect(isTypedArray(new Uint8ClampedArray(8))).toBeTruthy();
        expect(isTypedArray(new Int16Array(8))).toBeTruthy();
        expect(isTypedArray(new Uint16Array(8))).toBeTruthy();
        expect(isTypedArray(new Int32Array(8))).toBeTruthy();
        expect(isTypedArray(new Uint32Array(8))).toBeTruthy();
        expect(isTypedArray(new Float32Array(8))).toBeTruthy();
        expect(isTypedArray(new Float64Array(8))).toBeTruthy();
    });

    it('check instanceOf()', (): void => {
        expect(instanceOf(Object, undefined)).toBeFalsy();
        expect(instanceOf(Object, null)).toBeFalsy();
        expect(instanceOf(Object, '')).toBeFalsy();
        expect(instanceOf(Object, 'hoge')).toBeFalsy();
        expect(instanceOf(Object, true)).toBeFalsy();
        expect(instanceOf(Object, false)).toBeFalsy();
        expect(instanceOf(Object, 0)).toBeFalsy();
        expect(instanceOf(Object, 1)).toBeFalsy();
        expect(instanceOf(Object, Infinity)).toBeFalsy();
        expect(instanceOf(Object, NaN)).toBeFalsy();
        expect(instanceOf(Object, {})).toBeTruthy();
        expect(instanceOf(Object, [])).toBeTruthy();
        expect(instanceOf(Object, () => { return 1; })).toBeTruthy();
        expect(instanceOf(Object, _symbol)).toBeFalsy();
        expect(instanceOf(Object, TypeClass)).toBeTruthy();
        expect(instanceOf(Object, _classInst)).toBeTruthy();
    });

    it('check ownInstanceOf()', (): void => {
        expect(ownInstanceOf(Object, undefined)).toBeFalsy();
        expect(ownInstanceOf(Object, null)).toBeFalsy();
        expect(ownInstanceOf(Object, '')).toBeFalsy();
        expect(ownInstanceOf(Object, 'hoge')).toBeFalsy();
        expect(ownInstanceOf(Object, true)).toBeFalsy();
        expect(ownInstanceOf(Object, false)).toBeFalsy();
        expect(ownInstanceOf(Object, 0)).toBeFalsy();
        expect(ownInstanceOf(Object, 1)).toBeFalsy();
        expect(ownInstanceOf(Object, Infinity)).toBeFalsy();
        expect(ownInstanceOf(Object, NaN)).toBeFalsy();
        expect(ownInstanceOf(Object, {})).toBeTruthy();
        expect(ownInstanceOf(Object, [])).toBeFalsy();
        expect(ownInstanceOf(Object, () => { return 1; })).toBeFalsy();
        expect(ownInstanceOf(Object, _symbol)).toBeFalsy();
        expect(ownInstanceOf(Object, TypeClass)).toBeFalsy();
        expect(ownInstanceOf(Object, _classInst)).toBeFalsy();
        expect(ownInstanceOf(TypeClass, _classInst)).toBeTruthy();
    });

    it('check className()', (): void => {
        expect(className(undefined)).toBe('Undefined');
        expect(className(null)).toBe('Null');
        expect(className('')).toBe('String');
        expect(className('hoge')).toBe('String');
        expect(className(true)).toBe('Boolean');
        expect(className(false)).toBe('Boolean');
        expect(className(0)).toBe('Number');
        expect(className(1)).toBe('Number');
        expect(className(Infinity)).toBe('Number');
        expect(className(NaN)).toBe('Number');
        expect(className({})).toBe('Object');
        expect(className([])).toBe('Array');
        expect(className(() => { return 1; })).toBe('Function');
        expect(className(_symbol)).toBe('Symbol');
        expect(className(TypeClass)).toBe('TypeClass');
        expect(className(_classInst)).toBe('TypeClass');
        expect(className(Object.create(null))).toBe('Object');
        expect(className(setTimeout)).toBe('Function');
        expect(className(Math)).toBe('Math');
        expect(className(/^$/)).toBe('RegExp');
        expect(className(new Date())).toBe('Date');
    });

    it('check sameType()', (): void => {
        expect(sameType(undefined, undefined)).toBeTruthy();
        expect(sameType(undefined, void 0)).toBeTruthy();
        expect(sameType(undefined, null)).toBeFalsy();
        expect(sameType(undefined, Object)).toBeFalsy();
        expect(sameType(null, null)).toBeTruthy();
        expect(sameType(null, undefined)).toBeFalsy();
        expect(sameType(null, void 0)).toBeFalsy();
        expect(sameType(null, Object)).toBeFalsy();
        expect(sameType('', '')).toBeTruthy();
        expect(sameType('', 'hoge')).toBeTruthy();
        expect(sameType('', String(null))).toBeTruthy();
        expect(sameType('', undefined)).toBeFalsy();
        expect(sameType('', null)).toBeFalsy();
        expect(sameType('', Object)).toBeFalsy();
        expect(sameType(false, false)).toBeTruthy();
        expect(sameType(false, true)).toBeTruthy();
        expect(sameType(false, Boolean(null))).toBeTruthy();
        expect(sameType(false, undefined)).toBeFalsy();
        expect(sameType(false, null)).toBeFalsy();
        expect(sameType(false, Object)).toBeFalsy();
        expect(sameType(0, 0)).toBeTruthy();
        expect(sameType(0, 1)).toBeTruthy();
        expect(sameType(0, Number(null))).toBeTruthy();
        expect(sameType(0, undefined)).toBeFalsy();
        expect(sameType(0, null)).toBeFalsy();
        expect(sameType(0, Object)).toBeFalsy();
        expect(sameType({}, {})).toBeTruthy();
        expect(sameType({}, [])).toBeTruthy();
        expect(sameType({}, Object(undefined))).toBeTruthy();
        expect(sameType({}, undefined)).toBeFalsy();
        expect(sameType({}, null)).toBeTruthy();
        expect(sameType({}, Object)).toBeFalsy();
        expect(sameType({}, _symbol)).toBeFalsy();
        expect(sameType({}, TypeClass)).toBeFalsy();
        expect(sameType({}, _classInst)).toBeTruthy();
        expect(sameType([], [])).toBeTruthy();
        expect(sameType([], {})).toBeTruthy();
        expect(sameType([], Object(undefined))).toBeTruthy();
        expect(sameType([], undefined)).toBeFalsy();
        expect(sameType([], null)).toBeTruthy();
        expect(sameType([], Object)).toBeFalsy();
        expect(sameType(() => { }, () => { return 1; })).toBeTruthy();
        expect(sameType(() => { }, Function)).toBeTruthy();
        expect(sameType(() => { }, undefined)).toBeFalsy();
        expect(sameType(() => { }, null)).toBeFalsy();
        expect(sameType(() => { }, Object)).toBeTruthy();
        expect(sameType(() => { }, TypeClass)).toBeTruthy();
        expect(sameType(_symbol, _symbol)).toBeTruthy();
        expect(sameType(_symbol, Symbol('hoge'))).toBeTruthy();
        expect(sameType(_symbol, undefined)).toBeFalsy();
        expect(sameType(_symbol, null)).toBeFalsy();
        expect(sameType(_symbol, Symbol)).toBeFalsy();
    });

    it('check sameClass()', (): void => {
        expect(sameClass(undefined, undefined)).toBeTruthy();
        expect(sameClass(undefined, void 0)).toBeTruthy();
        expect(sameClass(undefined, null)).toBeFalsy();
        expect(sameClass(null, null)).toBeTruthy();
        expect(sameClass(null, undefined)).toBeFalsy();
        expect(sameClass(null, void 0)).toBeFalsy();
        expect(sameClass('', '')).toBeTruthy();
        expect(sameClass('', 'hoge')).toBeTruthy();
        expect(sameClass('', undefined)).toBeFalsy();
        expect(sameClass('', null)).toBeFalsy();
        expect(sameClass(false, false)).toBeTruthy();
        expect(sameClass(false, true)).toBeTruthy();
        expect(sameClass(false, undefined)).toBeFalsy();
        expect(sameClass(false, null)).toBeFalsy();
        expect(sameClass(0, 0)).toBeTruthy();
        expect(sameClass(0, 1)).toBeTruthy();
        expect(sameClass(0, undefined)).toBeFalsy();
        expect(sameClass(0, null)).toBeFalsy();
        expect(sameClass({}, {})).toBeTruthy();
        expect(sameClass({}, [])).toBeFalsy();
        expect(sameClass({}, undefined)).toBeFalsy();
        expect(sameClass({}, null)).toBeFalsy();
        expect(sameClass({}, Object)).toBeFalsy();
        expect(sameClass({}, _symbol)).toBeFalsy();
        expect(sameClass({}, TypeClass)).toBeFalsy();
        expect(sameClass({}, _classInst)).toBeFalsy();
        expect(sameClass(() => { }, () => { return 1; })).toBeTruthy();
        expect(sameClass(() => { }, Function)).toBeTruthy();
        expect(sameClass(() => { }, undefined)).toBeFalsy();
        expect(sameClass(() => { }, null)).toBeFalsy();
        expect(sameClass(() => { }, TypeClass)).toBeTruthy();
        expect(sameClass(_symbol, _symbol)).toBeTruthy();
        expect(sameClass(_symbol, undefined)).toBeFalsy();
        expect(sameClass(_symbol, null)).toBeFalsy();
        expect(sameClass(_symbol, Symbol)).toBeFalsy();
    });
});
