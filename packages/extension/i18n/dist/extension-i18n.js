/*!
 * @cdp/extension-i18n 0.9.5
 *   extension for internationalization
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.CDP = global.CDP || {}, global.CDP.Exension = global.CDP.Exension || {})));
}(this, (function (exports) { 'use strict';

  const consoleLogger = {
    type: 'logger',

    log(args) {
      this.output('log', args);
    },

    warn(args) {
      this.output('warn', args);
    },

    error(args) {
      this.output('error', args);
    },

    output(type, args) {
      /* eslint no-console: 0 */
      if (console && console[type]) console[type].apply(console, args);
    },
  };

  class Logger {
    constructor(concreteLogger, options = {}) {
      this.init(concreteLogger, options);
    }

    init(concreteLogger, options = {}) {
      this.prefix = options.prefix || 'i18next:';
      this.logger = concreteLogger || consoleLogger;
      this.options = options;
      this.debug = options.debug;
    }

    setDebug(bool) {
      this.debug = bool;
    }

    log(...args) {
      return this.forward(args, 'log', '', true);
    }

    warn(...args) {
      return this.forward(args, 'warn', '', true);
    }

    error(...args) {
      return this.forward(args, 'error', '');
    }

    deprecate(...args) {
      return this.forward(args, 'warn', 'WARNING DEPRECATED: ', true);
    }

    forward(args, lvl, prefix, debugOnly) {
      if (debugOnly && !this.debug) return null;
      if (typeof args[0] === 'string') args[0] = `${prefix}${this.prefix} ${args[0]}`;
      return this.logger[lvl](args);
    }

    create(moduleName) {
      return new Logger(this.logger, {
        ...{ prefix: `${this.prefix}:${moduleName}:` },
        ...this.options,
      });
    }
  }

  const baseLogger = new Logger();

  class EventEmitter {
    constructor() {
      this.observers = {};
    }

    on(events, listener) {
      events.split(' ').forEach(event => {
        this.observers[event] = this.observers[event] || [];
        this.observers[event].push(listener);
      });
      return this;
    }

    off(event, listener) {
      if (!this.observers[event]) return;
      if (!listener) {
        delete this.observers[event];
        return;
      }

      this.observers[event] = this.observers[event].filter(l => l !== listener);
    }

    emit(event, ...args) {
      if (this.observers[event]) {
        const cloned = [].concat(this.observers[event]);
        cloned.forEach(observer => {
          observer(...args);
        });
      }

      if (this.observers['*']) {
        const cloned = [].concat(this.observers['*']);
        cloned.forEach(observer => {
          observer.apply(observer, [event, ...args]);
        });
      }
    }
  }

  // http://lea.verou.me/2016/12/resolve-promises-externally-with-this-one-weird-trick/
  function defer() {
    let res;
    let rej;

    const promise = new Promise((resolve, reject) => {
      res = resolve;
      rej = reject;
    });

    promise.resolve = res;
    promise.reject = rej;

    return promise;
  }

  function makeString(object) {
    if (object == null) return '';
    /* eslint prefer-template: 0 */
    return '' + object;
  }

  function copy(a, s, t) {
    a.forEach(m => {
      if (s[m]) t[m] = s[m];
    });
  }

  function getLastOfPath(object, path, Empty) {
    function cleanKey(key) {
      return key && key.indexOf('###') > -1 ? key.replace(/###/g, '.') : key;
    }

    function canNotTraverseDeeper() {
      return !object || typeof object === 'string';
    }

    const stack = typeof path !== 'string' ? [].concat(path) : path.split('.');
    while (stack.length > 1) {
      if (canNotTraverseDeeper()) return {};

      const key = cleanKey(stack.shift());
      if (!object[key] && Empty) object[key] = new Empty();
      // prevent prototype pollution
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        object = object[key];
      } else {
        object = {};
      }
    }

    if (canNotTraverseDeeper()) return {};
    return {
      obj: object,
      k: cleanKey(stack.shift()),
    };
  }

  function setPath(object, path, newValue) {
    const { obj, k } = getLastOfPath(object, path, Object);

    obj[k] = newValue;
  }

  function pushPath(object, path, newValue, concat) {
    const { obj, k } = getLastOfPath(object, path, Object);

    obj[k] = obj[k] || [];
    if (concat) obj[k] = obj[k].concat(newValue);
    if (!concat) obj[k].push(newValue);
  }

  function getPath(object, path) {
    const { obj, k } = getLastOfPath(object, path);

    if (!obj) return undefined;
    return obj[k];
  }

  function getPathWithDefaults(data, defaultData, key) {
    const value = getPath(data, key);
    if (value !== undefined) {
      return value;
    }
    // Fallback to default values
    return getPath(defaultData, key);
  }

  function deepExtend(target, source, overwrite) {
    /* eslint no-restricted-syntax: 0 */
    for (const prop in source) {
      if (prop !== '__proto__' && prop !== 'constructor') {
        if (prop in target) {
          // If we reached a leaf string in target or source then replace with source or skip depending on the 'overwrite' switch
          if (
            typeof target[prop] === 'string' ||
            target[prop] instanceof String ||
            typeof source[prop] === 'string' ||
            source[prop] instanceof String
          ) {
            if (overwrite) target[prop] = source[prop];
          } else {
            deepExtend(target[prop], source[prop], overwrite);
          }
        } else {
          target[prop] = source[prop];
        }
      }
    }
    return target;
  }

  function regexEscape(str) {
    /* eslint no-useless-escape: 0 */
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }

  /* eslint-disable */
  var _entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  /* eslint-enable */

  function escape(data) {
    if (typeof data === 'string') {
      return data.replace(/[&<>"'\/]/g, s => _entityMap[s]);
    }

    return data;
  }

  const isIE10 =
    typeof window !== 'undefined' &&
    window.navigator &&
    window.navigator.userAgent &&
    window.navigator.userAgent.indexOf('MSIE') > -1;

  class ResourceStore extends EventEmitter {
    constructor(data, options = { ns: ['translation'], defaultNS: 'translation' }) {
      super();

      this.data = data || {};
      this.options = options;
      if (this.options.keySeparator === undefined) {
        this.options.keySeparator = '.';
      }
    }

    addNamespaces(ns) {
      if (this.options.ns.indexOf(ns) < 0) {
        this.options.ns.push(ns);
      }
    }

    removeNamespaces(ns) {
      const index = this.options.ns.indexOf(ns);
      if (index > -1) {
        this.options.ns.splice(index, 1);
      }
    }

    getResource(lng, ns, key, options = {}) {
      const keySeparator =
        options.keySeparator !== undefined ? options.keySeparator : this.options.keySeparator;

      let path = [lng, ns];
      if (key && typeof key !== 'string') path = path.concat(key);
      if (key && typeof key === 'string')
        path = path.concat(keySeparator ? key.split(keySeparator) : key);

      if (lng.indexOf('.') > -1) {
        path = lng.split('.');
      }

      return getPath(this.data, path);
    }

    addResource(lng, ns, key, value, options = { silent: false }) {
      let keySeparator = this.options.keySeparator;
      if (keySeparator === undefined) keySeparator = '.';

      let path = [lng, ns];
      if (key) path = path.concat(keySeparator ? key.split(keySeparator) : key);

      if (lng.indexOf('.') > -1) {
        path = lng.split('.');
        value = ns;
        ns = path[1];
      }

      this.addNamespaces(ns);

      setPath(this.data, path, value);

      if (!options.silent) this.emit('added', lng, ns, key, value);
    }

    addResources(lng, ns, resources, options = { silent: false }) {
      /* eslint no-restricted-syntax: 0 */
      for (const m in resources) {
        if (
          typeof resources[m] === 'string' ||
          Object.prototype.toString.apply(resources[m]) === '[object Array]'
        )
          this.addResource(lng, ns, m, resources[m], { silent: true });
      }
      if (!options.silent) this.emit('added', lng, ns, resources);
    }

    addResourceBundle(lng, ns, resources, deep, overwrite, options = { silent: false }) {
      let path = [lng, ns];
      if (lng.indexOf('.') > -1) {
        path = lng.split('.');
        deep = resources;
        resources = ns;
        ns = path[1];
      }

      this.addNamespaces(ns);

      let pack = getPath(this.data, path) || {};

      if (deep) {
        deepExtend(pack, resources, overwrite);
      } else {
        pack = { ...pack, ...resources };
      }

      setPath(this.data, path, pack);

      if (!options.silent) this.emit('added', lng, ns, resources);
    }

    removeResourceBundle(lng, ns) {
      if (this.hasResourceBundle(lng, ns)) {
        delete this.data[lng][ns];
      }
      this.removeNamespaces(ns);

      this.emit('removed', lng, ns);
    }

    hasResourceBundle(lng, ns) {
      return this.getResource(lng, ns) !== undefined;
    }

    getResourceBundle(lng, ns) {
      if (!ns) ns = this.options.defaultNS;

      // COMPATIBILITY: remove extend in v2.1.0
      if (this.options.compatibilityAPI === 'v1') return { ...{}, ...this.getResource(lng, ns) };

      return this.getResource(lng, ns);
    }

    getDataByLanguage(lng) {
      return this.data[lng];
    }

    toJSON() {
      return this.data;
    }
  }

  const postProcessor = {
    processors: {},

    addPostProcessor(module) {
      this.processors[module.name] = module;
    },

    handle(processors, value, key, options, translator) {
      processors.forEach(processor => {
        if (this.processors[processor])
          value = this.processors[processor].process(value, key, options, translator);
      });

      return value;
    },
  };

  const checkedLoadedFor = {};

  class Translator extends EventEmitter {
    constructor(services, options = {}) {
      super();

      copy(
        [
          'resourceStore',
          'languageUtils',
          'pluralResolver',
          'interpolator',
          'backendConnector',
          'i18nFormat',
          'utils',
        ],
        services,
        this,
      );

      this.options = options;
      if (this.options.keySeparator === undefined) {
        this.options.keySeparator = '.';
      }

      this.logger = baseLogger.create('translator');
    }

    changeLanguage(lng) {
      if (lng) this.language = lng;
    }

    exists(key, options = { interpolation: {} }) {
      const resolved = this.resolve(key, options);
      return resolved && resolved.res !== undefined;
    }

    extractFromKey(key, options) {
      let nsSeparator =
        options.nsSeparator !== undefined ? options.nsSeparator : this.options.nsSeparator;
      if (nsSeparator === undefined) nsSeparator = ':';

      const keySeparator =
        options.keySeparator !== undefined ? options.keySeparator : this.options.keySeparator;

      let namespaces = options.ns || this.options.defaultNS;
      if (nsSeparator && key.indexOf(nsSeparator) > -1) {
        const m = key.match(this.interpolator.nestingRegexp);
        if (m && m.length > 0) {
          return {
            key,
            namespaces,
          };
        }
        const parts = key.split(nsSeparator);
        if (
          nsSeparator !== keySeparator ||
          (nsSeparator === keySeparator && this.options.ns.indexOf(parts[0]) > -1)
        )
          namespaces = parts.shift();
        key = parts.join(keySeparator);
      }
      if (typeof namespaces === 'string') namespaces = [namespaces];

      return {
        key,
        namespaces,
      };
    }

    translate(keys, options, lastKey) {
      if (typeof options !== 'object' && this.options.overloadTranslationOptionHandler) {
        /* eslint prefer-rest-params: 0 */
        options = this.options.overloadTranslationOptionHandler(arguments);
      }
      if (!options) options = {};

      // non valid keys handling
      if (keys === undefined || keys === null /* || keys === ''*/) return '';
      if (!Array.isArray(keys)) keys = [String(keys)];

      // separators
      const keySeparator =
        options.keySeparator !== undefined ? options.keySeparator : this.options.keySeparator;

      // get namespace(s)
      const { key, namespaces } = this.extractFromKey(keys[keys.length - 1], options);
      const namespace = namespaces[namespaces.length - 1];

      // return key on CIMode
      const lng = options.lng || this.language;
      const appendNamespaceToCIMode =
        options.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
      if (lng && lng.toLowerCase() === 'cimode') {
        if (appendNamespaceToCIMode) {
          const nsSeparator = options.nsSeparator || this.options.nsSeparator;
          return namespace + nsSeparator + key;
        }

        return key;
      }

      // resolve from store
      const resolved = this.resolve(keys, options);
      let res = resolved && resolved.res;
      const resUsedKey = (resolved && resolved.usedKey) || key;
      const resExactUsedKey = (resolved && resolved.exactUsedKey) || key;

      const resType = Object.prototype.toString.apply(res);
      const noObject = ['[object Number]', '[object Function]', '[object RegExp]'];
      const joinArrays =
        options.joinArrays !== undefined ? options.joinArrays : this.options.joinArrays;

      // object
      const handleAsObjectInI18nFormat = !this.i18nFormat || this.i18nFormat.handleAsObject;
      const handleAsObject =
        typeof res !== 'string' && typeof res !== 'boolean' && typeof res !== 'number';
      if (
        handleAsObjectInI18nFormat &&
        res &&
        handleAsObject &&
        noObject.indexOf(resType) < 0 &&
        !(typeof joinArrays === 'string' && resType === '[object Array]')
      ) {
        if (!options.returnObjects && !this.options.returnObjects) {
          this.logger.warn('accessing an object - but returnObjects options is not enabled!');
          return this.options.returnedObjectHandler
            ? this.options.returnedObjectHandler(resUsedKey, res, options)
            : `key '${key} (${this.language})' returned an object instead of string.`;
        }

        // if we got a separator we loop over children - else we just return object as is
        // as having it set to false means no hierarchy so no lookup for nested values
        if (keySeparator) {
          const resTypeIsArray = resType === '[object Array]';
          const copy = resTypeIsArray ? [] : {}; // apply child translation on a copy

          /* eslint no-restricted-syntax: 0 */
          let newKeyToUse = resTypeIsArray ? resExactUsedKey : resUsedKey;
          for (const m in res) {
            if (Object.prototype.hasOwnProperty.call(res, m)) {
              const deepKey = `${newKeyToUse}${keySeparator}${m}`;
              copy[m] = this.translate(deepKey, {
                ...options,
                ...{ joinArrays: false, ns: namespaces },
              });
              if (copy[m] === deepKey) copy[m] = res[m]; // if nothing found use orginal value as fallback
            }
          }
          res = copy;
        }
      } else if (
        handleAsObjectInI18nFormat &&
        typeof joinArrays === 'string' &&
        resType === '[object Array]'
      ) {
        // array special treatment
        res = res.join(joinArrays);
        if (res) res = this.extendTranslation(res, keys, options, lastKey);
      } else {
        // string, empty or null
        let usedDefault = false;
        let usedKey = false;

        // fallback value
        if (!this.isValidLookup(res) && options.defaultValue !== undefined) {
          usedDefault = true;

          if (options.count !== undefined) {
            const suffix = this.pluralResolver.getSuffix(lng, options.count);
            res = options[`defaultValue${suffix}`];
          }
          if (!res) res = options.defaultValue;
        }
        if (!this.isValidLookup(res)) {
          usedKey = true;
          res = key;
        }

        // save missing
        const updateMissing =
          options.defaultValue && options.defaultValue !== res && this.options.updateMissing;
        if (usedKey || usedDefault || updateMissing) {
          this.logger.log(
            updateMissing ? 'updateKey' : 'missingKey',
            lng,
            namespace,
            key,
            updateMissing ? options.defaultValue : res,
          );
          if (keySeparator) {
            const fk = this.resolve(key, { ...options, keySeparator: false });
            if (fk && fk.res)
              this.logger.warn(
                'Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.',
              );
          }

          let lngs = [];
          const fallbackLngs = this.languageUtils.getFallbackCodes(
            this.options.fallbackLng,
            options.lng || this.language,
          );
          if (this.options.saveMissingTo === 'fallback' && fallbackLngs && fallbackLngs[0]) {
            for (let i = 0; i < fallbackLngs.length; i++) {
              lngs.push(fallbackLngs[i]);
            }
          } else if (this.options.saveMissingTo === 'all') {
            lngs = this.languageUtils.toResolveHierarchy(options.lng || this.language);
          } else {
            lngs.push(options.lng || this.language);
          }

          const send = (l, k) => {
            if (this.options.missingKeyHandler) {
              this.options.missingKeyHandler(
                l,
                namespace,
                k,
                updateMissing ? options.defaultValue : res,
                updateMissing,
                options,
              );
            } else if (this.backendConnector && this.backendConnector.saveMissing) {
              this.backendConnector.saveMissing(
                l,
                namespace,
                k,
                updateMissing ? options.defaultValue : res,
                updateMissing,
                options,
              );
            }
            this.emit('missingKey', l, namespace, k, res);
          };

          if (this.options.saveMissing) {
            const needsPluralHandling =
              options.count !== undefined && typeof options.count !== 'string';
            if (this.options.saveMissingPlurals && needsPluralHandling) {
              lngs.forEach(l => {
                const plurals = this.pluralResolver.getPluralFormsOfKey(l, key);

                plurals.forEach(p => send([l], p));
              });
            } else {
              send(lngs, key);
            }
          }
        }

        // extend
        res = this.extendTranslation(res, keys, options, resolved, lastKey);

        // append namespace if still key
        if (usedKey && res === key && this.options.appendNamespaceToMissingKey)
          res = `${namespace}:${key}`;

        // parseMissingKeyHandler
        if (usedKey && this.options.parseMissingKeyHandler)
          res = this.options.parseMissingKeyHandler(res);
      }

      // return
      return res;
    }

    extendTranslation(res, key, options, resolved, lastKey) {
      if (this.i18nFormat && this.i18nFormat.parse) {
        res = this.i18nFormat.parse(
          res,
          options,
          resolved.usedLng,
          resolved.usedNS,
          resolved.usedKey,
          { resolved },
        );
      } else if (!options.skipInterpolation) {
        // i18next.parsing
        if (options.interpolation)
          this.interpolator.init({
            ...options,
            ...{ interpolation: { ...this.options.interpolation, ...options.interpolation } },
          });
        const skipOnVariables =
          (options.interpolation && options.interpolation.skipOnVariables) ||
          this.options.interpolation.skipOnVariables;
        let nestBef;
        if (skipOnVariables) {
          const nb = res.match(this.interpolator.nestingRegexp);
          // has nesting aftbeforeer interpolation
          nestBef = nb && nb.length;
        }

        // interpolate
        let data = options.replace && typeof options.replace !== 'string' ? options.replace : options;
        if (this.options.interpolation.defaultVariables)
          data = { ...this.options.interpolation.defaultVariables, ...data };
        res = this.interpolator.interpolate(res, data, options.lng || this.language, options);

        // nesting
        if (skipOnVariables) {
          const na = res.match(this.interpolator.nestingRegexp);
          // has nesting after interpolation
          const nestAft = na && na.length;
          if (nestBef < nestAft) options.nest = false;
        }
        if (options.nest !== false)
          res = this.interpolator.nest(
            res,
            (...args) => {
              if (lastKey && lastKey[0] === args[0] && !options.context) {
                this.logger.warn(
                  `It seems you are nesting recursively key: ${args[0]} in key: ${key[0]}`,
                );
                return null;
              }
              return this.translate(...args, key);
            },
            options,
          );

        if (options.interpolation) this.interpolator.reset();
      }

      // post process
      const postProcess = options.postProcess || this.options.postProcess;
      const postProcessorNames = typeof postProcess === 'string' ? [postProcess] : postProcess;

      if (
        res !== undefined &&
        res !== null &&
        postProcessorNames &&
        postProcessorNames.length &&
        options.applyPostProcessor !== false
      ) {
        res = postProcessor.handle(
          postProcessorNames,
          res,
          key,
          this.options && this.options.postProcessPassResolved
            ? { i18nResolved: resolved, ...options }
            : options,
          this,
        );
      }

      return res;
    }

    resolve(keys, options = {}) {
      let found;
      let usedKey; // plain key
      let exactUsedKey; // key with context / plural
      let usedLng;
      let usedNS;

      if (typeof keys === 'string') keys = [keys];

      // forEach possible key
      keys.forEach(k => {
        if (this.isValidLookup(found)) return;
        const extracted = this.extractFromKey(k, options);
        const key = extracted.key;
        usedKey = key;
        let namespaces = extracted.namespaces;
        if (this.options.fallbackNS) namespaces = namespaces.concat(this.options.fallbackNS);

        const needsPluralHandling = options.count !== undefined && typeof options.count !== 'string';
        const needsContextHandling =
          options.context !== undefined &&
          typeof options.context === 'string' &&
          options.context !== '';

        const codes = options.lngs
          ? options.lngs
          : this.languageUtils.toResolveHierarchy(options.lng || this.language, options.fallbackLng);

        namespaces.forEach(ns => {
          if (this.isValidLookup(found)) return;
          usedNS = ns;

          if (
            !checkedLoadedFor[`${codes[0]}-${ns}`] &&
            this.utils &&
            this.utils.hasLoadedNamespace &&
            !this.utils.hasLoadedNamespace(usedNS)
          ) {
            checkedLoadedFor[`${codes[0]}-${ns}`] = true;
            this.logger.warn(
              `key "${usedKey}" for languages "${codes.join(
              ', ',
            )}" won't get resolved as namespace "${usedNS}" was not yet loaded`,
              'This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!',
            );
          }

          codes.forEach(code => {
            if (this.isValidLookup(found)) return;
            usedLng = code;

            let finalKey = key;
            const finalKeys = [finalKey];

            if (this.i18nFormat && this.i18nFormat.addLookupKeys) {
              this.i18nFormat.addLookupKeys(finalKeys, key, code, ns, options);
            } else {
              let pluralSuffix;
              if (needsPluralHandling)
                pluralSuffix = this.pluralResolver.getSuffix(code, options.count);

              // fallback for plural if context not found
              if (needsPluralHandling && needsContextHandling)
                finalKeys.push(finalKey + pluralSuffix);

              // get key for context if needed
              if (needsContextHandling)
                finalKeys.push((finalKey += `${this.options.contextSeparator}${options.context}`));

              // get key for plural if needed
              if (needsPluralHandling) finalKeys.push((finalKey += pluralSuffix));
            }

            // iterate over finalKeys starting with most specific pluralkey (-> contextkey only) -> singularkey only
            let possibleKey;
            /* eslint no-cond-assign: 0 */
            while ((possibleKey = finalKeys.pop())) {
              if (!this.isValidLookup(found)) {
                exactUsedKey = possibleKey;
                found = this.getResource(code, ns, possibleKey, options);
              }
            }
          });
        });
      });

      return { res: found, usedKey, exactUsedKey, usedLng, usedNS };
    }

    isValidLookup(res) {
      return (
        res !== undefined &&
        !(!this.options.returnNull && res === null) &&
        !(!this.options.returnEmptyString && res === '')
      );
    }

    getResource(code, ns, key, options = {}) {
      if (this.i18nFormat && this.i18nFormat.getResource)
        return this.i18nFormat.getResource(code, ns, key, options);
      return this.resourceStore.getResource(code, ns, key, options);
    }
  }

  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  class LanguageUtil {
    constructor(options) {
      this.options = options;

      // temporal backwards compatibility WHITELIST REMOVAL
      this.whitelist = this.options.supportedLngs || false;
      // end temporal backwards compatibility WHITELIST REMOVAL

      this.supportedLngs = this.options.supportedLngs || false;
      this.logger = baseLogger.create('languageUtils');
    }

    getScriptPartFromCode(code) {
      if (!code || code.indexOf('-') < 0) return null;

      const p = code.split('-');
      if (p.length === 2) return null;
      p.pop();
      if (p[p.length - 1].toLowerCase() === 'x') return null;
      return this.formatLanguageCode(p.join('-'));
    }

    getLanguagePartFromCode(code) {
      if (!code || code.indexOf('-') < 0) return code;

      const p = code.split('-');
      return this.formatLanguageCode(p[0]);
    }

    formatLanguageCode(code) {
      // http://www.iana.org/assignments/language-tags/language-tags.xhtml
      if (typeof code === 'string' && code.indexOf('-') > -1) {
        const specialCases = ['hans', 'hant', 'latn', 'cyrl', 'cans', 'mong', 'arab'];
        let p = code.split('-');

        if (this.options.lowerCaseLng) {
          p = p.map(part => part.toLowerCase());
        } else if (p.length === 2) {
          p[0] = p[0].toLowerCase();
          p[1] = p[1].toUpperCase();

          if (specialCases.indexOf(p[1].toLowerCase()) > -1) p[1] = capitalize(p[1].toLowerCase());
        } else if (p.length === 3) {
          p[0] = p[0].toLowerCase();

          // if lenght 2 guess it's a country
          if (p[1].length === 2) p[1] = p[1].toUpperCase();
          if (p[0] !== 'sgn' && p[2].length === 2) p[2] = p[2].toUpperCase();

          if (specialCases.indexOf(p[1].toLowerCase()) > -1) p[1] = capitalize(p[1].toLowerCase());
          if (specialCases.indexOf(p[2].toLowerCase()) > -1) p[2] = capitalize(p[2].toLowerCase());
        }

        return p.join('-');
      }

      return this.options.cleanCode || this.options.lowerCaseLng ? code.toLowerCase() : code;
    }

    // temporal backwards compatibility WHITELIST REMOVAL
    isWhitelisted(code) {
      this.logger.deprecate(
        'languageUtils.isWhitelisted',
        'function "isWhitelisted" will be renamed to "isSupportedCode" in the next major - please make sure to rename it\'s usage asap.',
      );

      return this.isSupportedCode(code);
    }
    // end temporal backwards compatibility WHITELIST REMOVAL

    isSupportedCode(code) {
      if (this.options.load === 'languageOnly' || this.options.nonExplicitSupportedLngs) {
        code = this.getLanguagePartFromCode(code);
      }
      return (
        !this.supportedLngs || !this.supportedLngs.length || this.supportedLngs.indexOf(code) > -1
      );
    }

    getBestMatchFromCodes(codes) {
      if (!codes) return null;

      let found;

      // pick first supported code or if no restriction pick the first one (highest prio)
      codes.forEach(code => {
        if (found) return;
        let cleanedLng = this.formatLanguageCode(code);
        if (!this.options.supportedLngs || this.isSupportedCode(cleanedLng)) found = cleanedLng;
      });

      // if we got no match in supportedLngs yet - check for similar locales
      // first  de-CH --> de
      // second de-CH --> de-DE
      if (!found && this.options.supportedLngs) {
        codes.forEach(code => {
          if (found) return;

          let lngOnly = this.getLanguagePartFromCode(code);
          if (this.isSupportedCode(lngOnly)) return (found = lngOnly);

          found = this.options.supportedLngs.find(supportedLng => {
            if (supportedLng.indexOf(lngOnly) === 0) return supportedLng;
          });
        });
      }

      // if nothing found, use fallbackLng
      if (!found) found = this.getFallbackCodes(this.options.fallbackLng)[0];

      return found;
    }

    getFallbackCodes(fallbacks, code) {
      if (!fallbacks) return [];
      if (typeof fallbacks === 'function') fallbacks = fallbacks(code);
      if (typeof fallbacks === 'string') fallbacks = [fallbacks];
      if (Object.prototype.toString.apply(fallbacks) === '[object Array]') return fallbacks;

      if (!code) return fallbacks.default || [];

      // asume we have an object defining fallbacks
      let found = fallbacks[code];
      if (!found) found = fallbacks[this.getScriptPartFromCode(code)];
      if (!found) found = fallbacks[this.formatLanguageCode(code)];
      if (!found) found = fallbacks[this.getLanguagePartFromCode(code)];
      if (!found) found = fallbacks.default;

      return found || [];
    }

    toResolveHierarchy(code, fallbackCode) {
      const fallbackCodes = this.getFallbackCodes(
        fallbackCode || this.options.fallbackLng || [],
        code,
      );

      const codes = [];
      const addCode = c => {
        if (!c) return;
        if (this.isSupportedCode(c)) {
          codes.push(c);
        } else {
          this.logger.warn(`rejecting language code not found in supportedLngs: ${c}`);
        }
      };

      if (typeof code === 'string' && code.indexOf('-') > -1) {
        if (this.options.load !== 'languageOnly') addCode(this.formatLanguageCode(code));
        if (this.options.load !== 'languageOnly' && this.options.load !== 'currentOnly')
          addCode(this.getScriptPartFromCode(code));
        if (this.options.load !== 'currentOnly') addCode(this.getLanguagePartFromCode(code));
      } else if (typeof code === 'string') {
        addCode(this.formatLanguageCode(code));
      }

      fallbackCodes.forEach(fc => {
        if (codes.indexOf(fc) < 0) addCode(this.formatLanguageCode(fc));
      });

      return codes;
    }
  }

  // definition http://translate.sourceforge.net/wiki/l10n/pluralforms
  /* eslint-disable */
  let sets = [
    { lngs: ['ach','ak','am','arn','br','fil','gun','ln','mfe','mg','mi','oc', 'pt', 'pt-BR',
      'tg','ti','tr','uz','wa'], nr: [1,2], fc: 1 },

    { lngs: ['af','an','ast','az','bg','bn','ca','da','de','dev','el','en',
      'eo','es','et','eu','fi','fo','fur','fy','gl','gu','ha','hi',
      'hu','hy','ia','it','kn','ku','lb','mai','ml','mn','mr','nah','nap','nb',
      'ne','nl','nn','no','nso','pa','pap','pms','ps','pt-PT','rm','sco',
      'se','si','so','son','sq','sv','sw','ta','te','tk','ur','yo'], nr: [1,2], fc: 2 },

    { lngs: ['ay','bo','cgg','fa','ht','id','ja','jbo','ka','kk','km','ko','ky','lo',
      'ms','sah','su','th','tt','ug','vi','wo','zh'], nr: [1], fc: 3 },

    { lngs: ['be','bs', 'cnr', 'dz','hr','ru','sr','uk'], nr: [1,2,5], fc: 4 },

    { lngs: ['ar'], nr: [0,1,2,3,11,100], fc: 5 },
    { lngs: ['cs','sk'], nr: [1,2,5], fc: 6 },
    { lngs: ['csb','pl'], nr: [1,2,5], fc: 7 },
    { lngs: ['cy'], nr: [1,2,3,8], fc: 8 },
    { lngs: ['fr'], nr: [1,2], fc: 9 },
    { lngs: ['ga'], nr: [1,2,3,7,11], fc: 10 },
    { lngs: ['gd'], nr: [1,2,3,20], fc: 11 },
    { lngs: ['is'], nr: [1,2], fc: 12 },
    { lngs: ['jv'], nr: [0,1], fc: 13 },
    { lngs: ['kw'], nr: [1,2,3,4], fc: 14 },
    { lngs: ['lt'], nr: [1,2,10], fc: 15 },
    { lngs: ['lv'], nr: [1,2,0], fc: 16 },
    { lngs: ['mk'], nr: [1,2], fc: 17 },
    { lngs: ['mnk'], nr: [0,1,2], fc: 18 },
    { lngs: ['mt'], nr: [1,2,11,20], fc: 19 },
    { lngs: ['or'], nr: [2,1], fc: 2 },
    { lngs: ['ro'], nr: [1,2,20], fc: 20 },
    { lngs: ['sl'], nr: [5,1,2,3], fc: 21 },
    { lngs: ['he','iw'], nr: [1,2,20,21], fc: 22 }
  ];

  let _rulesPluralsTypes = {
    1: function(n) {return Number(n > 1);},
    2: function(n) {return Number(n != 1);},
    3: function(n) {return 0;},
    4: function(n) {return Number(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);},
    5: function(n) {return Number(n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5);},
    6: function(n) {return Number((n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2);},
    7: function(n) {return Number(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);},
    8: function(n) {return Number((n==1) ? 0 : (n==2) ? 1 : (n != 8 && n != 11) ? 2 : 3);},
    9: function(n) {return Number(n >= 2);},
    10: function(n) {return Number(n==1 ? 0 : n==2 ? 1 : n<7 ? 2 : n<11 ? 3 : 4) ;},
    11: function(n) {return Number((n==1 || n==11) ? 0 : (n==2 || n==12) ? 1 : (n > 2 && n < 20) ? 2 : 3);},
    12: function(n) {return Number(n%10!=1 || n%100==11);},
    13: function(n) {return Number(n !== 0);},
    14: function(n) {return Number((n==1) ? 0 : (n==2) ? 1 : (n == 3) ? 2 : 3);},
    15: function(n) {return Number(n%10==1 && n%100!=11 ? 0 : n%10>=2 && (n%100<10 || n%100>=20) ? 1 : 2);},
    16: function(n) {return Number(n%10==1 && n%100!=11 ? 0 : n !== 0 ? 1 : 2);},
    17: function(n) {return Number(n==1 || n%10==1 && n%100!=11 ? 0 : 1);},
    18: function(n) {return Number(n==0 ? 0 : n==1 ? 1 : 2);},
    19: function(n) {return Number(n==1 ? 0 : n==0 || ( n%100>1 && n%100<11) ? 1 : (n%100>10 && n%100<20 ) ? 2 : 3);},
    20: function(n) {return Number(n==1 ? 0 : (n==0 || (n%100 > 0 && n%100 < 20)) ? 1 : 2);},
    21: function(n) {return Number(n%100==1 ? 1 : n%100==2 ? 2 : n%100==3 || n%100==4 ? 3 : 0); },
    22: function(n) {return Number(n==1 ? 0 : n==2 ? 1 : (n<0 || n>10) && n%10==0 ? 2 : 3); }
  };
  /* eslint-enable */

  function createRules() {
    const rules = {};
    sets.forEach((set) => {
      set.lngs.forEach((l) => {
        rules[l] = {
          numbers: set.nr,
          plurals: _rulesPluralsTypes[set.fc]
        };
      });
    });
    return rules;
  }

  class PluralResolver {
    constructor(languageUtils, options = {}) {
      this.languageUtils = languageUtils;
      this.options = options;

      this.logger = baseLogger.create('pluralResolver');

      this.rules = createRules();
    }

    addRule(lng, obj) {
      this.rules[lng] = obj;
    }

    getRule(code) {
      return this.rules[code] || this.rules[this.languageUtils.getLanguagePartFromCode(code)];
    }

    needsPlural(code) {
      const rule = this.getRule(code);

      return rule && rule.numbers.length > 1;
    }

    getPluralFormsOfKey(code, key) {
      const ret = [];

      const rule = this.getRule(code);

      if (!rule) return ret;

      rule.numbers.forEach((n) => {
        const suffix = this.getSuffix(code, n);
        ret.push(`${key}${suffix}`);
      });

      return ret;
    }

    getSuffix(code, count) {
      const rule = this.getRule(code);

      if (rule) {
        // if (rule.numbers.length === 1) return ''; // only singular

        const idx = rule.noAbs ? rule.plurals(count) : rule.plurals(Math.abs(count));
        let suffix = rule.numbers[idx];

        // special treatment for lngs only having singular and plural
        if (this.options.simplifyPluralSuffix && rule.numbers.length === 2 && rule.numbers[0] === 1) {
          if (suffix === 2) {
            suffix = 'plural';
          } else if (suffix === 1) {
            suffix = '';
          }
        }

        const returnSuffix = () => (
          this.options.prepend && suffix.toString() ? this.options.prepend + suffix.toString() : suffix.toString()
        );

        // COMPATIBILITY JSON
        // v1
        if (this.options.compatibilityJSON === 'v1') {
          if (suffix === 1) return '';
          if (typeof suffix === 'number') return `_plural_${suffix.toString()}`;
          return returnSuffix();
        } else if (/* v2 */ this.options.compatibilityJSON === 'v2') {
          return returnSuffix();
        } else if (/* v3 - gettext index */ this.options.simplifyPluralSuffix && rule.numbers.length === 2 && rule.numbers[0] === 1) {
          return returnSuffix();
        }
        return this.options.prepend && idx.toString() ? this.options.prepend + idx.toString() : idx.toString();
      }

      this.logger.warn(`no plural rule found for: ${code}`);
      return '';
    }
  }

  class Interpolator {
    constructor(options = {}) {
      this.logger = baseLogger.create('interpolator');

      this.options = options;
      this.format = (options.interpolation && options.interpolation.format) || (value => value);
      this.init(options);
    }

    /* eslint no-param-reassign: 0 */
    init(options = {}) {
      if (!options.interpolation) options.interpolation = { escapeValue: true };

      const iOpts = options.interpolation;

      this.escape = iOpts.escape !== undefined ? iOpts.escape : escape;
      this.escapeValue = iOpts.escapeValue !== undefined ? iOpts.escapeValue : true;
      this.useRawValueToEscape =
        iOpts.useRawValueToEscape !== undefined ? iOpts.useRawValueToEscape : false;

      this.prefix = iOpts.prefix ? regexEscape(iOpts.prefix) : iOpts.prefixEscaped || '{{';
      this.suffix = iOpts.suffix ? regexEscape(iOpts.suffix) : iOpts.suffixEscaped || '}}';

      this.formatSeparator = iOpts.formatSeparator
        ? iOpts.formatSeparator
        : iOpts.formatSeparator || ',';

      this.unescapePrefix = iOpts.unescapeSuffix ? '' : iOpts.unescapePrefix || '-';
      this.unescapeSuffix = this.unescapePrefix ? '' : iOpts.unescapeSuffix || '';

      this.nestingPrefix = iOpts.nestingPrefix
        ? regexEscape(iOpts.nestingPrefix)
        : iOpts.nestingPrefixEscaped || regexEscape('$t(');
      this.nestingSuffix = iOpts.nestingSuffix
        ? regexEscape(iOpts.nestingSuffix)
        : iOpts.nestingSuffixEscaped || regexEscape(')');

      this.nestingOptionsSeparator = iOpts.nestingOptionsSeparator
        ? iOpts.nestingOptionsSeparator
        : iOpts.nestingOptionsSeparator || ',';

      this.maxReplaces = iOpts.maxReplaces ? iOpts.maxReplaces : 1000;

      this.alwaysFormat = iOpts.alwaysFormat !== undefined ? iOpts.alwaysFormat : false;

      // the regexp
      this.resetRegExp();
    }

    reset() {
      if (this.options) this.init(this.options);
    }

    resetRegExp() {
      // the regexp
      const regexpStr = `${this.prefix}(.+?)${this.suffix}`;
      this.regexp = new RegExp(regexpStr, 'g');

      const regexpUnescapeStr = `${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${
      this.suffix
    }`;
      this.regexpUnescape = new RegExp(regexpUnescapeStr, 'g');

      const nestingRegexpStr = `${this.nestingPrefix}(.+?)${this.nestingSuffix}`;
      this.nestingRegexp = new RegExp(nestingRegexpStr, 'g');
    }

    interpolate(str, data, lng, options) {
      let match;
      let value;
      let replaces;

      const defaultData =
        (this.options && this.options.interpolation && this.options.interpolation.defaultVariables) ||
        {};

      function regexSafe(val) {
        return val.replace(/\$/g, '$$$$');
      }

      const handleFormat = key => {
        if (key.indexOf(this.formatSeparator) < 0) {
          const path = getPathWithDefaults(data, defaultData, key);
          return this.alwaysFormat ? this.format(path, undefined, lng) : path;
        }

        const p = key.split(this.formatSeparator);
        const k = p.shift().trim();
        const f = p.join(this.formatSeparator).trim();

        return this.format(getPathWithDefaults(data, defaultData, k), f, lng, options);
      };

      this.resetRegExp();

      const missingInterpolationHandler =
        (options && options.missingInterpolationHandler) || this.options.missingInterpolationHandler;

      const skipOnVariables =
        (options && options.interpolation && options.interpolation.skipOnVariables) ||
        this.options.interpolation.skipOnVariables;

      const todos = [
        {
          // unescape if has unescapePrefix/Suffix
          regex: this.regexpUnescape,
          safeValue: val => regexSafe(val),
        },
        {
          // regular escape on demand
          regex: this.regexp,
          safeValue: val => (this.escapeValue ? regexSafe(this.escape(val)) : regexSafe(val)),
        },
      ];
      todos.forEach(todo => {
        replaces = 0;
        /* eslint no-cond-assign: 0 */
        while ((match = todo.regex.exec(str))) {
          value = handleFormat(match[1].trim());
          if (value === undefined) {
            if (typeof missingInterpolationHandler === 'function') {
              const temp = missingInterpolationHandler(str, match, options);
              value = typeof temp === 'string' ? temp : '';
            } else if (skipOnVariables) {
              value = match[0];
              continue; // this makes sure it continues to detect others
            } else {
              this.logger.warn(`missed to pass in variable ${match[1]} for interpolating ${str}`);
              value = '';
            }
          } else if (typeof value !== 'string' && !this.useRawValueToEscape) {
            value = makeString(value);
          }
          str = str.replace(match[0], todo.safeValue(value));
          todo.regex.lastIndex = 0;
          replaces++;
          if (replaces >= this.maxReplaces) {
            break;
          }
        }
      });
      return str;
    }

    nest(str, fc, options = {}) {
      let match;
      let value;

      let clonedOptions = { ...options };
      clonedOptions.applyPostProcessor = false; // avoid post processing on nested lookup
      delete clonedOptions.defaultValue; // assert we do not get a endless loop on interpolating defaultValue again and again

      // if value is something like "myKey": "lorem $(anotherKey, { "count": {{aValueInOptions}} })"
      function handleHasOptions(key, inheritedOptions) {
        const sep = this.nestingOptionsSeparator;
        if (key.indexOf(sep) < 0) return key;

        const c = key.split(new RegExp(`${sep}[ ]*{`));

        let optionsString = `{${c[1]}`;
        key = c[0];
        optionsString = this.interpolate(optionsString, clonedOptions);
        optionsString = optionsString.replace(/'/g, '"');

        try {
          clonedOptions = JSON.parse(optionsString);

          if (inheritedOptions) clonedOptions = { ...inheritedOptions, ...clonedOptions };
        } catch (e) {
          this.logger.warn(`failed parsing options string in nesting for key ${key}`, e);
          return `${key}${sep}${optionsString}`;
        }

        // assert we do not get a endless loop on interpolating defaultValue again and again
        delete clonedOptions.defaultValue;
        return key;
      }

      // regular escape on demand
      while ((match = this.nestingRegexp.exec(str))) {
        let formatters = [];

        /**
         * If there is more than one parameter (contains the format separator). E.g.:
         *   - t(a, b)
         *   - t(a, b, c)
         *
         * And those parameters are not dynamic values (parameters do not include curly braces). E.g.:
         *   - Not t(a, { "key": "{{variable}}" })
         *   - Not t(a, b, {"keyA": "valueA", "keyB": "valueB"})
         */
        let doReduce = false;
        if (match[0].includes(this.formatSeparator) && !/{.*}/.test(match[1])) {
          const r = match[1].split(this.formatSeparator).map(elem => elem.trim());
          match[1] = r.shift();
          formatters = r;
          doReduce = true;
        }

        value = fc(handleHasOptions.call(this, match[1].trim(), clonedOptions), clonedOptions);

        // is only the nesting key (key1 = '$(key2)') return the value without stringify
        if (value && match[0] === str && typeof value !== 'string') return value;

        // no string to include or empty
        if (typeof value !== 'string') value = makeString(value);
        if (!value) {
          this.logger.warn(`missed to resolve ${match[1]} for nesting ${str}`);
          value = '';
        }

        if (doReduce) {
          value = formatters.reduce((v, f) => this.format(v, f, options.lng, options), value.trim());
        }

        // Nested keys should not be escaped by default #854
        // value = this.escapeValue ? regexSafe(utils.escape(value)) : regexSafe(value);
        str = str.replace(match[0], value);
        this.regexp.lastIndex = 0;
      }
      return str;
    }
  }

  function remove(arr, what) {
    let found = arr.indexOf(what);

    while (found !== -1) {
      arr.splice(found, 1);
      found = arr.indexOf(what);
    }
  }

  class Connector extends EventEmitter {
    constructor(backend, store, services, options = {}) {
      super();

      this.backend = backend;
      this.store = store;
      this.services = services;
      this.languageUtils = services.languageUtils;
      this.options = options;
      this.logger = baseLogger.create('backendConnector');

      this.state = {};
      this.queue = [];

      if (this.backend && this.backend.init) {
        this.backend.init(services, options.backend, options);
      }
    }

    queueLoad(languages, namespaces, options, callback) {
      // find what needs to be loaded
      const toLoad = [];
      const pending = [];
      const toLoadLanguages = [];
      const toLoadNamespaces = [];

      languages.forEach(lng => {
        let hasAllNamespaces = true;

        namespaces.forEach(ns => {
          const name = `${lng}|${ns}`;

          if (!options.reload && this.store.hasResourceBundle(lng, ns)) {
            this.state[name] = 2; // loaded
          } else if (this.state[name] < 0) ; else if (this.state[name] === 1) {
            if (pending.indexOf(name) < 0) pending.push(name);
          } else {
            this.state[name] = 1; // pending

            hasAllNamespaces = false;

            if (pending.indexOf(name) < 0) pending.push(name);
            if (toLoad.indexOf(name) < 0) toLoad.push(name);
            if (toLoadNamespaces.indexOf(ns) < 0) toLoadNamespaces.push(ns);
          }
        });

        if (!hasAllNamespaces) toLoadLanguages.push(lng);
      });

      if (toLoad.length || pending.length) {
        this.queue.push({
          pending,
          loaded: {},
          errors: [],
          callback,
        });
      }

      return {
        toLoad,
        pending,
        toLoadLanguages,
        toLoadNamespaces,
      };
    }

    loaded(name, err, data) {
      const s = name.split('|');
      const lng = s[0];
      const ns = s[1];

      if (err) this.emit('failedLoading', lng, ns, err);

      if (data) {
        this.store.addResourceBundle(lng, ns, data);
      }

      // set loaded
      this.state[name] = err ? -1 : 2;

      // consolidated loading done in this run - only emit once for a loaded namespace
      const loaded = {};

      // callback if ready
      this.queue.forEach(q => {
        pushPath(q.loaded, [lng], ns);
        remove(q.pending, name);

        if (err) q.errors.push(err);

        if (q.pending.length === 0 && !q.done) {
          // only do once per loaded -> this.emit('loaded', q.loaded);
          Object.keys(q.loaded).forEach(l => {
            if (!loaded[l]) loaded[l] = [];
            if (q.loaded[l].length) {
              q.loaded[l].forEach(ns => {
                if (loaded[l].indexOf(ns) < 0) loaded[l].push(ns);
              });
            }
          });

          /* eslint no-param-reassign: 0 */
          q.done = true;
          if (q.errors.length) {
            q.callback(q.errors);
          } else {
            q.callback();
          }
        }
      });

      // emit consolidated loaded event
      this.emit('loaded', loaded);

      // remove done load requests
      this.queue = this.queue.filter(q => !q.done);
    }

    read(lng, ns, fcName, tried = 0, wait = 350, callback) {
      if (!lng.length) return callback(null, {}); // noting to load

      return this.backend[fcName](lng, ns, (err, data) => {
        if (err && data /* = retryFlag */ && tried < 5) {
          setTimeout(() => {
            this.read.call(this, lng, ns, fcName, tried + 1, wait * 2, callback);
          }, wait);
          return;
        }
        callback(err, data);
      });
    }

    /* eslint consistent-return: 0 */
    prepareLoading(languages, namespaces, options = {}, callback) {
      if (!this.backend) {
        this.logger.warn('No backend was added via i18next.use. Will not load resources.');
        return callback && callback();
      }

      if (typeof languages === 'string') languages = this.languageUtils.toResolveHierarchy(languages);
      if (typeof namespaces === 'string') namespaces = [namespaces];

      const toLoad = this.queueLoad(languages, namespaces, options, callback);
      if (!toLoad.toLoad.length) {
        if (!toLoad.pending.length) callback(); // nothing to load and no pendings...callback now
        return null; // pendings will trigger callback
      }

      toLoad.toLoad.forEach(name => {
        this.loadOne(name);
      });
    }

    load(languages, namespaces, callback) {
      this.prepareLoading(languages, namespaces, {}, callback);
    }

    reload(languages, namespaces, callback) {
      this.prepareLoading(languages, namespaces, { reload: true }, callback);
    }

    loadOne(name, prefix = '') {
      const s = name.split('|');
      const lng = s[0];
      const ns = s[1];

      this.read(lng, ns, 'read', undefined, undefined, (err, data) => {
        if (err) this.logger.warn(`${prefix}loading namespace ${ns} for language ${lng} failed`, err);
        if (!err && data)
          this.logger.log(`${prefix}loaded namespace ${ns} for language ${lng}`, data);

        this.loaded(name, err, data);
      });
    }

    saveMissing(languages, namespace, key, fallbackValue, isUpdate, options = {}) {
      if (
        this.services.utils &&
        this.services.utils.hasLoadedNamespace &&
        !this.services.utils.hasLoadedNamespace(namespace)
      ) {
        this.logger.warn(
          `did not save key "${key}" as the namespace "${namespace}" was not yet loaded`,
          'This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!',
        );
        return;
      }

      // ignore non valid keys
      if (key === undefined || key === null || key === '') return;

      if (this.backend && this.backend.create) {
        this.backend.create(languages, namespace, key, fallbackValue, null /* unused callback */, {
          ...options,
          isUpdate,
        });
      }

      // write to store to avoid resending
      if (!languages || !languages[0]) return;
      this.store.addResource(languages[0], namespace, key, fallbackValue);
    }
  }

  function get() {
    return {
      debug: false,
      initImmediate: true,

      ns: ['translation'],
      defaultNS: ['translation'],
      fallbackLng: ['dev'],
      fallbackNS: false, // string or array of namespaces

      // temporal backwards compatibility WHITELIST REMOVAL
      whitelist: false, // array with supported languages
      nonExplicitWhitelist: false,
      // end temporal backwards compatibility WHITELIST REMOVAL

      supportedLngs: false, // array with supported languages
      nonExplicitSupportedLngs: false,
      load: 'all', // | currentOnly | languageOnly
      preload: false, // array with preload languages

      simplifyPluralSuffix: true,
      keySeparator: '.',
      nsSeparator: ':',
      pluralSeparator: '_',
      contextSeparator: '_',

      partialBundledLanguages: false, // allow bundling certain languages that are not remotely fetched
      saveMissing: false, // enable to send missing values
      updateMissing: false, // enable to update default values if different from translated value (only useful on initial development, or when keeping code as source of truth)
      saveMissingTo: 'fallback', // 'current' || 'all'
      saveMissingPlurals: true, // will save all forms not only singular key
      missingKeyHandler: false, // function(lng, ns, key, fallbackValue) -> override if prefer on handling
      missingInterpolationHandler: false, // function(str, match)

      postProcess: false, // string or array of postProcessor names
      postProcessPassResolved: false, // pass resolved object into 'options.i18nResolved' for postprocessor
      returnNull: true, // allows null value as valid translation
      returnEmptyString: true, // allows empty string value as valid translation
      returnObjects: false,
      joinArrays: false, // or string to join array
      returnedObjectHandler: false, // function(key, value, options) triggered if key returns object but returnObjects is set to false
      parseMissingKeyHandler: false, // function(key) parsed a key that was not found in t() before returning
      appendNamespaceToMissingKey: false,
      appendNamespaceToCIMode: false,
      overloadTranslationOptionHandler: function handle(args) {
        var ret = {};
        if (typeof args[1] === 'object') ret = args[1];
        if (typeof args[1] === 'string') ret.defaultValue = args[1];
        if (typeof args[2] === 'string') ret.tDescription = args[2];
        if (typeof args[2] === 'object' || typeof args[3] === 'object') {
          var options = args[3] || args[2];
          Object.keys(options).forEach(function(key) {
            ret[key] = options[key];
          });
        }
        return ret;
      },
      interpolation: {
        escapeValue: true,
        format: (value, format, lng, options) => value,
        prefix: '{{',
        suffix: '}}',
        formatSeparator: ',',
        // prefixEscaped: '{{',
        // suffixEscaped: '}}',
        // unescapeSuffix: '',
        unescapePrefix: '-',

        nestingPrefix: '$t(',
        nestingSuffix: ')',
        nestingOptionsSeparator: ',',
        // nestingPrefixEscaped: '$t(',
        // nestingSuffixEscaped: ')',
        // defaultVariables: undefined // object that can have values to interpolate on - extends passed in interpolation data
        maxReplaces: 1000, // max replaces to prevent endless loop
        skipOnVariables: false,
      },
    };
  }

  /* eslint no-param-reassign: 0 */
  function transformOptions(options) {
    // create namespace object if namespace is passed in as string
    if (typeof options.ns === 'string') options.ns = [options.ns];
    if (typeof options.fallbackLng === 'string') options.fallbackLng = [options.fallbackLng];
    if (typeof options.fallbackNS === 'string') options.fallbackNS = [options.fallbackNS];

    // temporal backwards compatibility WHITELIST REMOVAL
    if (options.whitelist) {
      if (options.whitelist && options.whitelist.indexOf('cimode') < 0) {
        options.whitelist = options.whitelist.concat(['cimode']);
      }

      options.supportedLngs = options.whitelist;
    }

    if (options.nonExplicitWhitelist) {
      options.nonExplicitSupportedLngs = options.nonExplicitWhitelist;
    }
    // end temporal backwards compatibility WHITELIST REMOVAL

    // extend supportedLngs with cimode
    if (options.supportedLngs && options.supportedLngs.indexOf('cimode') < 0) {
      options.supportedLngs = options.supportedLngs.concat(['cimode']);
    }

    return options;
  }

  function noop() { }

  class I18n extends EventEmitter {
    constructor(options = {}, callback) {
      super();
      if (isIE10) {
        /* EventEmitter.call(this) */ // <=IE10 fix (unable to call parent constructor)
      }

      this.options = transformOptions(options);
      this.services = {};
      this.logger = baseLogger;
      this.modules = { external: [] };

      if (callback && !this.isInitialized && !options.isClone) {
        // https://github.com/i18next/i18next/issues/879
        if (!this.options.initImmediate) {
          this.init(options, callback);
          return this;
        }
        setTimeout(() => {
          this.init(options, callback);
        }, 0);
      }
    }

    init(options = {}, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      // temporal backwards compatibility WHITELIST REMOVAL
      if (options.whitelist && !options.supportedLngs) {
        this.logger.deprecate('whitelist', 'option "whitelist" will be renamed to "supportedLngs" in the next major - please make sure to rename this option asap.');
      }
      if (options.nonExplicitWhitelist && !options.nonExplicitSupportedLngs) {
        this.logger.deprecate('whitelist', 'options "nonExplicitWhitelist" will be renamed to "nonExplicitSupportedLngs" in the next major - please make sure to rename this option asap.');
      }
      // end temporal backwards compatibility WHITELIST REMOVAL


      this.options = { ...get(), ...this.options, ...transformOptions(options) };

      this.format = this.options.interpolation.format;
      if (!callback) callback = noop;

      function createClassOnDemand(ClassOrObject) {
        if (!ClassOrObject) return null;
        if (typeof ClassOrObject === 'function') return new ClassOrObject();
        return ClassOrObject;
      }

      // init services
      if (!this.options.isClone) {
        if (this.modules.logger) {
          baseLogger.init(createClassOnDemand(this.modules.logger), this.options);
        } else {
          baseLogger.init(null, this.options);
        }

        const lu = new LanguageUtil(this.options);
        this.store = new ResourceStore(this.options.resources, this.options);

        const s = this.services;
        s.logger = baseLogger;
        s.resourceStore = this.store;
        s.languageUtils = lu;
        s.pluralResolver = new PluralResolver(lu, {
          prepend: this.options.pluralSeparator,
          compatibilityJSON: this.options.compatibilityJSON,
          simplifyPluralSuffix: this.options.simplifyPluralSuffix,
        });
        s.interpolator = new Interpolator(this.options);
        s.utils = {
          hasLoadedNamespace: this.hasLoadedNamespace.bind(this)
        };

        s.backendConnector = new Connector(
          createClassOnDemand(this.modules.backend),
          s.resourceStore,
          s,
          this.options,
        );
        // pipe events from backendConnector
        s.backendConnector.on('*', (event, ...args) => {
          this.emit(event, ...args);
        });

        if (this.modules.languageDetector) {
          s.languageDetector = createClassOnDemand(this.modules.languageDetector);
          s.languageDetector.init(s, this.options.detection, this.options);
        }

        if (this.modules.i18nFormat) {
          s.i18nFormat = createClassOnDemand(this.modules.i18nFormat);
          if (s.i18nFormat.init) s.i18nFormat.init(this);
        }

        this.translator = new Translator(this.services, this.options);
        // pipe events from translator
        this.translator.on('*', (event, ...args) => {
          this.emit(event, ...args);
        });

        this.modules.external.forEach(m => {
          if (m.init) m.init(this);
        });
      }

      if (this.options.fallbackLng && !this.services.languageDetector && !this.options.lng) {
        const codes = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
        if (codes.length > 0 && codes[0] !== 'dev') this.options.lng = codes[0];
      }
      if (!this.services.languageDetector && !this.options.lng) {
        this.logger.warn('init: no languageDetector is used and no lng is defined');
      }

      // append api
      const storeApi = [
        'getResource',
        'hasResourceBundle',
        'getResourceBundle',
        'getDataByLanguage',
      ];
      storeApi.forEach(fcName => {
        this[fcName] = (...args) => this.store[fcName](...args);
      });
      const storeApiChained = [
        'addResource',
        'addResources',
        'addResourceBundle',
        'removeResourceBundle',
      ];
      storeApiChained.forEach(fcName => {
        this[fcName] = (...args) => {
          this.store[fcName](...args);
          return this;
        };
      });

      const deferred = defer();

      const load = () => {
        const finish = (err, t) => {
          if (this.isInitialized) this.logger.warn('init: i18next is already initialized. You should call init just once!');
          this.isInitialized = true;
          if (!this.options.isClone) this.logger.log('initialized', this.options);
          this.emit('initialized', this.options);

          deferred.resolve(t); // not rejecting on err (as err is only a loading translation failed warning)
          callback(err, t);
        };
        // fix for use cases when calling changeLanguage before finished to initialized (i.e. https://github.com/i18next/i18next/issues/1552)
        if (this.languages && this.options.compatibilityAPI !== 'v1') return finish(null, this.t.bind(this));
        this.changeLanguage(this.options.lng, finish);
      };

      if (this.options.resources || !this.options.initImmediate) {
        load();
      } else {
        setTimeout(load, 0);
      }

      return deferred;
    }

    /* eslint consistent-return: 0 */
    loadResources(language, callback = noop) {
      let usedCallback = callback;
      let usedLng = typeof language === 'string' ? language : this.language;
      if (typeof language === 'function') usedCallback = language;

      if (!this.options.resources || this.options.partialBundledLanguages) {
        if (usedLng && usedLng.toLowerCase() === 'cimode') return usedCallback(); // avoid loading resources for cimode

        const toLoad = [];

        const append = lng => {
          if (!lng) return;
          const lngs = this.services.languageUtils.toResolveHierarchy(lng);
          lngs.forEach(l => {
            if (toLoad.indexOf(l) < 0) toLoad.push(l);
          });
        };

        if (!usedLng) {
          // at least load fallbacks in this case
          const fallbacks = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
          fallbacks.forEach(l => append(l));
        } else {
          append(usedLng);
        }

        if (this.options.preload) {
          this.options.preload.forEach(l => append(l));
        }

        this.services.backendConnector.load(toLoad, this.options.ns, usedCallback);
      } else {
        usedCallback(null);
      }
    }

    reloadResources(lngs, ns, callback) {
      const deferred = defer();
      if (!lngs) lngs = this.languages;
      if (!ns) ns = this.options.ns;
      if (!callback) callback = noop;
      this.services.backendConnector.reload(lngs, ns, err => {
        deferred.resolve(); // not rejecting on err (as err is only a loading translation failed warning)
        callback(err);
      });
      return deferred;
    }

    use(module) {
      if (!module) throw new Error('You are passing an undefined module! Please check the object you are passing to i18next.use()')
      if (!module.type) throw new Error('You are passing a wrong module! Please check the object you are passing to i18next.use()')

      if (module.type === 'backend') {
        this.modules.backend = module;
      }

      if (module.type === 'logger' || (module.log && module.warn && module.error)) {
        this.modules.logger = module;
      }

      if (module.type === 'languageDetector') {
        this.modules.languageDetector = module;
      }

      if (module.type === 'i18nFormat') {
        this.modules.i18nFormat = module;
      }

      if (module.type === 'postProcessor') {
        postProcessor.addPostProcessor(module);
      }

      if (module.type === '3rdParty') {
        this.modules.external.push(module);
      }

      return this;
    }

    changeLanguage(lng, callback) {
      this.isLanguageChangingTo = lng;
      const deferred = defer();
      this.emit('languageChanging', lng);

      const done = (err, l) => {
        if (l) {
          this.language = l;
          this.languages = this.services.languageUtils.toResolveHierarchy(l);
          this.translator.changeLanguage(l);
          this.isLanguageChangingTo = undefined;
          this.emit('languageChanged', l);
          this.logger.log('languageChanged', l);
        } else {
          this.isLanguageChangingTo = undefined;
        }

        deferred.resolve((...args) => this.t(...args));
        if (callback) callback(err, (...args) => this.t(...args));
      };

      const setLng = lngs => {
        // depending on API in detector lng can be a string (old) or an array of languages ordered in priority
        const l = typeof lngs === 'string' ? lngs : this.services.languageUtils.getBestMatchFromCodes(lngs);

        if (l) {
          if (!this.language) {
            this.language = l;
            this.languages = this.services.languageUtils.toResolveHierarchy(l);
          }
          if (!this.translator.language) this.translator.changeLanguage(l);

          if (this.services.languageDetector) this.services.languageDetector.cacheUserLanguage(l);
        }

        this.loadResources(l, err => {
          done(err, l);
        });
      };

      if (!lng && this.services.languageDetector && !this.services.languageDetector.async) {
        setLng(this.services.languageDetector.detect());
      } else if (!lng && this.services.languageDetector && this.services.languageDetector.async) {
        this.services.languageDetector.detect(setLng);
      } else {
        setLng(lng);
      }

      return deferred;
    }

    getFixedT(lng, ns) {
      const fixedT = (key, opts, ...rest) => {
        let options;
        if (typeof opts !== 'object') {
          options = this.options.overloadTranslationOptionHandler([key, opts].concat(rest));
        } else {
          options = { ...opts };
        }

        options.lng = options.lng || fixedT.lng;
        options.lngs = options.lngs || fixedT.lngs;
        options.ns = options.ns || fixedT.ns;
        return this.t(key, options);
      };
      if (typeof lng === 'string') {
        fixedT.lng = lng;
      } else {
        fixedT.lngs = lng;
      }
      fixedT.ns = ns;
      return fixedT;
    }

    t(...args) {
      return this.translator && this.translator.translate(...args);
    }

    exists(...args) {
      return this.translator && this.translator.exists(...args);
    }

    setDefaultNamespace(ns) {
      this.options.defaultNS = ns;
    }

    hasLoadedNamespace(ns, options = {}) {
      if (!this.isInitialized) {
        this.logger.warn('hasLoadedNamespace: i18next was not initialized', this.languages);
        return false;
      }
      if (!this.languages || !this.languages.length) {
        this.logger.warn('hasLoadedNamespace: i18n.languages were undefined or empty', this.languages);
        return false;
      }

      const lng = this.languages[0];
      const fallbackLng = this.options ? this.options.fallbackLng : false;
      const lastLng = this.languages[this.languages.length - 1];

      // we're in cimode so this shall pass
      if (lng.toLowerCase() === 'cimode') return true;

      const loadNotPending = (l, n) => {
        const loadState = this.services.backendConnector.state[`${l}|${n}`];
        return loadState === -1 || loadState === 2;
      };

      // optional injected check
      if (options.precheck) {
        const preResult = options.precheck(this, loadNotPending);
        if (preResult !== undefined) return preResult;
      }

      // loaded -> SUCCESS
      if (this.hasResourceBundle(lng, ns)) return true;

      // were not loading at all -> SEMI SUCCESS
      if (!this.services.backendConnector.backend) return true;

      // failed loading ns - but at least fallback is not pending -> SEMI SUCCESS
      if (loadNotPending(lng, ns) && (!fallbackLng || loadNotPending(lastLng, ns))) return true;

      return false;
    }

    loadNamespaces(ns, callback) {
      const deferred = defer();

      if (!this.options.ns) {
        callback && callback();
        return Promise.resolve();
      }
      if (typeof ns === 'string') ns = [ns];

      ns.forEach(n => {
        if (this.options.ns.indexOf(n) < 0) this.options.ns.push(n);
      });

      this.loadResources(err => {
        deferred.resolve();
        if (callback) callback(err);
      });

      return deferred;
    }

    loadLanguages(lngs, callback) {
      const deferred = defer();

      if (typeof lngs === 'string') lngs = [lngs];
      const preloaded = this.options.preload || [];

      const newLngs = lngs.filter(lng => preloaded.indexOf(lng) < 0);
      // Exit early if all given languages are already preloaded
      if (!newLngs.length) {
        if (callback) callback();
        return Promise.resolve();
      }

      this.options.preload = preloaded.concat(newLngs);
      this.loadResources(err => {
        deferred.resolve();
        if (callback) callback(err);
      });

      return deferred;
    }

    dir(lng) {
      if (!lng) lng = this.languages && this.languages.length > 0 ? this.languages[0] : this.language;
      if (!lng) return 'rtl';

      const rtlLngs = [
        'ar',
        'shu',
        'sqr',
        'ssh',
        'xaa',
        'yhd',
        'yud',
        'aao',
        'abh',
        'abv',
        'acm',
        'acq',
        'acw',
        'acx',
        'acy',
        'adf',
        'ads',
        'aeb',
        'aec',
        'afb',
        'ajp',
        'apc',
        'apd',
        'arb',
        'arq',
        'ars',
        'ary',
        'arz',
        'auz',
        'avl',
        'ayh',
        'ayl',
        'ayn',
        'ayp',
        'bbz',
        'pga',
        'he',
        'iw',
        'ps',
        'pbt',
        'pbu',
        'pst',
        'prp',
        'prd',
        'ug',
        'ur',
        'ydd',
        'yds',
        'yih',
        'ji',
        'yi',
        'hbo',
        'men',
        'xmn',
        'fa',
        'jpr',
        'peo',
        'pes',
        'prs',
        'dv',
        'sam',
      ];

      return rtlLngs.indexOf(this.services.languageUtils.getLanguagePartFromCode(lng)) >= 0
        ? 'rtl'
        : 'ltr';
    }

    /* eslint class-methods-use-this: 0 */
    createInstance(options = {}, callback) {
      return new I18n(options, callback);
    }

    cloneInstance(options = {}, callback = noop) {
      const mergedOptions = { ...this.options, ...options, ...{ isClone: true } };
      const clone = new I18n(mergedOptions);
      const membersToCopy = ['store', 'services', 'language'];
      membersToCopy.forEach(m => {
        clone[m] = this[m];
      });
      clone.services = { ...this.services };
      clone.services.utils = {
        hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone)
      };
      clone.translator = new Translator(clone.services, clone.options);
      clone.translator.on('*', (event, ...args) => {
        clone.emit(event, ...args);
      });
      clone.init(mergedOptions, callback);
      clone.translator.options = clone.options; // sync options
      clone.translator.backendConnector.services.utils = {
        hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone)
      };

      return clone;
    }
  }

  const i18next = new I18n();

  /* eslint-disable
      @typescript-eslint/no-namespace
   */
  const i18n = i18next;

  exports.i18n = i18n;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLWkxOG4uanMiLCJzb3VyY2VzIjpbImkxOG5leHQvc3JjL2xvZ2dlci5qcyIsImkxOG5leHQvc3JjL0V2ZW50RW1pdHRlci5qcyIsImkxOG5leHQvc3JjL3V0aWxzLmpzIiwiaTE4bmV4dC9zcmMvUmVzb3VyY2VTdG9yZS5qcyIsImkxOG5leHQvc3JjL3Bvc3RQcm9jZXNzb3IuanMiLCJpMThuZXh0L3NyYy9UcmFuc2xhdG9yLmpzIiwiaTE4bmV4dC9zcmMvTGFuZ3VhZ2VVdGlscy5qcyIsImkxOG5leHQvc3JjL1BsdXJhbFJlc29sdmVyLmpzIiwiaTE4bmV4dC9zcmMvSW50ZXJwb2xhdG9yLmpzIiwiaTE4bmV4dC9zcmMvQmFja2VuZENvbm5lY3Rvci5qcyIsImkxOG5leHQvc3JjL2RlZmF1bHRzLmpzIiwiaTE4bmV4dC9zcmMvaTE4bmV4dC5qcyIsImluZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGNvbnNvbGVMb2dnZXIgPSB7XG4gIHR5cGU6ICdsb2dnZXInLFxuXG4gIGxvZyhhcmdzKSB7XG4gICAgdGhpcy5vdXRwdXQoJ2xvZycsIGFyZ3MpO1xuICB9LFxuXG4gIHdhcm4oYXJncykge1xuICAgIHRoaXMub3V0cHV0KCd3YXJuJywgYXJncyk7XG4gIH0sXG5cbiAgZXJyb3IoYXJncykge1xuICAgIHRoaXMub3V0cHV0KCdlcnJvcicsIGFyZ3MpO1xuICB9LFxuXG4gIG91dHB1dCh0eXBlLCBhcmdzKSB7XG4gICAgLyogZXNsaW50IG5vLWNvbnNvbGU6IDAgKi9cbiAgICBpZiAoY29uc29sZSAmJiBjb25zb2xlW3R5cGVdKSBjb25zb2xlW3R5cGVdLmFwcGx5KGNvbnNvbGUsIGFyZ3MpO1xuICB9LFxufTtcblxuY2xhc3MgTG9nZ2VyIHtcbiAgY29uc3RydWN0b3IoY29uY3JldGVMb2dnZXIsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuaW5pdChjb25jcmV0ZUxvZ2dlciwgb3B0aW9ucyk7XG4gIH1cblxuICBpbml0KGNvbmNyZXRlTG9nZ2VyLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnByZWZpeCA9IG9wdGlvbnMucHJlZml4IHx8ICdpMThuZXh0Oic7XG4gICAgdGhpcy5sb2dnZXIgPSBjb25jcmV0ZUxvZ2dlciB8fCBjb25zb2xlTG9nZ2VyO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5kZWJ1ZyA9IG9wdGlvbnMuZGVidWc7XG4gIH1cblxuICBzZXREZWJ1Zyhib29sKSB7XG4gICAgdGhpcy5kZWJ1ZyA9IGJvb2w7XG4gIH1cblxuICBsb2coLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLmZvcndhcmQoYXJncywgJ2xvZycsICcnLCB0cnVlKTtcbiAgfVxuXG4gIHdhcm4oLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLmZvcndhcmQoYXJncywgJ3dhcm4nLCAnJywgdHJ1ZSk7XG4gIH1cblxuICBlcnJvciguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuZm9yd2FyZChhcmdzLCAnZXJyb3InLCAnJyk7XG4gIH1cblxuICBkZXByZWNhdGUoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLmZvcndhcmQoYXJncywgJ3dhcm4nLCAnV0FSTklORyBERVBSRUNBVEVEOiAnLCB0cnVlKTtcbiAgfVxuXG4gIGZvcndhcmQoYXJncywgbHZsLCBwcmVmaXgsIGRlYnVnT25seSkge1xuICAgIGlmIChkZWJ1Z09ubHkgJiYgIXRoaXMuZGVidWcpIHJldHVybiBudWxsO1xuICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ3N0cmluZycpIGFyZ3NbMF0gPSBgJHtwcmVmaXh9JHt0aGlzLnByZWZpeH0gJHthcmdzWzBdfWA7XG4gICAgcmV0dXJuIHRoaXMubG9nZ2VyW2x2bF0oYXJncyk7XG4gIH1cblxuICBjcmVhdGUobW9kdWxlTmFtZSkge1xuICAgIHJldHVybiBuZXcgTG9nZ2VyKHRoaXMubG9nZ2VyLCB7XG4gICAgICAuLi57IHByZWZpeDogYCR7dGhpcy5wcmVmaXh9OiR7bW9kdWxlTmFtZX06YCB9LFxuICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBMb2dnZXIoKTtcbiIsImNsYXNzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMub2JzZXJ2ZXJzID0ge307XG4gIH1cblxuICBvbihldmVudHMsIGxpc3RlbmVyKSB7XG4gICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICB0aGlzLm9ic2VydmVyc1tldmVudF0gPSB0aGlzLm9ic2VydmVyc1tldmVudF0gfHwgW107XG4gICAgICB0aGlzLm9ic2VydmVyc1tldmVudF0ucHVzaChsaXN0ZW5lcik7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBvZmYoZXZlbnQsIGxpc3RlbmVyKSB7XG4gICAgaWYgKCF0aGlzLm9ic2VydmVyc1tldmVudF0pIHJldHVybjtcbiAgICBpZiAoIWxpc3RlbmVyKSB7XG4gICAgICBkZWxldGUgdGhpcy5vYnNlcnZlcnNbZXZlbnRdO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMub2JzZXJ2ZXJzW2V2ZW50XSA9IHRoaXMub2JzZXJ2ZXJzW2V2ZW50XS5maWx0ZXIobCA9PiBsICE9PSBsaXN0ZW5lcik7XG4gIH1cblxuICBlbWl0KGV2ZW50LCAuLi5hcmdzKSB7XG4gICAgaWYgKHRoaXMub2JzZXJ2ZXJzW2V2ZW50XSkge1xuICAgICAgY29uc3QgY2xvbmVkID0gW10uY29uY2F0KHRoaXMub2JzZXJ2ZXJzW2V2ZW50XSk7XG4gICAgICBjbG9uZWQuZm9yRWFjaChvYnNlcnZlciA9PiB7XG4gICAgICAgIG9ic2VydmVyKC4uLmFyZ3MpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub2JzZXJ2ZXJzWycqJ10pIHtcbiAgICAgIGNvbnN0IGNsb25lZCA9IFtdLmNvbmNhdCh0aGlzLm9ic2VydmVyc1snKiddKTtcbiAgICAgIGNsb25lZC5mb3JFYWNoKG9ic2VydmVyID0+IHtcbiAgICAgICAgb2JzZXJ2ZXIuYXBwbHkob2JzZXJ2ZXIsIFtldmVudCwgLi4uYXJnc10pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEV2ZW50RW1pdHRlcjtcbiIsIi8vIGh0dHA6Ly9sZWEudmVyb3UubWUvMjAxNi8xMi9yZXNvbHZlLXByb21pc2VzLWV4dGVybmFsbHktd2l0aC10aGlzLW9uZS13ZWlyZC10cmljay9cbmV4cG9ydCBmdW5jdGlvbiBkZWZlcigpIHtcbiAgbGV0IHJlcztcbiAgbGV0IHJlajtcblxuICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJlcyA9IHJlc29sdmU7XG4gICAgcmVqID0gcmVqZWN0O1xuICB9KTtcblxuICBwcm9taXNlLnJlc29sdmUgPSByZXM7XG4gIHByb21pc2UucmVqZWN0ID0gcmVqO1xuXG4gIHJldHVybiBwcm9taXNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVN0cmluZyhvYmplY3QpIHtcbiAgaWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gJyc7XG4gIC8qIGVzbGludCBwcmVmZXItdGVtcGxhdGU6IDAgKi9cbiAgcmV0dXJuICcnICsgb2JqZWN0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weShhLCBzLCB0KSB7XG4gIGEuZm9yRWFjaChtID0+IHtcbiAgICBpZiAoc1ttXSkgdFttXSA9IHNbbV07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRMYXN0T2ZQYXRoKG9iamVjdCwgcGF0aCwgRW1wdHkpIHtcbiAgZnVuY3Rpb24gY2xlYW5LZXkoa2V5KSB7XG4gICAgcmV0dXJuIGtleSAmJiBrZXkuaW5kZXhPZignIyMjJykgPiAtMSA/IGtleS5yZXBsYWNlKC8jIyMvZywgJy4nKSA6IGtleTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbk5vdFRyYXZlcnNlRGVlcGVyKCkge1xuICAgIHJldHVybiAhb2JqZWN0IHx8IHR5cGVvZiBvYmplY3QgPT09ICdzdHJpbmcnO1xuICB9XG5cbiAgY29uc3Qgc3RhY2sgPSB0eXBlb2YgcGF0aCAhPT0gJ3N0cmluZycgPyBbXS5jb25jYXQocGF0aCkgOiBwYXRoLnNwbGl0KCcuJyk7XG4gIHdoaWxlIChzdGFjay5sZW5ndGggPiAxKSB7XG4gICAgaWYgKGNhbk5vdFRyYXZlcnNlRGVlcGVyKCkpIHJldHVybiB7fTtcblxuICAgIGNvbnN0IGtleSA9IGNsZWFuS2V5KHN0YWNrLnNoaWZ0KCkpO1xuICAgIGlmICghb2JqZWN0W2tleV0gJiYgRW1wdHkpIG9iamVjdFtrZXldID0gbmV3IEVtcHR5KCk7XG4gICAgLy8gcHJldmVudCBwcm90b3R5cGUgcG9sbHV0aW9uXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpIHtcbiAgICAgIG9iamVjdCA9IG9iamVjdFtrZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmplY3QgPSB7fTtcbiAgICB9XG4gIH1cblxuICBpZiAoY2FuTm90VHJhdmVyc2VEZWVwZXIoKSkgcmV0dXJuIHt9O1xuICByZXR1cm4ge1xuICAgIG9iajogb2JqZWN0LFxuICAgIGs6IGNsZWFuS2V5KHN0YWNrLnNoaWZ0KCkpLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UGF0aChvYmplY3QsIHBhdGgsIG5ld1ZhbHVlKSB7XG4gIGNvbnN0IHsgb2JqLCBrIH0gPSBnZXRMYXN0T2ZQYXRoKG9iamVjdCwgcGF0aCwgT2JqZWN0KTtcblxuICBvYmpba10gPSBuZXdWYWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB1c2hQYXRoKG9iamVjdCwgcGF0aCwgbmV3VmFsdWUsIGNvbmNhdCkge1xuICBjb25zdCB7IG9iaiwgayB9ID0gZ2V0TGFzdE9mUGF0aChvYmplY3QsIHBhdGgsIE9iamVjdCk7XG5cbiAgb2JqW2tdID0gb2JqW2tdIHx8IFtdO1xuICBpZiAoY29uY2F0KSBvYmpba10gPSBvYmpba10uY29uY2F0KG5ld1ZhbHVlKTtcbiAgaWYgKCFjb25jYXQpIG9ialtrXS5wdXNoKG5ld1ZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhdGgob2JqZWN0LCBwYXRoKSB7XG4gIGNvbnN0IHsgb2JqLCBrIH0gPSBnZXRMYXN0T2ZQYXRoKG9iamVjdCwgcGF0aCk7XG5cbiAgaWYgKCFvYmopIHJldHVybiB1bmRlZmluZWQ7XG4gIHJldHVybiBvYmpba107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXRoV2l0aERlZmF1bHRzKGRhdGEsIGRlZmF1bHREYXRhLCBrZXkpIHtcbiAgY29uc3QgdmFsdWUgPSBnZXRQYXRoKGRhdGEsIGtleSk7XG4gIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIC8vIEZhbGxiYWNrIHRvIGRlZmF1bHQgdmFsdWVzXG4gIHJldHVybiBnZXRQYXRoKGRlZmF1bHREYXRhLCBrZXkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVlcEV4dGVuZCh0YXJnZXQsIHNvdXJjZSwgb3ZlcndyaXRlKSB7XG4gIC8qIGVzbGludCBuby1yZXN0cmljdGVkLXN5bnRheDogMCAqL1xuICBmb3IgKGNvbnN0IHByb3AgaW4gc291cmNlKSB7XG4gICAgaWYgKHByb3AgIT09ICdfX3Byb3RvX18nICYmIHByb3AgIT09ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgIGlmIChwcm9wIGluIHRhcmdldCkge1xuICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgbGVhZiBzdHJpbmcgaW4gdGFyZ2V0IG9yIHNvdXJjZSB0aGVuIHJlcGxhY2Ugd2l0aCBzb3VyY2Ugb3Igc2tpcCBkZXBlbmRpbmcgb24gdGhlICdvdmVyd3JpdGUnIHN3aXRjaFxuICAgICAgICBpZiAoXG4gICAgICAgICAgdHlwZW9mIHRhcmdldFtwcm9wXSA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgICB0YXJnZXRbcHJvcF0gaW5zdGFuY2VvZiBTdHJpbmcgfHxcbiAgICAgICAgICB0eXBlb2Ygc291cmNlW3Byb3BdID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgIHNvdXJjZVtwcm9wXSBpbnN0YW5jZW9mIFN0cmluZ1xuICAgICAgICApIHtcbiAgICAgICAgICBpZiAob3ZlcndyaXRlKSB0YXJnZXRbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVlcEV4dGVuZCh0YXJnZXRbcHJvcF0sIHNvdXJjZVtwcm9wXSwgb3ZlcndyaXRlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0W3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnZXhFc2NhcGUoc3RyKSB7XG4gIC8qIGVzbGludCBuby11c2VsZXNzLWVzY2FwZTogMCAqL1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCAnXFxcXCQmJyk7XG59XG5cbi8qIGVzbGludC1kaXNhYmxlICovXG52YXIgX2VudGl0eU1hcCA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICBcIidcIjogJyYjMzk7JyxcbiAgJy8nOiAnJiN4MkY7Jyxcbn07XG4vKiBlc2xpbnQtZW5hYmxlICovXG5cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGUoZGF0YSkge1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGRhdGEucmVwbGFjZSgvWyY8PlwiJ1xcL10vZywgcyA9PiBfZW50aXR5TWFwW3NdKTtcbiAgfVxuXG4gIHJldHVybiBkYXRhO1xufVxuXG5leHBvcnQgY29uc3QgaXNJRTEwID1cbiAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgd2luZG93Lm5hdmlnYXRvciAmJlxuICB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCAmJlxuICB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdNU0lFJykgPiAtMTtcbiIsImltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9FdmVudEVtaXR0ZXIuanMnO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscy5qcyc7XG5cbmNsYXNzIFJlc291cmNlU3RvcmUgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvcihkYXRhLCBvcHRpb25zID0geyBuczogWyd0cmFuc2xhdGlvbiddLCBkZWZhdWx0TlM6ICd0cmFuc2xhdGlvbicgfSkge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKHV0aWxzLmlzSUUxMCkge1xuICAgICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7IC8vIDw9SUUxMCBmaXggKHVuYWJsZSB0byBjYWxsIHBhcmVudCBjb25zdHJ1Y3RvcilcbiAgICB9XG5cbiAgICB0aGlzLmRhdGEgPSBkYXRhIHx8IHt9O1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5rZXlTZXBhcmF0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5vcHRpb25zLmtleVNlcGFyYXRvciA9ICcuJztcbiAgICB9XG4gIH1cblxuICBhZGROYW1lc3BhY2VzKG5zKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5ucy5pbmRleE9mKG5zKSA8IDApIHtcbiAgICAgIHRoaXMub3B0aW9ucy5ucy5wdXNoKG5zKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVOYW1lc3BhY2VzKG5zKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLm9wdGlvbnMubnMuaW5kZXhPZihucyk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5ucy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIGdldFJlc291cmNlKGxuZywgbnMsIGtleSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qga2V5U2VwYXJhdG9yID1cbiAgICAgIG9wdGlvbnMua2V5U2VwYXJhdG9yICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmtleVNlcGFyYXRvciA6IHRoaXMub3B0aW9ucy5rZXlTZXBhcmF0b3I7XG5cbiAgICBsZXQgcGF0aCA9IFtsbmcsIG5zXTtcbiAgICBpZiAoa2V5ICYmIHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSBwYXRoID0gcGF0aC5jb25jYXQoa2V5KTtcbiAgICBpZiAoa2V5ICYmIHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnKVxuICAgICAgcGF0aCA9IHBhdGguY29uY2F0KGtleVNlcGFyYXRvciA/IGtleS5zcGxpdChrZXlTZXBhcmF0b3IpIDoga2V5KTtcblxuICAgIGlmIChsbmcuaW5kZXhPZignLicpID4gLTEpIHtcbiAgICAgIHBhdGggPSBsbmcuc3BsaXQoJy4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdXRpbHMuZ2V0UGF0aCh0aGlzLmRhdGEsIHBhdGgpO1xuICB9XG5cbiAgYWRkUmVzb3VyY2UobG5nLCBucywga2V5LCB2YWx1ZSwgb3B0aW9ucyA9IHsgc2lsZW50OiBmYWxzZSB9KSB7XG4gICAgbGV0IGtleVNlcGFyYXRvciA9IHRoaXMub3B0aW9ucy5rZXlTZXBhcmF0b3I7XG4gICAgaWYgKGtleVNlcGFyYXRvciA9PT0gdW5kZWZpbmVkKSBrZXlTZXBhcmF0b3IgPSAnLic7XG5cbiAgICBsZXQgcGF0aCA9IFtsbmcsIG5zXTtcbiAgICBpZiAoa2V5KSBwYXRoID0gcGF0aC5jb25jYXQoa2V5U2VwYXJhdG9yID8ga2V5LnNwbGl0KGtleVNlcGFyYXRvcikgOiBrZXkpO1xuXG4gICAgaWYgKGxuZy5pbmRleE9mKCcuJykgPiAtMSkge1xuICAgICAgcGF0aCA9IGxuZy5zcGxpdCgnLicpO1xuICAgICAgdmFsdWUgPSBucztcbiAgICAgIG5zID0gcGF0aFsxXTtcbiAgICB9XG5cbiAgICB0aGlzLmFkZE5hbWVzcGFjZXMobnMpO1xuXG4gICAgdXRpbHMuc2V0UGF0aCh0aGlzLmRhdGEsIHBhdGgsIHZhbHVlKTtcblxuICAgIGlmICghb3B0aW9ucy5zaWxlbnQpIHRoaXMuZW1pdCgnYWRkZWQnLCBsbmcsIG5zLCBrZXksIHZhbHVlKTtcbiAgfVxuXG4gIGFkZFJlc291cmNlcyhsbmcsIG5zLCByZXNvdXJjZXMsIG9wdGlvbnMgPSB7IHNpbGVudDogZmFsc2UgfSkge1xuICAgIC8qIGVzbGludCBuby1yZXN0cmljdGVkLXN5bnRheDogMCAqL1xuICAgIGZvciAoY29uc3QgbSBpbiByZXNvdXJjZXMpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIHJlc291cmNlc1ttXSA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5hcHBseShyZXNvdXJjZXNbbV0pID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgICApXG4gICAgICAgIHRoaXMuYWRkUmVzb3VyY2UobG5nLCBucywgbSwgcmVzb3VyY2VzW21dLCB7IHNpbGVudDogdHJ1ZSB9KTtcbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLnNpbGVudCkgdGhpcy5lbWl0KCdhZGRlZCcsIGxuZywgbnMsIHJlc291cmNlcyk7XG4gIH1cblxuICBhZGRSZXNvdXJjZUJ1bmRsZShsbmcsIG5zLCByZXNvdXJjZXMsIGRlZXAsIG92ZXJ3cml0ZSwgb3B0aW9ucyA9IHsgc2lsZW50OiBmYWxzZSB9KSB7XG4gICAgbGV0IHBhdGggPSBbbG5nLCBuc107XG4gICAgaWYgKGxuZy5pbmRleE9mKCcuJykgPiAtMSkge1xuICAgICAgcGF0aCA9IGxuZy5zcGxpdCgnLicpO1xuICAgICAgZGVlcCA9IHJlc291cmNlcztcbiAgICAgIHJlc291cmNlcyA9IG5zO1xuICAgICAgbnMgPSBwYXRoWzFdO1xuICAgIH1cblxuICAgIHRoaXMuYWRkTmFtZXNwYWNlcyhucyk7XG5cbiAgICBsZXQgcGFjayA9IHV0aWxzLmdldFBhdGgodGhpcy5kYXRhLCBwYXRoKSB8fCB7fTtcblxuICAgIGlmIChkZWVwKSB7XG4gICAgICB1dGlscy5kZWVwRXh0ZW5kKHBhY2ssIHJlc291cmNlcywgb3ZlcndyaXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFjayA9IHsgLi4ucGFjaywgLi4ucmVzb3VyY2VzIH07XG4gICAgfVxuXG4gICAgdXRpbHMuc2V0UGF0aCh0aGlzLmRhdGEsIHBhdGgsIHBhY2spO1xuXG4gICAgaWYgKCFvcHRpb25zLnNpbGVudCkgdGhpcy5lbWl0KCdhZGRlZCcsIGxuZywgbnMsIHJlc291cmNlcyk7XG4gIH1cblxuICByZW1vdmVSZXNvdXJjZUJ1bmRsZShsbmcsIG5zKSB7XG4gICAgaWYgKHRoaXMuaGFzUmVzb3VyY2VCdW5kbGUobG5nLCBucykpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLmRhdGFbbG5nXVtuc107XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlTmFtZXNwYWNlcyhucyk7XG5cbiAgICB0aGlzLmVtaXQoJ3JlbW92ZWQnLCBsbmcsIG5zKTtcbiAgfVxuXG4gIGhhc1Jlc291cmNlQnVuZGxlKGxuZywgbnMpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSZXNvdXJjZShsbmcsIG5zKSAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZ2V0UmVzb3VyY2VCdW5kbGUobG5nLCBucykge1xuICAgIGlmICghbnMpIG5zID0gdGhpcy5vcHRpb25zLmRlZmF1bHROUztcblxuICAgIC8vIENPTVBBVElCSUxJVFk6IHJlbW92ZSBleHRlbmQgaW4gdjIuMS4wXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb21wYXRpYmlsaXR5QVBJID09PSAndjEnKSByZXR1cm4geyAuLi57fSwgLi4udGhpcy5nZXRSZXNvdXJjZShsbmcsIG5zKSB9O1xuXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVzb3VyY2UobG5nLCBucyk7XG4gIH1cblxuICBnZXREYXRhQnlMYW5ndWFnZShsbmcpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhW2xuZ107XG4gIH1cblxuICB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZXNvdXJjZVN0b3JlO1xuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBwcm9jZXNzb3JzOiB7fSxcblxuICBhZGRQb3N0UHJvY2Vzc29yKG1vZHVsZSkge1xuICAgIHRoaXMucHJvY2Vzc29yc1ttb2R1bGUubmFtZV0gPSBtb2R1bGU7XG4gIH0sXG5cbiAgaGFuZGxlKHByb2Nlc3NvcnMsIHZhbHVlLCBrZXksIG9wdGlvbnMsIHRyYW5zbGF0b3IpIHtcbiAgICBwcm9jZXNzb3JzLmZvckVhY2gocHJvY2Vzc29yID0+IHtcbiAgICAgIGlmICh0aGlzLnByb2Nlc3NvcnNbcHJvY2Vzc29yXSlcbiAgICAgICAgdmFsdWUgPSB0aGlzLnByb2Nlc3NvcnNbcHJvY2Vzc29yXS5wcm9jZXNzKHZhbHVlLCBrZXksIG9wdGlvbnMsIHRyYW5zbGF0b3IpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9LFxufTtcbiIsImltcG9ydCBiYXNlTG9nZ2VyIGZyb20gJy4vbG9nZ2VyLmpzJztcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9FdmVudEVtaXR0ZXIuanMnO1xuaW1wb3J0IHBvc3RQcm9jZXNzb3IgZnJvbSAnLi9wb3N0UHJvY2Vzc29yLmpzJztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xuXG5jb25zdCBjaGVja2VkTG9hZGVkRm9yID0ge307XG5cbmNsYXNzIFRyYW5zbGF0b3IgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvcihzZXJ2aWNlcywgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAodXRpbHMuaXNJRTEwKSB7XG4gICAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTsgLy8gPD1JRTEwIGZpeCAodW5hYmxlIHRvIGNhbGwgcGFyZW50IGNvbnN0cnVjdG9yKVxuICAgIH1cblxuICAgIHV0aWxzLmNvcHkoXG4gICAgICBbXG4gICAgICAgICdyZXNvdXJjZVN0b3JlJyxcbiAgICAgICAgJ2xhbmd1YWdlVXRpbHMnLFxuICAgICAgICAncGx1cmFsUmVzb2x2ZXInLFxuICAgICAgICAnaW50ZXJwb2xhdG9yJyxcbiAgICAgICAgJ2JhY2tlbmRDb25uZWN0b3InLFxuICAgICAgICAnaTE4bkZvcm1hdCcsXG4gICAgICAgICd1dGlscycsXG4gICAgICBdLFxuICAgICAgc2VydmljZXMsXG4gICAgICB0aGlzLFxuICAgICk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIGlmICh0aGlzLm9wdGlvbnMua2V5U2VwYXJhdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5rZXlTZXBhcmF0b3IgPSAnLic7XG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIgPSBiYXNlTG9nZ2VyLmNyZWF0ZSgndHJhbnNsYXRvcicpO1xuICB9XG5cbiAgY2hhbmdlTGFuZ3VhZ2UobG5nKSB7XG4gICAgaWYgKGxuZykgdGhpcy5sYW5ndWFnZSA9IGxuZztcbiAgfVxuXG4gIGV4aXN0cyhrZXksIG9wdGlvbnMgPSB7IGludGVycG9sYXRpb246IHt9IH0pIHtcbiAgICBjb25zdCByZXNvbHZlZCA9IHRoaXMucmVzb2x2ZShrZXksIG9wdGlvbnMpO1xuICAgIHJldHVybiByZXNvbHZlZCAmJiByZXNvbHZlZC5yZXMgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGV4dHJhY3RGcm9tS2V5KGtleSwgb3B0aW9ucykge1xuICAgIGxldCBuc1NlcGFyYXRvciA9XG4gICAgICBvcHRpb25zLm5zU2VwYXJhdG9yICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLm5zU2VwYXJhdG9yIDogdGhpcy5vcHRpb25zLm5zU2VwYXJhdG9yO1xuICAgIGlmIChuc1NlcGFyYXRvciA9PT0gdW5kZWZpbmVkKSBuc1NlcGFyYXRvciA9ICc6JztcblxuICAgIGNvbnN0IGtleVNlcGFyYXRvciA9XG4gICAgICBvcHRpb25zLmtleVNlcGFyYXRvciAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5rZXlTZXBhcmF0b3IgOiB0aGlzLm9wdGlvbnMua2V5U2VwYXJhdG9yO1xuXG4gICAgbGV0IG5hbWVzcGFjZXMgPSBvcHRpb25zLm5zIHx8IHRoaXMub3B0aW9ucy5kZWZhdWx0TlM7XG4gICAgaWYgKG5zU2VwYXJhdG9yICYmIGtleS5pbmRleE9mKG5zU2VwYXJhdG9yKSA+IC0xKSB7XG4gICAgICBjb25zdCBtID0ga2V5Lm1hdGNoKHRoaXMuaW50ZXJwb2xhdG9yLm5lc3RpbmdSZWdleHApO1xuICAgICAgaWYgKG0gJiYgbS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAga2V5LFxuICAgICAgICAgIG5hbWVzcGFjZXMsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBjb25zdCBwYXJ0cyA9IGtleS5zcGxpdChuc1NlcGFyYXRvcik7XG4gICAgICBpZiAoXG4gICAgICAgIG5zU2VwYXJhdG9yICE9PSBrZXlTZXBhcmF0b3IgfHxcbiAgICAgICAgKG5zU2VwYXJhdG9yID09PSBrZXlTZXBhcmF0b3IgJiYgdGhpcy5vcHRpb25zLm5zLmluZGV4T2YocGFydHNbMF0pID4gLTEpXG4gICAgICApXG4gICAgICAgIG5hbWVzcGFjZXMgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAga2V5ID0gcGFydHMuam9pbihrZXlTZXBhcmF0b3IpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG5hbWVzcGFjZXMgPT09ICdzdHJpbmcnKSBuYW1lc3BhY2VzID0gW25hbWVzcGFjZXNdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGtleSxcbiAgICAgIG5hbWVzcGFjZXMsXG4gICAgfTtcbiAgfVxuXG4gIHRyYW5zbGF0ZShrZXlzLCBvcHRpb25zLCBsYXN0S2V5KSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JyAmJiB0aGlzLm9wdGlvbnMub3ZlcmxvYWRUcmFuc2xhdGlvbk9wdGlvbkhhbmRsZXIpIHtcbiAgICAgIC8qIGVzbGludCBwcmVmZXItcmVzdC1wYXJhbXM6IDAgKi9cbiAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMub3ZlcmxvYWRUcmFuc2xhdGlvbk9wdGlvbkhhbmRsZXIoYXJndW1lbnRzKTtcbiAgICB9XG4gICAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG5cbiAgICAvLyBub24gdmFsaWQga2V5cyBoYW5kbGluZ1xuICAgIGlmIChrZXlzID09PSB1bmRlZmluZWQgfHwga2V5cyA9PT0gbnVsbCAvKiB8fCBrZXlzID09PSAnJyovKSByZXR1cm4gJyc7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGtleXMpKSBrZXlzID0gW1N0cmluZyhrZXlzKV07XG5cbiAgICAvLyBzZXBhcmF0b3JzXG4gICAgY29uc3Qga2V5U2VwYXJhdG9yID1cbiAgICAgIG9wdGlvbnMua2V5U2VwYXJhdG9yICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmtleVNlcGFyYXRvciA6IHRoaXMub3B0aW9ucy5rZXlTZXBhcmF0b3I7XG5cbiAgICAvLyBnZXQgbmFtZXNwYWNlKHMpXG4gICAgY29uc3QgeyBrZXksIG5hbWVzcGFjZXMgfSA9IHRoaXMuZXh0cmFjdEZyb21LZXkoa2V5c1trZXlzLmxlbmd0aCAtIDFdLCBvcHRpb25zKTtcbiAgICBjb25zdCBuYW1lc3BhY2UgPSBuYW1lc3BhY2VzW25hbWVzcGFjZXMubGVuZ3RoIC0gMV07XG5cbiAgICAvLyByZXR1cm4ga2V5IG9uIENJTW9kZVxuICAgIGNvbnN0IGxuZyA9IG9wdGlvbnMubG5nIHx8IHRoaXMubGFuZ3VhZ2U7XG4gICAgY29uc3QgYXBwZW5kTmFtZXNwYWNlVG9DSU1vZGUgPVxuICAgICAgb3B0aW9ucy5hcHBlbmROYW1lc3BhY2VUb0NJTW9kZSB8fCB0aGlzLm9wdGlvbnMuYXBwZW5kTmFtZXNwYWNlVG9DSU1vZGU7XG4gICAgaWYgKGxuZyAmJiBsbmcudG9Mb3dlckNhc2UoKSA9PT0gJ2NpbW9kZScpIHtcbiAgICAgIGlmIChhcHBlbmROYW1lc3BhY2VUb0NJTW9kZSkge1xuICAgICAgICBjb25zdCBuc1NlcGFyYXRvciA9IG9wdGlvbnMubnNTZXBhcmF0b3IgfHwgdGhpcy5vcHRpb25zLm5zU2VwYXJhdG9yO1xuICAgICAgICByZXR1cm4gbmFtZXNwYWNlICsgbnNTZXBhcmF0b3IgKyBrZXk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBrZXk7XG4gICAgfVxuXG4gICAgLy8gcmVzb2x2ZSBmcm9tIHN0b3JlXG4gICAgY29uc3QgcmVzb2x2ZWQgPSB0aGlzLnJlc29sdmUoa2V5cywgb3B0aW9ucyk7XG4gICAgbGV0IHJlcyA9IHJlc29sdmVkICYmIHJlc29sdmVkLnJlcztcbiAgICBjb25zdCByZXNVc2VkS2V5ID0gKHJlc29sdmVkICYmIHJlc29sdmVkLnVzZWRLZXkpIHx8IGtleTtcbiAgICBjb25zdCByZXNFeGFjdFVzZWRLZXkgPSAocmVzb2x2ZWQgJiYgcmVzb2x2ZWQuZXhhY3RVc2VkS2V5KSB8fCBrZXk7XG5cbiAgICBjb25zdCByZXNUeXBlID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5hcHBseShyZXMpO1xuICAgIGNvbnN0IG5vT2JqZWN0ID0gWydbb2JqZWN0IE51bWJlcl0nLCAnW29iamVjdCBGdW5jdGlvbl0nLCAnW29iamVjdCBSZWdFeHBdJ107XG4gICAgY29uc3Qgam9pbkFycmF5cyA9XG4gICAgICBvcHRpb25zLmpvaW5BcnJheXMgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuam9pbkFycmF5cyA6IHRoaXMub3B0aW9ucy5qb2luQXJyYXlzO1xuXG4gICAgLy8gb2JqZWN0XG4gICAgY29uc3QgaGFuZGxlQXNPYmplY3RJbkkxOG5Gb3JtYXQgPSAhdGhpcy5pMThuRm9ybWF0IHx8IHRoaXMuaTE4bkZvcm1hdC5oYW5kbGVBc09iamVjdDtcbiAgICBjb25zdCBoYW5kbGVBc09iamVjdCA9XG4gICAgICB0eXBlb2YgcmVzICE9PSAnc3RyaW5nJyAmJiB0eXBlb2YgcmVzICE9PSAnYm9vbGVhbicgJiYgdHlwZW9mIHJlcyAhPT0gJ251bWJlcic7XG4gICAgaWYgKFxuICAgICAgaGFuZGxlQXNPYmplY3RJbkkxOG5Gb3JtYXQgJiZcbiAgICAgIHJlcyAmJlxuICAgICAgaGFuZGxlQXNPYmplY3QgJiZcbiAgICAgIG5vT2JqZWN0LmluZGV4T2YocmVzVHlwZSkgPCAwICYmXG4gICAgICAhKHR5cGVvZiBqb2luQXJyYXlzID09PSAnc3RyaW5nJyAmJiByZXNUeXBlID09PSAnW29iamVjdCBBcnJheV0nKVxuICAgICkge1xuICAgICAgaWYgKCFvcHRpb25zLnJldHVybk9iamVjdHMgJiYgIXRoaXMub3B0aW9ucy5yZXR1cm5PYmplY3RzKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLndhcm4oJ2FjY2Vzc2luZyBhbiBvYmplY3QgLSBidXQgcmV0dXJuT2JqZWN0cyBvcHRpb25zIGlzIG5vdCBlbmFibGVkIScpO1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnJldHVybmVkT2JqZWN0SGFuZGxlclxuICAgICAgICAgID8gdGhpcy5vcHRpb25zLnJldHVybmVkT2JqZWN0SGFuZGxlcihyZXNVc2VkS2V5LCByZXMsIG9wdGlvbnMpXG4gICAgICAgICAgOiBga2V5ICcke2tleX0gKCR7dGhpcy5sYW5ndWFnZX0pJyByZXR1cm5lZCBhbiBvYmplY3QgaW5zdGVhZCBvZiBzdHJpbmcuYDtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgd2UgZ290IGEgc2VwYXJhdG9yIHdlIGxvb3Agb3ZlciBjaGlsZHJlbiAtIGVsc2Ugd2UganVzdCByZXR1cm4gb2JqZWN0IGFzIGlzXG4gICAgICAvLyBhcyBoYXZpbmcgaXQgc2V0IHRvIGZhbHNlIG1lYW5zIG5vIGhpZXJhcmNoeSBzbyBubyBsb29rdXAgZm9yIG5lc3RlZCB2YWx1ZXNcbiAgICAgIGlmIChrZXlTZXBhcmF0b3IpIHtcbiAgICAgICAgY29uc3QgcmVzVHlwZUlzQXJyYXkgPSByZXNUeXBlID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgICBjb25zdCBjb3B5ID0gcmVzVHlwZUlzQXJyYXkgPyBbXSA6IHt9OyAvLyBhcHBseSBjaGlsZCB0cmFuc2xhdGlvbiBvbiBhIGNvcHlcblxuICAgICAgICAvKiBlc2xpbnQgbm8tcmVzdHJpY3RlZC1zeW50YXg6IDAgKi9cbiAgICAgICAgbGV0IG5ld0tleVRvVXNlID0gcmVzVHlwZUlzQXJyYXkgPyByZXNFeGFjdFVzZWRLZXkgOiByZXNVc2VkS2V5O1xuICAgICAgICBmb3IgKGNvbnN0IG0gaW4gcmVzKSB7XG4gICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChyZXMsIG0pKSB7XG4gICAgICAgICAgICBjb25zdCBkZWVwS2V5ID0gYCR7bmV3S2V5VG9Vc2V9JHtrZXlTZXBhcmF0b3J9JHttfWA7XG4gICAgICAgICAgICBjb3B5W21dID0gdGhpcy50cmFuc2xhdGUoZGVlcEtleSwge1xuICAgICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgICAuLi57IGpvaW5BcnJheXM6IGZhbHNlLCBuczogbmFtZXNwYWNlcyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoY29weVttXSA9PT0gZGVlcEtleSkgY29weVttXSA9IHJlc1ttXTsgLy8gaWYgbm90aGluZyBmb3VuZCB1c2Ugb3JnaW5hbCB2YWx1ZSBhcyBmYWxsYmFja1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXMgPSBjb3B5O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXG4gICAgICBoYW5kbGVBc09iamVjdEluSTE4bkZvcm1hdCAmJlxuICAgICAgdHlwZW9mIGpvaW5BcnJheXMgPT09ICdzdHJpbmcnICYmXG4gICAgICByZXNUeXBlID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgKSB7XG4gICAgICAvLyBhcnJheSBzcGVjaWFsIHRyZWF0bWVudFxuICAgICAgcmVzID0gcmVzLmpvaW4oam9pbkFycmF5cyk7XG4gICAgICBpZiAocmVzKSByZXMgPSB0aGlzLmV4dGVuZFRyYW5zbGF0aW9uKHJlcywga2V5cywgb3B0aW9ucywgbGFzdEtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHN0cmluZywgZW1wdHkgb3IgbnVsbFxuICAgICAgbGV0IHVzZWREZWZhdWx0ID0gZmFsc2U7XG4gICAgICBsZXQgdXNlZEtleSA9IGZhbHNlO1xuXG4gICAgICAvLyBmYWxsYmFjayB2YWx1ZVxuICAgICAgaWYgKCF0aGlzLmlzVmFsaWRMb29rdXAocmVzKSAmJiBvcHRpb25zLmRlZmF1bHRWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVzZWREZWZhdWx0ID0gdHJ1ZTtcblxuICAgICAgICBpZiAob3B0aW9ucy5jb3VudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgY29uc3Qgc3VmZml4ID0gdGhpcy5wbHVyYWxSZXNvbHZlci5nZXRTdWZmaXgobG5nLCBvcHRpb25zLmNvdW50KTtcbiAgICAgICAgICByZXMgPSBvcHRpb25zW2BkZWZhdWx0VmFsdWUke3N1ZmZpeH1gXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJlcykgcmVzID0gb3B0aW9ucy5kZWZhdWx0VmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaXNWYWxpZExvb2t1cChyZXMpKSB7XG4gICAgICAgIHVzZWRLZXkgPSB0cnVlO1xuICAgICAgICByZXMgPSBrZXk7XG4gICAgICB9XG5cbiAgICAgIC8vIHNhdmUgbWlzc2luZ1xuICAgICAgY29uc3QgdXBkYXRlTWlzc2luZyA9XG4gICAgICAgIG9wdGlvbnMuZGVmYXVsdFZhbHVlICYmIG9wdGlvbnMuZGVmYXVsdFZhbHVlICE9PSByZXMgJiYgdGhpcy5vcHRpb25zLnVwZGF0ZU1pc3Npbmc7XG4gICAgICBpZiAodXNlZEtleSB8fCB1c2VkRGVmYXVsdCB8fCB1cGRhdGVNaXNzaW5nKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmxvZyhcbiAgICAgICAgICB1cGRhdGVNaXNzaW5nID8gJ3VwZGF0ZUtleScgOiAnbWlzc2luZ0tleScsXG4gICAgICAgICAgbG5nLFxuICAgICAgICAgIG5hbWVzcGFjZSxcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgdXBkYXRlTWlzc2luZyA/IG9wdGlvbnMuZGVmYXVsdFZhbHVlIDogcmVzLFxuICAgICAgICApO1xuICAgICAgICBpZiAoa2V5U2VwYXJhdG9yKSB7XG4gICAgICAgICAgY29uc3QgZmsgPSB0aGlzLnJlc29sdmUoa2V5LCB7IC4uLm9wdGlvbnMsIGtleVNlcGFyYXRvcjogZmFsc2UgfSk7XG4gICAgICAgICAgaWYgKGZrICYmIGZrLnJlcylcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLndhcm4oXG4gICAgICAgICAgICAgICdTZWVtcyB0aGUgbG9hZGVkIHRyYW5zbGF0aW9ucyB3ZXJlIGluIGZsYXQgSlNPTiBmb3JtYXQgaW5zdGVhZCBvZiBuZXN0ZWQuIEVpdGhlciBzZXQga2V5U2VwYXJhdG9yOiBmYWxzZSBvbiBpbml0IG9yIG1ha2Ugc3VyZSB5b3VyIHRyYW5zbGF0aW9ucyBhcmUgcHVibGlzaGVkIGluIG5lc3RlZCBmb3JtYXQuJyxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbG5ncyA9IFtdO1xuICAgICAgICBjb25zdCBmYWxsYmFja0xuZ3MgPSB0aGlzLmxhbmd1YWdlVXRpbHMuZ2V0RmFsbGJhY2tDb2RlcyhcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuZmFsbGJhY2tMbmcsXG4gICAgICAgICAgb3B0aW9ucy5sbmcgfHwgdGhpcy5sYW5ndWFnZSxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zYXZlTWlzc2luZ1RvID09PSAnZmFsbGJhY2snICYmIGZhbGxiYWNrTG5ncyAmJiBmYWxsYmFja0xuZ3NbMF0pIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZhbGxiYWNrTG5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbG5ncy5wdXNoKGZhbGxiYWNrTG5nc1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5zYXZlTWlzc2luZ1RvID09PSAnYWxsJykge1xuICAgICAgICAgIGxuZ3MgPSB0aGlzLmxhbmd1YWdlVXRpbHMudG9SZXNvbHZlSGllcmFyY2h5KG9wdGlvbnMubG5nIHx8IHRoaXMubGFuZ3VhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxuZ3MucHVzaChvcHRpb25zLmxuZyB8fCB0aGlzLmxhbmd1YWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlbmQgPSAobCwgaykgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWlzc2luZ0tleUhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5taXNzaW5nS2V5SGFuZGxlcihcbiAgICAgICAgICAgICAgbCxcbiAgICAgICAgICAgICAgbmFtZXNwYWNlLFxuICAgICAgICAgICAgICBrLFxuICAgICAgICAgICAgICB1cGRhdGVNaXNzaW5nID8gb3B0aW9ucy5kZWZhdWx0VmFsdWUgOiByZXMsXG4gICAgICAgICAgICAgIHVwZGF0ZU1pc3NpbmcsXG4gICAgICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5iYWNrZW5kQ29ubmVjdG9yICYmIHRoaXMuYmFja2VuZENvbm5lY3Rvci5zYXZlTWlzc2luZykge1xuICAgICAgICAgICAgdGhpcy5iYWNrZW5kQ29ubmVjdG9yLnNhdmVNaXNzaW5nKFxuICAgICAgICAgICAgICBsLFxuICAgICAgICAgICAgICBuYW1lc3BhY2UsXG4gICAgICAgICAgICAgIGssXG4gICAgICAgICAgICAgIHVwZGF0ZU1pc3NpbmcgPyBvcHRpb25zLmRlZmF1bHRWYWx1ZSA6IHJlcyxcbiAgICAgICAgICAgICAgdXBkYXRlTWlzc2luZyxcbiAgICAgICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZW1pdCgnbWlzc2luZ0tleScsIGwsIG5hbWVzcGFjZSwgaywgcmVzKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNhdmVNaXNzaW5nKSB7XG4gICAgICAgICAgY29uc3QgbmVlZHNQbHVyYWxIYW5kbGluZyA9XG4gICAgICAgICAgICBvcHRpb25zLmNvdW50ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9wdGlvbnMuY291bnQgIT09ICdzdHJpbmcnO1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2F2ZU1pc3NpbmdQbHVyYWxzICYmIG5lZWRzUGx1cmFsSGFuZGxpbmcpIHtcbiAgICAgICAgICAgIGxuZ3MuZm9yRWFjaChsID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgcGx1cmFscyA9IHRoaXMucGx1cmFsUmVzb2x2ZXIuZ2V0UGx1cmFsRm9ybXNPZktleShsLCBrZXkpO1xuXG4gICAgICAgICAgICAgIHBsdXJhbHMuZm9yRWFjaChwID0+IHNlbmQoW2xdLCBwKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VuZChsbmdzLCBrZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBleHRlbmRcbiAgICAgIHJlcyA9IHRoaXMuZXh0ZW5kVHJhbnNsYXRpb24ocmVzLCBrZXlzLCBvcHRpb25zLCByZXNvbHZlZCwgbGFzdEtleSk7XG5cbiAgICAgIC8vIGFwcGVuZCBuYW1lc3BhY2UgaWYgc3RpbGwga2V5XG4gICAgICBpZiAodXNlZEtleSAmJiByZXMgPT09IGtleSAmJiB0aGlzLm9wdGlvbnMuYXBwZW5kTmFtZXNwYWNlVG9NaXNzaW5nS2V5KVxuICAgICAgICByZXMgPSBgJHtuYW1lc3BhY2V9OiR7a2V5fWA7XG5cbiAgICAgIC8vIHBhcnNlTWlzc2luZ0tleUhhbmRsZXJcbiAgICAgIGlmICh1c2VkS2V5ICYmIHRoaXMub3B0aW9ucy5wYXJzZU1pc3NpbmdLZXlIYW5kbGVyKVxuICAgICAgICByZXMgPSB0aGlzLm9wdGlvbnMucGFyc2VNaXNzaW5nS2V5SGFuZGxlcihyZXMpO1xuICAgIH1cblxuICAgIC8vIHJldHVyblxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBleHRlbmRUcmFuc2xhdGlvbihyZXMsIGtleSwgb3B0aW9ucywgcmVzb2x2ZWQsIGxhc3RLZXkpIHtcbiAgICBpZiAodGhpcy5pMThuRm9ybWF0ICYmIHRoaXMuaTE4bkZvcm1hdC5wYXJzZSkge1xuICAgICAgcmVzID0gdGhpcy5pMThuRm9ybWF0LnBhcnNlKFxuICAgICAgICByZXMsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIHJlc29sdmVkLnVzZWRMbmcsXG4gICAgICAgIHJlc29sdmVkLnVzZWROUyxcbiAgICAgICAgcmVzb2x2ZWQudXNlZEtleSxcbiAgICAgICAgeyByZXNvbHZlZCB9LFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKCFvcHRpb25zLnNraXBJbnRlcnBvbGF0aW9uKSB7XG4gICAgICAvLyBpMThuZXh0LnBhcnNpbmdcbiAgICAgIGlmIChvcHRpb25zLmludGVycG9sYXRpb24pXG4gICAgICAgIHRoaXMuaW50ZXJwb2xhdG9yLmluaXQoe1xuICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgLi4ueyBpbnRlcnBvbGF0aW9uOiB7IC4uLnRoaXMub3B0aW9ucy5pbnRlcnBvbGF0aW9uLCAuLi5vcHRpb25zLmludGVycG9sYXRpb24gfSB9LFxuICAgICAgICB9KTtcbiAgICAgIGNvbnN0IHNraXBPblZhcmlhYmxlcyA9XG4gICAgICAgIChvcHRpb25zLmludGVycG9sYXRpb24gJiYgb3B0aW9ucy5pbnRlcnBvbGF0aW9uLnNraXBPblZhcmlhYmxlcykgfHxcbiAgICAgICAgdGhpcy5vcHRpb25zLmludGVycG9sYXRpb24uc2tpcE9uVmFyaWFibGVzO1xuICAgICAgbGV0IG5lc3RCZWY7XG4gICAgICBpZiAoc2tpcE9uVmFyaWFibGVzKSB7XG4gICAgICAgIGNvbnN0IG5iID0gcmVzLm1hdGNoKHRoaXMuaW50ZXJwb2xhdG9yLm5lc3RpbmdSZWdleHApO1xuICAgICAgICAvLyBoYXMgbmVzdGluZyBhZnRiZWZvcmVlciBpbnRlcnBvbGF0aW9uXG4gICAgICAgIG5lc3RCZWYgPSBuYiAmJiBuYi5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIC8vIGludGVycG9sYXRlXG4gICAgICBsZXQgZGF0YSA9IG9wdGlvbnMucmVwbGFjZSAmJiB0eXBlb2Ygb3B0aW9ucy5yZXBsYWNlICE9PSAnc3RyaW5nJyA/IG9wdGlvbnMucmVwbGFjZSA6IG9wdGlvbnM7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmludGVycG9sYXRpb24uZGVmYXVsdFZhcmlhYmxlcylcbiAgICAgICAgZGF0YSA9IHsgLi4udGhpcy5vcHRpb25zLmludGVycG9sYXRpb24uZGVmYXVsdFZhcmlhYmxlcywgLi4uZGF0YSB9O1xuICAgICAgcmVzID0gdGhpcy5pbnRlcnBvbGF0b3IuaW50ZXJwb2xhdGUocmVzLCBkYXRhLCBvcHRpb25zLmxuZyB8fCB0aGlzLmxhbmd1YWdlLCBvcHRpb25zKTtcblxuICAgICAgLy8gbmVzdGluZ1xuICAgICAgaWYgKHNraXBPblZhcmlhYmxlcykge1xuICAgICAgICBjb25zdCBuYSA9IHJlcy5tYXRjaCh0aGlzLmludGVycG9sYXRvci5uZXN0aW5nUmVnZXhwKTtcbiAgICAgICAgLy8gaGFzIG5lc3RpbmcgYWZ0ZXIgaW50ZXJwb2xhdGlvblxuICAgICAgICBjb25zdCBuZXN0QWZ0ID0gbmEgJiYgbmEubGVuZ3RoO1xuICAgICAgICBpZiAobmVzdEJlZiA8IG5lc3RBZnQpIG9wdGlvbnMubmVzdCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMubmVzdCAhPT0gZmFsc2UpXG4gICAgICAgIHJlcyA9IHRoaXMuaW50ZXJwb2xhdG9yLm5lc3QoXG4gICAgICAgICAgcmVzLFxuICAgICAgICAgICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICBpZiAobGFzdEtleSAmJiBsYXN0S2V5WzBdID09PSBhcmdzWzBdICYmICFvcHRpb25zLmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgdGhpcy5sb2dnZXIud2FybihcbiAgICAgICAgICAgICAgICBgSXQgc2VlbXMgeW91IGFyZSBuZXN0aW5nIHJlY3Vyc2l2ZWx5IGtleTogJHthcmdzWzBdfSBpbiBrZXk6ICR7a2V5WzBdfWAsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRlKC4uLmFyZ3MsIGtleSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBvcHRpb25zLFxuICAgICAgICApO1xuXG4gICAgICBpZiAob3B0aW9ucy5pbnRlcnBvbGF0aW9uKSB0aGlzLmludGVycG9sYXRvci5yZXNldCgpO1xuICAgIH1cblxuICAgIC8vIHBvc3QgcHJvY2Vzc1xuICAgIGNvbnN0IHBvc3RQcm9jZXNzID0gb3B0aW9ucy5wb3N0UHJvY2VzcyB8fCB0aGlzLm9wdGlvbnMucG9zdFByb2Nlc3M7XG4gICAgY29uc3QgcG9zdFByb2Nlc3Nvck5hbWVzID0gdHlwZW9mIHBvc3RQcm9jZXNzID09PSAnc3RyaW5nJyA/IFtwb3N0UHJvY2Vzc10gOiBwb3N0UHJvY2VzcztcblxuICAgIGlmIChcbiAgICAgIHJlcyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICByZXMgIT09IG51bGwgJiZcbiAgICAgIHBvc3RQcm9jZXNzb3JOYW1lcyAmJlxuICAgICAgcG9zdFByb2Nlc3Nvck5hbWVzLmxlbmd0aCAmJlxuICAgICAgb3B0aW9ucy5hcHBseVBvc3RQcm9jZXNzb3IgIT09IGZhbHNlXG4gICAgKSB7XG4gICAgICByZXMgPSBwb3N0UHJvY2Vzc29yLmhhbmRsZShcbiAgICAgICAgcG9zdFByb2Nlc3Nvck5hbWVzLFxuICAgICAgICByZXMsXG4gICAgICAgIGtleSxcbiAgICAgICAgdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5wb3N0UHJvY2Vzc1Bhc3NSZXNvbHZlZFxuICAgICAgICAgID8geyBpMThuUmVzb2x2ZWQ6IHJlc29sdmVkLCAuLi5vcHRpb25zIH1cbiAgICAgICAgICA6IG9wdGlvbnMsXG4gICAgICAgIHRoaXMsXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICByZXNvbHZlKGtleXMsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBmb3VuZDtcbiAgICBsZXQgdXNlZEtleTsgLy8gcGxhaW4ga2V5XG4gICAgbGV0IGV4YWN0VXNlZEtleTsgLy8ga2V5IHdpdGggY29udGV4dCAvIHBsdXJhbFxuICAgIGxldCB1c2VkTG5nO1xuICAgIGxldCB1c2VkTlM7XG5cbiAgICBpZiAodHlwZW9mIGtleXMgPT09ICdzdHJpbmcnKSBrZXlzID0gW2tleXNdO1xuXG4gICAgLy8gZm9yRWFjaCBwb3NzaWJsZSBrZXlcbiAgICBrZXlzLmZvckVhY2goayA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkTG9va3VwKGZvdW5kKSkgcmV0dXJuO1xuICAgICAgY29uc3QgZXh0cmFjdGVkID0gdGhpcy5leHRyYWN0RnJvbUtleShrLCBvcHRpb25zKTtcbiAgICAgIGNvbnN0IGtleSA9IGV4dHJhY3RlZC5rZXk7XG4gICAgICB1c2VkS2V5ID0ga2V5O1xuICAgICAgbGV0IG5hbWVzcGFjZXMgPSBleHRyYWN0ZWQubmFtZXNwYWNlcztcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZmFsbGJhY2tOUykgbmFtZXNwYWNlcyA9IG5hbWVzcGFjZXMuY29uY2F0KHRoaXMub3B0aW9ucy5mYWxsYmFja05TKTtcblxuICAgICAgY29uc3QgbmVlZHNQbHVyYWxIYW5kbGluZyA9IG9wdGlvbnMuY291bnQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb3B0aW9ucy5jb3VudCAhPT0gJ3N0cmluZyc7XG4gICAgICBjb25zdCBuZWVkc0NvbnRleHRIYW5kbGluZyA9XG4gICAgICAgIG9wdGlvbnMuY29udGV4dCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgIHR5cGVvZiBvcHRpb25zLmNvbnRleHQgPT09ICdzdHJpbmcnICYmXG4gICAgICAgIG9wdGlvbnMuY29udGV4dCAhPT0gJyc7XG5cbiAgICAgIGNvbnN0IGNvZGVzID0gb3B0aW9ucy5sbmdzXG4gICAgICAgID8gb3B0aW9ucy5sbmdzXG4gICAgICAgIDogdGhpcy5sYW5ndWFnZVV0aWxzLnRvUmVzb2x2ZUhpZXJhcmNoeShvcHRpb25zLmxuZyB8fCB0aGlzLmxhbmd1YWdlLCBvcHRpb25zLmZhbGxiYWNrTG5nKTtcblxuICAgICAgbmFtZXNwYWNlcy5mb3JFYWNoKG5zID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZExvb2t1cChmb3VuZCkpIHJldHVybjtcbiAgICAgICAgdXNlZE5TID0gbnM7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICFjaGVja2VkTG9hZGVkRm9yW2Ake2NvZGVzWzBdfS0ke25zfWBdICYmXG4gICAgICAgICAgdGhpcy51dGlscyAmJlxuICAgICAgICAgIHRoaXMudXRpbHMuaGFzTG9hZGVkTmFtZXNwYWNlICYmXG4gICAgICAgICAgIXRoaXMudXRpbHMuaGFzTG9hZGVkTmFtZXNwYWNlKHVzZWROUylcbiAgICAgICAgKSB7XG4gICAgICAgICAgY2hlY2tlZExvYWRlZEZvcltgJHtjb2Rlc1swXX0tJHtuc31gXSA9IHRydWU7XG4gICAgICAgICAgdGhpcy5sb2dnZXIud2FybihcbiAgICAgICAgICAgIGBrZXkgXCIke3VzZWRLZXl9XCIgZm9yIGxhbmd1YWdlcyBcIiR7Y29kZXMuam9pbihcbiAgICAgICAgICAgICAgJywgJyxcbiAgICAgICAgICAgICl9XCIgd29uJ3QgZ2V0IHJlc29sdmVkIGFzIG5hbWVzcGFjZSBcIiR7dXNlZE5TfVwiIHdhcyBub3QgeWV0IGxvYWRlZGAsXG4gICAgICAgICAgICAnVGhpcyBtZWFucyBzb21ldGhpbmcgSVMgV1JPTkcgaW4geW91ciBzZXR1cC4gWW91IGFjY2VzcyB0aGUgdCBmdW5jdGlvbiBiZWZvcmUgaTE4bmV4dC5pbml0IC8gaTE4bmV4dC5sb2FkTmFtZXNwYWNlIC8gaTE4bmV4dC5jaGFuZ2VMYW5ndWFnZSB3YXMgZG9uZS4gV2FpdCBmb3IgdGhlIGNhbGxiYWNrIG9yIFByb21pc2UgdG8gcmVzb2x2ZSBiZWZvcmUgYWNjZXNzaW5nIGl0ISEhJyxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29kZXMuZm9yRWFjaChjb2RlID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5pc1ZhbGlkTG9va3VwKGZvdW5kKSkgcmV0dXJuO1xuICAgICAgICAgIHVzZWRMbmcgPSBjb2RlO1xuXG4gICAgICAgICAgbGV0IGZpbmFsS2V5ID0ga2V5O1xuICAgICAgICAgIGNvbnN0IGZpbmFsS2V5cyA9IFtmaW5hbEtleV07XG5cbiAgICAgICAgICBpZiAodGhpcy5pMThuRm9ybWF0ICYmIHRoaXMuaTE4bkZvcm1hdC5hZGRMb29rdXBLZXlzKSB7XG4gICAgICAgICAgICB0aGlzLmkxOG5Gb3JtYXQuYWRkTG9va3VwS2V5cyhmaW5hbEtleXMsIGtleSwgY29kZSwgbnMsIG9wdGlvbnMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgcGx1cmFsU3VmZml4O1xuICAgICAgICAgICAgaWYgKG5lZWRzUGx1cmFsSGFuZGxpbmcpXG4gICAgICAgICAgICAgIHBsdXJhbFN1ZmZpeCA9IHRoaXMucGx1cmFsUmVzb2x2ZXIuZ2V0U3VmZml4KGNvZGUsIG9wdGlvbnMuY291bnQpO1xuXG4gICAgICAgICAgICAvLyBmYWxsYmFjayBmb3IgcGx1cmFsIGlmIGNvbnRleHQgbm90IGZvdW5kXG4gICAgICAgICAgICBpZiAobmVlZHNQbHVyYWxIYW5kbGluZyAmJiBuZWVkc0NvbnRleHRIYW5kbGluZylcbiAgICAgICAgICAgICAgZmluYWxLZXlzLnB1c2goZmluYWxLZXkgKyBwbHVyYWxTdWZmaXgpO1xuXG4gICAgICAgICAgICAvLyBnZXQga2V5IGZvciBjb250ZXh0IGlmIG5lZWRlZFxuICAgICAgICAgICAgaWYgKG5lZWRzQ29udGV4dEhhbmRsaW5nKVxuICAgICAgICAgICAgICBmaW5hbEtleXMucHVzaCgoZmluYWxLZXkgKz0gYCR7dGhpcy5vcHRpb25zLmNvbnRleHRTZXBhcmF0b3J9JHtvcHRpb25zLmNvbnRleHR9YCkpO1xuXG4gICAgICAgICAgICAvLyBnZXQga2V5IGZvciBwbHVyYWwgaWYgbmVlZGVkXG4gICAgICAgICAgICBpZiAobmVlZHNQbHVyYWxIYW5kbGluZykgZmluYWxLZXlzLnB1c2goKGZpbmFsS2V5ICs9IHBsdXJhbFN1ZmZpeCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGl0ZXJhdGUgb3ZlciBmaW5hbEtleXMgc3RhcnRpbmcgd2l0aCBtb3N0IHNwZWNpZmljIHBsdXJhbGtleSAoLT4gY29udGV4dGtleSBvbmx5KSAtPiBzaW5ndWxhcmtleSBvbmx5XG4gICAgICAgICAgbGV0IHBvc3NpYmxlS2V5O1xuICAgICAgICAgIC8qIGVzbGludCBuby1jb25kLWFzc2lnbjogMCAqL1xuICAgICAgICAgIHdoaWxlICgocG9zc2libGVLZXkgPSBmaW5hbEtleXMucG9wKCkpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNWYWxpZExvb2t1cChmb3VuZCkpIHtcbiAgICAgICAgICAgICAgZXhhY3RVc2VkS2V5ID0gcG9zc2libGVLZXk7XG4gICAgICAgICAgICAgIGZvdW5kID0gdGhpcy5nZXRSZXNvdXJjZShjb2RlLCBucywgcG9zc2libGVLZXksIG9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7IHJlczogZm91bmQsIHVzZWRLZXksIGV4YWN0VXNlZEtleSwgdXNlZExuZywgdXNlZE5TIH07XG4gIH1cblxuICBpc1ZhbGlkTG9va3VwKHJlcykge1xuICAgIHJldHVybiAoXG4gICAgICByZXMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgISghdGhpcy5vcHRpb25zLnJldHVybk51bGwgJiYgcmVzID09PSBudWxsKSAmJlxuICAgICAgISghdGhpcy5vcHRpb25zLnJldHVybkVtcHR5U3RyaW5nICYmIHJlcyA9PT0gJycpXG4gICAgKTtcbiAgfVxuXG4gIGdldFJlc291cmNlKGNvZGUsIG5zLCBrZXksIG9wdGlvbnMgPSB7fSkge1xuICAgIGlmICh0aGlzLmkxOG5Gb3JtYXQgJiYgdGhpcy5pMThuRm9ybWF0LmdldFJlc291cmNlKVxuICAgICAgcmV0dXJuIHRoaXMuaTE4bkZvcm1hdC5nZXRSZXNvdXJjZShjb2RlLCBucywga2V5LCBvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcy5yZXNvdXJjZVN0b3JlLmdldFJlc291cmNlKGNvZGUsIG5zLCBrZXksIG9wdGlvbnMpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyYW5zbGF0b3I7XG4iLCJpbXBvcnQgYmFzZUxvZ2dlciBmcm9tICcuL2xvZ2dlci5qcyc7XG5cbmZ1bmN0aW9uIGNhcGl0YWxpemUoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSk7XG59XG5cbmNsYXNzIExhbmd1YWdlVXRpbCB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgLy8gdGVtcG9yYWwgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgV0hJVEVMSVNUIFJFTU9WQUxcbiAgICB0aGlzLndoaXRlbGlzdCA9IHRoaXMub3B0aW9ucy5zdXBwb3J0ZWRMbmdzIHx8IGZhbHNlO1xuICAgIC8vIGVuZCB0ZW1wb3JhbCBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSBXSElURUxJU1QgUkVNT1ZBTFxuXG4gICAgdGhpcy5zdXBwb3J0ZWRMbmdzID0gdGhpcy5vcHRpb25zLnN1cHBvcnRlZExuZ3MgfHwgZmFsc2U7XG4gICAgdGhpcy5sb2dnZXIgPSBiYXNlTG9nZ2VyLmNyZWF0ZSgnbGFuZ3VhZ2VVdGlscycpO1xuICB9XG5cbiAgZ2V0U2NyaXB0UGFydEZyb21Db2RlKGNvZGUpIHtcbiAgICBpZiAoIWNvZGUgfHwgY29kZS5pbmRleE9mKCctJykgPCAwKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IHAgPSBjb2RlLnNwbGl0KCctJyk7XG4gICAgaWYgKHAubGVuZ3RoID09PSAyKSByZXR1cm4gbnVsbDtcbiAgICBwLnBvcCgpO1xuICAgIGlmIChwW3AubGVuZ3RoIC0gMV0udG9Mb3dlckNhc2UoKSA9PT0gJ3gnKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gdGhpcy5mb3JtYXRMYW5ndWFnZUNvZGUocC5qb2luKCctJykpO1xuICB9XG5cbiAgZ2V0TGFuZ3VhZ2VQYXJ0RnJvbUNvZGUoY29kZSkge1xuICAgIGlmICghY29kZSB8fCBjb2RlLmluZGV4T2YoJy0nKSA8IDApIHJldHVybiBjb2RlO1xuXG4gICAgY29uc3QgcCA9IGNvZGUuc3BsaXQoJy0nKTtcbiAgICByZXR1cm4gdGhpcy5mb3JtYXRMYW5ndWFnZUNvZGUocFswXSk7XG4gIH1cblxuICBmb3JtYXRMYW5ndWFnZUNvZGUoY29kZSkge1xuICAgIC8vIGh0dHA6Ly93d3cuaWFuYS5vcmcvYXNzaWdubWVudHMvbGFuZ3VhZ2UtdGFncy9sYW5ndWFnZS10YWdzLnhodG1sXG4gICAgaWYgKHR5cGVvZiBjb2RlID09PSAnc3RyaW5nJyAmJiBjb2RlLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICBjb25zdCBzcGVjaWFsQ2FzZXMgPSBbJ2hhbnMnLCAnaGFudCcsICdsYXRuJywgJ2N5cmwnLCAnY2FucycsICdtb25nJywgJ2FyYWInXTtcbiAgICAgIGxldCBwID0gY29kZS5zcGxpdCgnLScpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmxvd2VyQ2FzZUxuZykge1xuICAgICAgICBwID0gcC5tYXAocGFydCA9PiBwYXJ0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgfSBlbHNlIGlmIChwLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBwWzBdID0gcFswXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBwWzFdID0gcFsxXS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgIGlmIChzcGVjaWFsQ2FzZXMuaW5kZXhPZihwWzFdLnRvTG93ZXJDYXNlKCkpID4gLTEpIHBbMV0gPSBjYXBpdGFsaXplKHBbMV0udG9Mb3dlckNhc2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHAubGVuZ3RoID09PSAzKSB7XG4gICAgICAgIHBbMF0gPSBwWzBdLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgLy8gaWYgbGVuZ2h0IDIgZ3Vlc3MgaXQncyBhIGNvdW50cnlcbiAgICAgICAgaWYgKHBbMV0ubGVuZ3RoID09PSAyKSBwWzFdID0gcFsxXS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICBpZiAocFswXSAhPT0gJ3NnbicgJiYgcFsyXS5sZW5ndGggPT09IDIpIHBbMl0gPSBwWzJdLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgaWYgKHNwZWNpYWxDYXNlcy5pbmRleE9mKHBbMV0udG9Mb3dlckNhc2UoKSkgPiAtMSkgcFsxXSA9IGNhcGl0YWxpemUocFsxXS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgaWYgKHNwZWNpYWxDYXNlcy5pbmRleE9mKHBbMl0udG9Mb3dlckNhc2UoKSkgPiAtMSkgcFsyXSA9IGNhcGl0YWxpemUocFsyXS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHAuam9pbignLScpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuY2xlYW5Db2RlIHx8IHRoaXMub3B0aW9ucy5sb3dlckNhc2VMbmcgPyBjb2RlLnRvTG93ZXJDYXNlKCkgOiBjb2RlO1xuICB9XG5cbiAgLy8gdGVtcG9yYWwgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgV0hJVEVMSVNUIFJFTU9WQUxcbiAgaXNXaGl0ZWxpc3RlZChjb2RlKSB7XG4gICAgdGhpcy5sb2dnZXIuZGVwcmVjYXRlKFxuICAgICAgJ2xhbmd1YWdlVXRpbHMuaXNXaGl0ZWxpc3RlZCcsXG4gICAgICAnZnVuY3Rpb24gXCJpc1doaXRlbGlzdGVkXCIgd2lsbCBiZSByZW5hbWVkIHRvIFwiaXNTdXBwb3J0ZWRDb2RlXCIgaW4gdGhlIG5leHQgbWFqb3IgLSBwbGVhc2UgbWFrZSBzdXJlIHRvIHJlbmFtZSBpdFxcJ3MgdXNhZ2UgYXNhcC4nLFxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy5pc1N1cHBvcnRlZENvZGUoY29kZSk7XG4gIH1cbiAgLy8gZW5kIHRlbXBvcmFsIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IFdISVRFTElTVCBSRU1PVkFMXG5cbiAgaXNTdXBwb3J0ZWRDb2RlKGNvZGUpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmxvYWQgPT09ICdsYW5ndWFnZU9ubHknIHx8IHRoaXMub3B0aW9ucy5ub25FeHBsaWNpdFN1cHBvcnRlZExuZ3MpIHtcbiAgICAgIGNvZGUgPSB0aGlzLmdldExhbmd1YWdlUGFydEZyb21Db2RlKGNvZGUpO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgIXRoaXMuc3VwcG9ydGVkTG5ncyB8fCAhdGhpcy5zdXBwb3J0ZWRMbmdzLmxlbmd0aCB8fCB0aGlzLnN1cHBvcnRlZExuZ3MuaW5kZXhPZihjb2RlKSA+IC0xXG4gICAgKTtcbiAgfVxuXG4gIGdldEJlc3RNYXRjaEZyb21Db2Rlcyhjb2Rlcykge1xuICAgIGlmICghY29kZXMpIHJldHVybiBudWxsO1xuXG4gICAgbGV0IGZvdW5kO1xuXG4gICAgLy8gcGljayBmaXJzdCBzdXBwb3J0ZWQgY29kZSBvciBpZiBubyByZXN0cmljdGlvbiBwaWNrIHRoZSBmaXJzdCBvbmUgKGhpZ2hlc3QgcHJpbylcbiAgICBjb2Rlcy5mb3JFYWNoKGNvZGUgPT4ge1xuICAgICAgaWYgKGZvdW5kKSByZXR1cm47XG4gICAgICBsZXQgY2xlYW5lZExuZyA9IHRoaXMuZm9ybWF0TGFuZ3VhZ2VDb2RlKGNvZGUpO1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3VwcG9ydGVkTG5ncyB8fCB0aGlzLmlzU3VwcG9ydGVkQ29kZShjbGVhbmVkTG5nKSkgZm91bmQgPSBjbGVhbmVkTG5nO1xuICAgIH0pO1xuXG4gICAgLy8gaWYgd2UgZ290IG5vIG1hdGNoIGluIHN1cHBvcnRlZExuZ3MgeWV0IC0gY2hlY2sgZm9yIHNpbWlsYXIgbG9jYWxlc1xuICAgIC8vIGZpcnN0ICBkZS1DSCAtLT4gZGVcbiAgICAvLyBzZWNvbmQgZGUtQ0ggLS0+IGRlLURFXG4gICAgaWYgKCFmb3VuZCAmJiB0aGlzLm9wdGlvbnMuc3VwcG9ydGVkTG5ncykge1xuICAgICAgY29kZXMuZm9yRWFjaChjb2RlID0+IHtcbiAgICAgICAgaWYgKGZvdW5kKSByZXR1cm47XG5cbiAgICAgICAgbGV0IGxuZ09ubHkgPSB0aGlzLmdldExhbmd1YWdlUGFydEZyb21Db2RlKGNvZGUpO1xuICAgICAgICBpZiAodGhpcy5pc1N1cHBvcnRlZENvZGUobG5nT25seSkpIHJldHVybiAoZm91bmQgPSBsbmdPbmx5KTtcblxuICAgICAgICBmb3VuZCA9IHRoaXMub3B0aW9ucy5zdXBwb3J0ZWRMbmdzLmZpbmQoc3VwcG9ydGVkTG5nID0+IHtcbiAgICAgICAgICBpZiAoc3VwcG9ydGVkTG5nLmluZGV4T2YobG5nT25seSkgPT09IDApIHJldHVybiBzdXBwb3J0ZWRMbmc7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gaWYgbm90aGluZyBmb3VuZCwgdXNlIGZhbGxiYWNrTG5nXG4gICAgaWYgKCFmb3VuZCkgZm91bmQgPSB0aGlzLmdldEZhbGxiYWNrQ29kZXModGhpcy5vcHRpb25zLmZhbGxiYWNrTG5nKVswXTtcblxuICAgIHJldHVybiBmb3VuZDtcbiAgfVxuXG4gIGdldEZhbGxiYWNrQ29kZXMoZmFsbGJhY2tzLCBjb2RlKSB7XG4gICAgaWYgKCFmYWxsYmFja3MpIHJldHVybiBbXTtcbiAgICBpZiAodHlwZW9mIGZhbGxiYWNrcyA9PT0gJ2Z1bmN0aW9uJykgZmFsbGJhY2tzID0gZmFsbGJhY2tzKGNvZGUpO1xuICAgIGlmICh0eXBlb2YgZmFsbGJhY2tzID09PSAnc3RyaW5nJykgZmFsbGJhY2tzID0gW2ZhbGxiYWNrc107XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuYXBwbHkoZmFsbGJhY2tzKSA9PT0gJ1tvYmplY3QgQXJyYXldJykgcmV0dXJuIGZhbGxiYWNrcztcblxuICAgIGlmICghY29kZSkgcmV0dXJuIGZhbGxiYWNrcy5kZWZhdWx0IHx8IFtdO1xuXG4gICAgLy8gYXN1bWUgd2UgaGF2ZSBhbiBvYmplY3QgZGVmaW5pbmcgZmFsbGJhY2tzXG4gICAgbGV0IGZvdW5kID0gZmFsbGJhY2tzW2NvZGVdO1xuICAgIGlmICghZm91bmQpIGZvdW5kID0gZmFsbGJhY2tzW3RoaXMuZ2V0U2NyaXB0UGFydEZyb21Db2RlKGNvZGUpXTtcbiAgICBpZiAoIWZvdW5kKSBmb3VuZCA9IGZhbGxiYWNrc1t0aGlzLmZvcm1hdExhbmd1YWdlQ29kZShjb2RlKV07XG4gICAgaWYgKCFmb3VuZCkgZm91bmQgPSBmYWxsYmFja3NbdGhpcy5nZXRMYW5ndWFnZVBhcnRGcm9tQ29kZShjb2RlKV07XG4gICAgaWYgKCFmb3VuZCkgZm91bmQgPSBmYWxsYmFja3MuZGVmYXVsdDtcblxuICAgIHJldHVybiBmb3VuZCB8fCBbXTtcbiAgfVxuXG4gIHRvUmVzb2x2ZUhpZXJhcmNoeShjb2RlLCBmYWxsYmFja0NvZGUpIHtcbiAgICBjb25zdCBmYWxsYmFja0NvZGVzID0gdGhpcy5nZXRGYWxsYmFja0NvZGVzKFxuICAgICAgZmFsbGJhY2tDb2RlIHx8IHRoaXMub3B0aW9ucy5mYWxsYmFja0xuZyB8fCBbXSxcbiAgICAgIGNvZGUsXG4gICAgKTtcblxuICAgIGNvbnN0IGNvZGVzID0gW107XG4gICAgY29uc3QgYWRkQ29kZSA9IGMgPT4ge1xuICAgICAgaWYgKCFjKSByZXR1cm47XG4gICAgICBpZiAodGhpcy5pc1N1cHBvcnRlZENvZGUoYykpIHtcbiAgICAgICAgY29kZXMucHVzaChjKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLndhcm4oYHJlamVjdGluZyBsYW5ndWFnZSBjb2RlIG5vdCBmb3VuZCBpbiBzdXBwb3J0ZWRMbmdzOiAke2N9YCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICh0eXBlb2YgY29kZSA9PT0gJ3N0cmluZycgJiYgY29kZS5pbmRleE9mKCctJykgPiAtMSkge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5sb2FkICE9PSAnbGFuZ3VhZ2VPbmx5JykgYWRkQ29kZSh0aGlzLmZvcm1hdExhbmd1YWdlQ29kZShjb2RlKSk7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmxvYWQgIT09ICdsYW5ndWFnZU9ubHknICYmIHRoaXMub3B0aW9ucy5sb2FkICE9PSAnY3VycmVudE9ubHknKVxuICAgICAgICBhZGRDb2RlKHRoaXMuZ2V0U2NyaXB0UGFydEZyb21Db2RlKGNvZGUpKTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMubG9hZCAhPT0gJ2N1cnJlbnRPbmx5JykgYWRkQ29kZSh0aGlzLmdldExhbmd1YWdlUGFydEZyb21Db2RlKGNvZGUpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgYWRkQ29kZSh0aGlzLmZvcm1hdExhbmd1YWdlQ29kZShjb2RlKSk7XG4gICAgfVxuXG4gICAgZmFsbGJhY2tDb2Rlcy5mb3JFYWNoKGZjID0+IHtcbiAgICAgIGlmIChjb2Rlcy5pbmRleE9mKGZjKSA8IDApIGFkZENvZGUodGhpcy5mb3JtYXRMYW5ndWFnZUNvZGUoZmMpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb2RlcztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMYW5ndWFnZVV0aWw7XG4iLCJpbXBvcnQgYmFzZUxvZ2dlciBmcm9tICcuL2xvZ2dlci5qcyc7XG5cbi8vIGRlZmluaXRpb24gaHR0cDovL3RyYW5zbGF0ZS5zb3VyY2Vmb3JnZS5uZXQvd2lraS9sMTBuL3BsdXJhbGZvcm1zXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xubGV0IHNldHMgPSBbXG4gIHsgbG5nczogWydhY2gnLCdhaycsJ2FtJywnYXJuJywnYnInLCdmaWwnLCdndW4nLCdsbicsJ21mZScsJ21nJywnbWknLCdvYycsICdwdCcsICdwdC1CUicsXG4gICAgJ3RnJywndGknLCd0cicsJ3V6Jywnd2EnXSwgbnI6IFsxLDJdLCBmYzogMSB9LFxuXG4gIHsgbG5nczogWydhZicsJ2FuJywnYXN0JywnYXonLCdiZycsJ2JuJywnY2EnLCdkYScsJ2RlJywnZGV2JywnZWwnLCdlbicsXG4gICAgJ2VvJywnZXMnLCdldCcsJ2V1JywnZmknLCdmbycsJ2Z1cicsJ2Z5JywnZ2wnLCdndScsJ2hhJywnaGknLFxuICAgICdodScsJ2h5JywnaWEnLCdpdCcsJ2tuJywna3UnLCdsYicsJ21haScsJ21sJywnbW4nLCdtcicsJ25haCcsJ25hcCcsJ25iJyxcbiAgICAnbmUnLCdubCcsJ25uJywnbm8nLCduc28nLCdwYScsJ3BhcCcsJ3BtcycsJ3BzJywncHQtUFQnLCdybScsJ3NjbycsXG4gICAgJ3NlJywnc2knLCdzbycsJ3NvbicsJ3NxJywnc3YnLCdzdycsJ3RhJywndGUnLCd0aycsJ3VyJywneW8nXSwgbnI6IFsxLDJdLCBmYzogMiB9LFxuXG4gIHsgbG5nczogWydheScsJ2JvJywnY2dnJywnZmEnLCdodCcsJ2lkJywnamEnLCdqYm8nLCdrYScsJ2trJywna20nLCdrbycsJ2t5JywnbG8nLFxuICAgICdtcycsJ3NhaCcsJ3N1JywndGgnLCd0dCcsJ3VnJywndmknLCd3bycsJ3poJ10sIG5yOiBbMV0sIGZjOiAzIH0sXG5cbiAgeyBsbmdzOiBbJ2JlJywnYnMnLCAnY25yJywgJ2R6JywnaHInLCdydScsJ3NyJywndWsnXSwgbnI6IFsxLDIsNV0sIGZjOiA0IH0sXG5cbiAgeyBsbmdzOiBbJ2FyJ10sIG5yOiBbMCwxLDIsMywxMSwxMDBdLCBmYzogNSB9LFxuICB7IGxuZ3M6IFsnY3MnLCdzayddLCBucjogWzEsMiw1XSwgZmM6IDYgfSxcbiAgeyBsbmdzOiBbJ2NzYicsJ3BsJ10sIG5yOiBbMSwyLDVdLCBmYzogNyB9LFxuICB7IGxuZ3M6IFsnY3knXSwgbnI6IFsxLDIsMyw4XSwgZmM6IDggfSxcbiAgeyBsbmdzOiBbJ2ZyJ10sIG5yOiBbMSwyXSwgZmM6IDkgfSxcbiAgeyBsbmdzOiBbJ2dhJ10sIG5yOiBbMSwyLDMsNywxMV0sIGZjOiAxMCB9LFxuICB7IGxuZ3M6IFsnZ2QnXSwgbnI6IFsxLDIsMywyMF0sIGZjOiAxMSB9LFxuICB7IGxuZ3M6IFsnaXMnXSwgbnI6IFsxLDJdLCBmYzogMTIgfSxcbiAgeyBsbmdzOiBbJ2p2J10sIG5yOiBbMCwxXSwgZmM6IDEzIH0sXG4gIHsgbG5nczogWydrdyddLCBucjogWzEsMiwzLDRdLCBmYzogMTQgfSxcbiAgeyBsbmdzOiBbJ2x0J10sIG5yOiBbMSwyLDEwXSwgZmM6IDE1IH0sXG4gIHsgbG5nczogWydsdiddLCBucjogWzEsMiwwXSwgZmM6IDE2IH0sXG4gIHsgbG5nczogWydtayddLCBucjogWzEsMl0sIGZjOiAxNyB9LFxuICB7IGxuZ3M6IFsnbW5rJ10sIG5yOiBbMCwxLDJdLCBmYzogMTggfSxcbiAgeyBsbmdzOiBbJ210J10sIG5yOiBbMSwyLDExLDIwXSwgZmM6IDE5IH0sXG4gIHsgbG5nczogWydvciddLCBucjogWzIsMV0sIGZjOiAyIH0sXG4gIHsgbG5nczogWydybyddLCBucjogWzEsMiwyMF0sIGZjOiAyMCB9LFxuICB7IGxuZ3M6IFsnc2wnXSwgbnI6IFs1LDEsMiwzXSwgZmM6IDIxIH0sXG4gIHsgbG5nczogWydoZScsJ2l3J10sIG5yOiBbMSwyLDIwLDIxXSwgZmM6IDIyIH1cbl1cblxubGV0IF9ydWxlc1BsdXJhbHNUeXBlcyA9IHtcbiAgMTogZnVuY3Rpb24obikge3JldHVybiBOdW1iZXIobiA+IDEpO30sXG4gIDI6IGZ1bmN0aW9uKG4pIHtyZXR1cm4gTnVtYmVyKG4gIT0gMSk7fSxcbiAgMzogZnVuY3Rpb24obikge3JldHVybiAwO30sXG4gIDQ6IGZ1bmN0aW9uKG4pIHtyZXR1cm4gTnVtYmVyKG4lMTA9PTEgJiYgbiUxMDAhPTExID8gMCA6IG4lMTA+PTIgJiYgbiUxMDw9NCAmJiAobiUxMDA8MTAgfHwgbiUxMDA+PTIwKSA/IDEgOiAyKTt9LFxuICA1OiBmdW5jdGlvbihuKSB7cmV0dXJuIE51bWJlcihuPT0wID8gMCA6IG49PTEgPyAxIDogbj09MiA/IDIgOiBuJTEwMD49MyAmJiBuJTEwMDw9MTAgPyAzIDogbiUxMDA+PTExID8gNCA6IDUpO30sXG4gIDY6IGZ1bmN0aW9uKG4pIHtyZXR1cm4gTnVtYmVyKChuPT0xKSA/IDAgOiAobj49MiAmJiBuPD00KSA/IDEgOiAyKTt9LFxuICA3OiBmdW5jdGlvbihuKSB7cmV0dXJuIE51bWJlcihuPT0xID8gMCA6IG4lMTA+PTIgJiYgbiUxMDw9NCAmJiAobiUxMDA8MTAgfHwgbiUxMDA+PTIwKSA/IDEgOiAyKTt9LFxuICA4OiBmdW5jdGlvbihuKSB7cmV0dXJuIE51bWJlcigobj09MSkgPyAwIDogKG49PTIpID8gMSA6IChuICE9IDggJiYgbiAhPSAxMSkgPyAyIDogMyk7fSxcbiAgOTogZnVuY3Rpb24obikge3JldHVybiBOdW1iZXIobiA+PSAyKTt9LFxuICAxMDogZnVuY3Rpb24obikge3JldHVybiBOdW1iZXIobj09MSA/IDAgOiBuPT0yID8gMSA6IG48NyA/IDIgOiBuPDExID8gMyA6IDQpIDt9LFxuICAxMTogZnVuY3Rpb24obikge3JldHVybiBOdW1iZXIoKG49PTEgfHwgbj09MTEpID8gMCA6IChuPT0yIHx8IG49PTEyKSA/IDEgOiAobiA+IDIgJiYgbiA8IDIwKSA/IDIgOiAzKTt9LFxuICAxMjogZnVuY3Rpb24obikge3JldHVybiBOdW1iZXIobiUxMCE9MSB8fCBuJTEwMD09MTEpO30sXG4gIDEzOiBmdW5jdGlvbihuKSB7cmV0dXJuIE51bWJlcihuICE9PSAwKTt9LFxuICAxNDogZnVuY3Rpb24obikge3JldHVybiBOdW1iZXIoKG49PTEpID8gMCA6IChuPT0yKSA/IDEgOiAobiA9PSAzKSA/IDIgOiAzKTt9LFxuICAxNTogZnVuY3Rpb24obikge3JldHVybiBOdW1iZXIobiUxMD09MSAmJiBuJTEwMCE9MTEgPyAwIDogbiUxMD49MiAmJiAobiUxMDA8MTAgfHwgbiUxMDA+PTIwKSA/IDEgOiAyKTt9LFxuICAxNjogZnVuY3Rpb24obikge3JldHVybiBOdW1iZXIobiUxMD09MSAmJiBuJTEwMCE9MTEgPyAwIDogbiAhPT0gMCA/IDEgOiAyKTt9LFxuICAxNzogZnVuY3Rpb24obikge3JldHVybiBOdW1iZXIobj09MSB8fCBuJTEwPT0xICYmIG4lMTAwIT0xMSA/IDAgOiAxKTt9LFxuICAxODogZnVuY3Rpb24obikge3JldHVybiBOdW1iZXIobj09MCA/IDAgOiBuPT0xID8gMSA6IDIpO30sXG4gIDE5OiBmdW5jdGlvbihuKSB7cmV0dXJuIE51bWJlcihuPT0xID8gMCA6IG49PTAgfHwgKCBuJTEwMD4xICYmIG4lMTAwPDExKSA/IDEgOiAobiUxMDA+MTAgJiYgbiUxMDA8MjAgKSA/IDIgOiAzKTt9LFxuICAyMDogZnVuY3Rpb24obikge3JldHVybiBOdW1iZXIobj09MSA/IDAgOiAobj09MCB8fCAobiUxMDAgPiAwICYmIG4lMTAwIDwgMjApKSA/IDEgOiAyKTt9LFxuICAyMTogZnVuY3Rpb24obikge3JldHVybiBOdW1iZXIobiUxMDA9PTEgPyAxIDogbiUxMDA9PTIgPyAyIDogbiUxMDA9PTMgfHwgbiUxMDA9PTQgPyAzIDogMCk7IH0sXG4gIDIyOiBmdW5jdGlvbihuKSB7cmV0dXJuIE51bWJlcihuPT0xID8gMCA6IG49PTIgPyAxIDogKG48MCB8fCBuPjEwKSAmJiBuJTEwPT0wID8gMiA6IDMpOyB9XG59O1xuLyogZXNsaW50LWVuYWJsZSAqL1xuXG5mdW5jdGlvbiBjcmVhdGVSdWxlcygpIHtcbiAgY29uc3QgcnVsZXMgPSB7fTtcbiAgc2V0cy5mb3JFYWNoKChzZXQpID0+IHtcbiAgICBzZXQubG5ncy5mb3JFYWNoKChsKSA9PiB7XG4gICAgICBydWxlc1tsXSA9IHtcbiAgICAgICAgbnVtYmVyczogc2V0Lm5yLFxuICAgICAgICBwbHVyYWxzOiBfcnVsZXNQbHVyYWxzVHlwZXNbc2V0LmZjXVxuICAgICAgfTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBydWxlcztcbn1cblxuY2xhc3MgUGx1cmFsUmVzb2x2ZXIge1xuICBjb25zdHJ1Y3RvcihsYW5ndWFnZVV0aWxzLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmxhbmd1YWdlVXRpbHMgPSBsYW5ndWFnZVV0aWxzO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICB0aGlzLmxvZ2dlciA9IGJhc2VMb2dnZXIuY3JlYXRlKCdwbHVyYWxSZXNvbHZlcicpO1xuXG4gICAgdGhpcy5ydWxlcyA9IGNyZWF0ZVJ1bGVzKCk7XG4gIH1cblxuICBhZGRSdWxlKGxuZywgb2JqKSB7XG4gICAgdGhpcy5ydWxlc1tsbmddID0gb2JqO1xuICB9XG5cbiAgZ2V0UnVsZShjb2RlKSB7XG4gICAgcmV0dXJuIHRoaXMucnVsZXNbY29kZV0gfHwgdGhpcy5ydWxlc1t0aGlzLmxhbmd1YWdlVXRpbHMuZ2V0TGFuZ3VhZ2VQYXJ0RnJvbUNvZGUoY29kZSldO1xuICB9XG5cbiAgbmVlZHNQbHVyYWwoY29kZSkge1xuICAgIGNvbnN0IHJ1bGUgPSB0aGlzLmdldFJ1bGUoY29kZSk7XG5cbiAgICByZXR1cm4gcnVsZSAmJiBydWxlLm51bWJlcnMubGVuZ3RoID4gMTtcbiAgfVxuXG4gIGdldFBsdXJhbEZvcm1zT2ZLZXkoY29kZSwga2V5KSB7XG4gICAgY29uc3QgcmV0ID0gW107XG5cbiAgICBjb25zdCBydWxlID0gdGhpcy5nZXRSdWxlKGNvZGUpO1xuXG4gICAgaWYgKCFydWxlKSByZXR1cm4gcmV0O1xuXG4gICAgcnVsZS5udW1iZXJzLmZvckVhY2goKG4pID0+IHtcbiAgICAgIGNvbnN0IHN1ZmZpeCA9IHRoaXMuZ2V0U3VmZml4KGNvZGUsIG4pO1xuICAgICAgcmV0LnB1c2goYCR7a2V5fSR7c3VmZml4fWApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGdldFN1ZmZpeChjb2RlLCBjb3VudCkge1xuICAgIGNvbnN0IHJ1bGUgPSB0aGlzLmdldFJ1bGUoY29kZSk7XG5cbiAgICBpZiAocnVsZSkge1xuICAgICAgLy8gaWYgKHJ1bGUubnVtYmVycy5sZW5ndGggPT09IDEpIHJldHVybiAnJzsgLy8gb25seSBzaW5ndWxhclxuXG4gICAgICBjb25zdCBpZHggPSBydWxlLm5vQWJzID8gcnVsZS5wbHVyYWxzKGNvdW50KSA6IHJ1bGUucGx1cmFscyhNYXRoLmFicyhjb3VudCkpO1xuICAgICAgbGV0IHN1ZmZpeCA9IHJ1bGUubnVtYmVyc1tpZHhdO1xuXG4gICAgICAvLyBzcGVjaWFsIHRyZWF0bWVudCBmb3IgbG5ncyBvbmx5IGhhdmluZyBzaW5ndWxhciBhbmQgcGx1cmFsXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnNpbXBsaWZ5UGx1cmFsU3VmZml4ICYmIHJ1bGUubnVtYmVycy5sZW5ndGggPT09IDIgJiYgcnVsZS5udW1iZXJzWzBdID09PSAxKSB7XG4gICAgICAgIGlmIChzdWZmaXggPT09IDIpIHtcbiAgICAgICAgICBzdWZmaXggPSAncGx1cmFsJztcbiAgICAgICAgfSBlbHNlIGlmIChzdWZmaXggPT09IDEpIHtcbiAgICAgICAgICBzdWZmaXggPSAnJztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCByZXR1cm5TdWZmaXggPSAoKSA9PiAoXG4gICAgICAgIHRoaXMub3B0aW9ucy5wcmVwZW5kICYmIHN1ZmZpeC50b1N0cmluZygpID8gdGhpcy5vcHRpb25zLnByZXBlbmQgKyBzdWZmaXgudG9TdHJpbmcoKSA6IHN1ZmZpeC50b1N0cmluZygpXG4gICAgICApO1xuXG4gICAgICAvLyBDT01QQVRJQklMSVRZIEpTT05cbiAgICAgIC8vIHYxXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmNvbXBhdGliaWxpdHlKU09OID09PSAndjEnKSB7XG4gICAgICAgIGlmIChzdWZmaXggPT09IDEpIHJldHVybiAnJztcbiAgICAgICAgaWYgKHR5cGVvZiBzdWZmaXggPT09ICdudW1iZXInKSByZXR1cm4gYF9wbHVyYWxfJHtzdWZmaXgudG9TdHJpbmcoKX1gO1xuICAgICAgICByZXR1cm4gcmV0dXJuU3VmZml4KCk7XG4gICAgICB9IGVsc2UgaWYgKC8qIHYyICovIHRoaXMub3B0aW9ucy5jb21wYXRpYmlsaXR5SlNPTiA9PT0gJ3YyJykge1xuICAgICAgICByZXR1cm4gcmV0dXJuU3VmZml4KCk7XG4gICAgICB9IGVsc2UgaWYgKC8qIHYzIC0gZ2V0dGV4dCBpbmRleCAqLyB0aGlzLm9wdGlvbnMuc2ltcGxpZnlQbHVyYWxTdWZmaXggJiYgcnVsZS5udW1iZXJzLmxlbmd0aCA9PT0gMiAmJiBydWxlLm51bWJlcnNbMF0gPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHJldHVyblN1ZmZpeCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5wcmVwZW5kICYmIGlkeC50b1N0cmluZygpID8gdGhpcy5vcHRpb25zLnByZXBlbmQgKyBpZHgudG9TdHJpbmcoKSA6IGlkeC50b1N0cmluZygpO1xuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLndhcm4oYG5vIHBsdXJhbCBydWxlIGZvdW5kIGZvcjogJHtjb2RlfWApO1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbHVyYWxSZXNvbHZlcjtcbiIsImltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IGJhc2VMb2dnZXIgZnJvbSAnLi9sb2dnZXIuanMnO1xuXG5jbGFzcyBJbnRlcnBvbGF0b3Ige1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmxvZ2dlciA9IGJhc2VMb2dnZXIuY3JlYXRlKCdpbnRlcnBvbGF0b3InKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5mb3JtYXQgPSAob3B0aW9ucy5pbnRlcnBvbGF0aW9uICYmIG9wdGlvbnMuaW50ZXJwb2xhdGlvbi5mb3JtYXQpIHx8ICh2YWx1ZSA9PiB2YWx1ZSk7XG4gICAgdGhpcy5pbml0KG9wdGlvbnMpO1xuICB9XG5cbiAgLyogZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOiAwICovXG4gIGluaXQob3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKCFvcHRpb25zLmludGVycG9sYXRpb24pIG9wdGlvbnMuaW50ZXJwb2xhdGlvbiA9IHsgZXNjYXBlVmFsdWU6IHRydWUgfTtcblxuICAgIGNvbnN0IGlPcHRzID0gb3B0aW9ucy5pbnRlcnBvbGF0aW9uO1xuXG4gICAgdGhpcy5lc2NhcGUgPSBpT3B0cy5lc2NhcGUgIT09IHVuZGVmaW5lZCA/IGlPcHRzLmVzY2FwZSA6IHV0aWxzLmVzY2FwZTtcbiAgICB0aGlzLmVzY2FwZVZhbHVlID0gaU9wdHMuZXNjYXBlVmFsdWUgIT09IHVuZGVmaW5lZCA/IGlPcHRzLmVzY2FwZVZhbHVlIDogdHJ1ZTtcbiAgICB0aGlzLnVzZVJhd1ZhbHVlVG9Fc2NhcGUgPVxuICAgICAgaU9wdHMudXNlUmF3VmFsdWVUb0VzY2FwZSAhPT0gdW5kZWZpbmVkID8gaU9wdHMudXNlUmF3VmFsdWVUb0VzY2FwZSA6IGZhbHNlO1xuXG4gICAgdGhpcy5wcmVmaXggPSBpT3B0cy5wcmVmaXggPyB1dGlscy5yZWdleEVzY2FwZShpT3B0cy5wcmVmaXgpIDogaU9wdHMucHJlZml4RXNjYXBlZCB8fCAne3snO1xuICAgIHRoaXMuc3VmZml4ID0gaU9wdHMuc3VmZml4ID8gdXRpbHMucmVnZXhFc2NhcGUoaU9wdHMuc3VmZml4KSA6IGlPcHRzLnN1ZmZpeEVzY2FwZWQgfHwgJ319JztcblxuICAgIHRoaXMuZm9ybWF0U2VwYXJhdG9yID0gaU9wdHMuZm9ybWF0U2VwYXJhdG9yXG4gICAgICA/IGlPcHRzLmZvcm1hdFNlcGFyYXRvclxuICAgICAgOiBpT3B0cy5mb3JtYXRTZXBhcmF0b3IgfHwgJywnO1xuXG4gICAgdGhpcy51bmVzY2FwZVByZWZpeCA9IGlPcHRzLnVuZXNjYXBlU3VmZml4ID8gJycgOiBpT3B0cy51bmVzY2FwZVByZWZpeCB8fCAnLSc7XG4gICAgdGhpcy51bmVzY2FwZVN1ZmZpeCA9IHRoaXMudW5lc2NhcGVQcmVmaXggPyAnJyA6IGlPcHRzLnVuZXNjYXBlU3VmZml4IHx8ICcnO1xuXG4gICAgdGhpcy5uZXN0aW5nUHJlZml4ID0gaU9wdHMubmVzdGluZ1ByZWZpeFxuICAgICAgPyB1dGlscy5yZWdleEVzY2FwZShpT3B0cy5uZXN0aW5nUHJlZml4KVxuICAgICAgOiBpT3B0cy5uZXN0aW5nUHJlZml4RXNjYXBlZCB8fCB1dGlscy5yZWdleEVzY2FwZSgnJHQoJyk7XG4gICAgdGhpcy5uZXN0aW5nU3VmZml4ID0gaU9wdHMubmVzdGluZ1N1ZmZpeFxuICAgICAgPyB1dGlscy5yZWdleEVzY2FwZShpT3B0cy5uZXN0aW5nU3VmZml4KVxuICAgICAgOiBpT3B0cy5uZXN0aW5nU3VmZml4RXNjYXBlZCB8fCB1dGlscy5yZWdleEVzY2FwZSgnKScpO1xuXG4gICAgdGhpcy5uZXN0aW5nT3B0aW9uc1NlcGFyYXRvciA9IGlPcHRzLm5lc3RpbmdPcHRpb25zU2VwYXJhdG9yXG4gICAgICA/IGlPcHRzLm5lc3RpbmdPcHRpb25zU2VwYXJhdG9yXG4gICAgICA6IGlPcHRzLm5lc3RpbmdPcHRpb25zU2VwYXJhdG9yIHx8ICcsJztcblxuICAgIHRoaXMubWF4UmVwbGFjZXMgPSBpT3B0cy5tYXhSZXBsYWNlcyA/IGlPcHRzLm1heFJlcGxhY2VzIDogMTAwMDtcblxuICAgIHRoaXMuYWx3YXlzRm9ybWF0ID0gaU9wdHMuYWx3YXlzRm9ybWF0ICE9PSB1bmRlZmluZWQgPyBpT3B0cy5hbHdheXNGb3JtYXQgOiBmYWxzZTtcblxuICAgIC8vIHRoZSByZWdleHBcbiAgICB0aGlzLnJlc2V0UmVnRXhwKCk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zKSB0aGlzLmluaXQodGhpcy5vcHRpb25zKTtcbiAgfVxuXG4gIHJlc2V0UmVnRXhwKCkge1xuICAgIC8vIHRoZSByZWdleHBcbiAgICBjb25zdCByZWdleHBTdHIgPSBgJHt0aGlzLnByZWZpeH0oLis/KSR7dGhpcy5zdWZmaXh9YDtcbiAgICB0aGlzLnJlZ2V4cCA9IG5ldyBSZWdFeHAocmVnZXhwU3RyLCAnZycpO1xuXG4gICAgY29uc3QgcmVnZXhwVW5lc2NhcGVTdHIgPSBgJHt0aGlzLnByZWZpeH0ke3RoaXMudW5lc2NhcGVQcmVmaXh9KC4rPykke3RoaXMudW5lc2NhcGVTdWZmaXh9JHtcbiAgICAgIHRoaXMuc3VmZml4XG4gICAgfWA7XG4gICAgdGhpcy5yZWdleHBVbmVzY2FwZSA9IG5ldyBSZWdFeHAocmVnZXhwVW5lc2NhcGVTdHIsICdnJyk7XG5cbiAgICBjb25zdCBuZXN0aW5nUmVnZXhwU3RyID0gYCR7dGhpcy5uZXN0aW5nUHJlZml4fSguKz8pJHt0aGlzLm5lc3RpbmdTdWZmaXh9YDtcbiAgICB0aGlzLm5lc3RpbmdSZWdleHAgPSBuZXcgUmVnRXhwKG5lc3RpbmdSZWdleHBTdHIsICdnJyk7XG4gIH1cblxuICBpbnRlcnBvbGF0ZShzdHIsIGRhdGEsIGxuZywgb3B0aW9ucykge1xuICAgIGxldCBtYXRjaDtcbiAgICBsZXQgdmFsdWU7XG4gICAgbGV0IHJlcGxhY2VzO1xuXG4gICAgY29uc3QgZGVmYXVsdERhdGEgPVxuICAgICAgKHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuaW50ZXJwb2xhdGlvbiAmJiB0aGlzLm9wdGlvbnMuaW50ZXJwb2xhdGlvbi5kZWZhdWx0VmFyaWFibGVzKSB8fFxuICAgICAge307XG5cbiAgICBmdW5jdGlvbiByZWdleFNhZmUodmFsKSB7XG4gICAgICByZXR1cm4gdmFsLnJlcGxhY2UoL1xcJC9nLCAnJCQkJCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGhhbmRsZUZvcm1hdCA9IGtleSA9PiB7XG4gICAgICBpZiAoa2V5LmluZGV4T2YodGhpcy5mb3JtYXRTZXBhcmF0b3IpIDwgMCkge1xuICAgICAgICBjb25zdCBwYXRoID0gdXRpbHMuZ2V0UGF0aFdpdGhEZWZhdWx0cyhkYXRhLCBkZWZhdWx0RGF0YSwga2V5KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWx3YXlzRm9ybWF0ID8gdGhpcy5mb3JtYXQocGF0aCwgdW5kZWZpbmVkLCBsbmcpIDogcGF0aDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcCA9IGtleS5zcGxpdCh0aGlzLmZvcm1hdFNlcGFyYXRvcik7XG4gICAgICBjb25zdCBrID0gcC5zaGlmdCgpLnRyaW0oKTtcbiAgICAgIGNvbnN0IGYgPSBwLmpvaW4odGhpcy5mb3JtYXRTZXBhcmF0b3IpLnRyaW0oKTtcblxuICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0KHV0aWxzLmdldFBhdGhXaXRoRGVmYXVsdHMoZGF0YSwgZGVmYXVsdERhdGEsIGspLCBmLCBsbmcsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICB0aGlzLnJlc2V0UmVnRXhwKCk7XG5cbiAgICBjb25zdCBtaXNzaW5nSW50ZXJwb2xhdGlvbkhhbmRsZXIgPVxuICAgICAgKG9wdGlvbnMgJiYgb3B0aW9ucy5taXNzaW5nSW50ZXJwb2xhdGlvbkhhbmRsZXIpIHx8IHRoaXMub3B0aW9ucy5taXNzaW5nSW50ZXJwb2xhdGlvbkhhbmRsZXI7XG5cbiAgICBjb25zdCBza2lwT25WYXJpYWJsZXMgPVxuICAgICAgKG9wdGlvbnMgJiYgb3B0aW9ucy5pbnRlcnBvbGF0aW9uICYmIG9wdGlvbnMuaW50ZXJwb2xhdGlvbi5za2lwT25WYXJpYWJsZXMpIHx8XG4gICAgICB0aGlzLm9wdGlvbnMuaW50ZXJwb2xhdGlvbi5za2lwT25WYXJpYWJsZXM7XG5cbiAgICBjb25zdCB0b2RvcyA9IFtcbiAgICAgIHtcbiAgICAgICAgLy8gdW5lc2NhcGUgaWYgaGFzIHVuZXNjYXBlUHJlZml4L1N1ZmZpeFxuICAgICAgICByZWdleDogdGhpcy5yZWdleHBVbmVzY2FwZSxcbiAgICAgICAgc2FmZVZhbHVlOiB2YWwgPT4gcmVnZXhTYWZlKHZhbCksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICAvLyByZWd1bGFyIGVzY2FwZSBvbiBkZW1hbmRcbiAgICAgICAgcmVnZXg6IHRoaXMucmVnZXhwLFxuICAgICAgICBzYWZlVmFsdWU6IHZhbCA9PiAodGhpcy5lc2NhcGVWYWx1ZSA/IHJlZ2V4U2FmZSh0aGlzLmVzY2FwZSh2YWwpKSA6IHJlZ2V4U2FmZSh2YWwpKSxcbiAgICAgIH0sXG4gICAgXTtcbiAgICB0b2Rvcy5mb3JFYWNoKHRvZG8gPT4ge1xuICAgICAgcmVwbGFjZXMgPSAwO1xuICAgICAgLyogZXNsaW50IG5vLWNvbmQtYXNzaWduOiAwICovXG4gICAgICB3aGlsZSAoKG1hdGNoID0gdG9kby5yZWdleC5leGVjKHN0cikpKSB7XG4gICAgICAgIHZhbHVlID0gaGFuZGxlRm9ybWF0KG1hdGNoWzFdLnRyaW0oKSk7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBtaXNzaW5nSW50ZXJwb2xhdGlvbkhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXAgPSBtaXNzaW5nSW50ZXJwb2xhdGlvbkhhbmRsZXIoc3RyLCBtYXRjaCwgb3B0aW9ucyk7XG4gICAgICAgICAgICB2YWx1ZSA9IHR5cGVvZiB0ZW1wID09PSAnc3RyaW5nJyA/IHRlbXAgOiAnJztcbiAgICAgICAgICB9IGVsc2UgaWYgKHNraXBPblZhcmlhYmxlcykge1xuICAgICAgICAgICAgdmFsdWUgPSBtYXRjaFswXTtcbiAgICAgICAgICAgIGNvbnRpbnVlOyAvLyB0aGlzIG1ha2VzIHN1cmUgaXQgY29udGludWVzIHRvIGRldGVjdCBvdGhlcnNcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIud2FybihgbWlzc2VkIHRvIHBhc3MgaW4gdmFyaWFibGUgJHttYXRjaFsxXX0gZm9yIGludGVycG9sYXRpbmcgJHtzdHJ9YCk7XG4gICAgICAgICAgICB2YWx1ZSA9ICcnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnICYmICF0aGlzLnVzZVJhd1ZhbHVlVG9Fc2NhcGUpIHtcbiAgICAgICAgICB2YWx1ZSA9IHV0aWxzLm1ha2VTdHJpbmcodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKG1hdGNoWzBdLCB0b2RvLnNhZmVWYWx1ZSh2YWx1ZSkpO1xuICAgICAgICB0b2RvLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgIHJlcGxhY2VzKys7XG4gICAgICAgIGlmIChyZXBsYWNlcyA+PSB0aGlzLm1heFJlcGxhY2VzKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc3RyO1xuICB9XG5cbiAgbmVzdChzdHIsIGZjLCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQgbWF0Y2g7XG4gICAgbGV0IHZhbHVlO1xuXG4gICAgbGV0IGNsb25lZE9wdGlvbnMgPSB7IC4uLm9wdGlvbnMgfTtcbiAgICBjbG9uZWRPcHRpb25zLmFwcGx5UG9zdFByb2Nlc3NvciA9IGZhbHNlOyAvLyBhdm9pZCBwb3N0IHByb2Nlc3Npbmcgb24gbmVzdGVkIGxvb2t1cFxuICAgIGRlbGV0ZSBjbG9uZWRPcHRpb25zLmRlZmF1bHRWYWx1ZTsgLy8gYXNzZXJ0IHdlIGRvIG5vdCBnZXQgYSBlbmRsZXNzIGxvb3Agb24gaW50ZXJwb2xhdGluZyBkZWZhdWx0VmFsdWUgYWdhaW4gYW5kIGFnYWluXG5cbiAgICAvLyBpZiB2YWx1ZSBpcyBzb21ldGhpbmcgbGlrZSBcIm15S2V5XCI6IFwibG9yZW0gJChhbm90aGVyS2V5LCB7IFwiY291bnRcIjoge3thVmFsdWVJbk9wdGlvbnN9fSB9KVwiXG4gICAgZnVuY3Rpb24gaGFuZGxlSGFzT3B0aW9ucyhrZXksIGluaGVyaXRlZE9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IHNlcCA9IHRoaXMubmVzdGluZ09wdGlvbnNTZXBhcmF0b3I7XG4gICAgICBpZiAoa2V5LmluZGV4T2Yoc2VwKSA8IDApIHJldHVybiBrZXk7XG5cbiAgICAgIGNvbnN0IGMgPSBrZXkuc3BsaXQobmV3IFJlZ0V4cChgJHtzZXB9WyBdKntgKSk7XG5cbiAgICAgIGxldCBvcHRpb25zU3RyaW5nID0gYHske2NbMV19YDtcbiAgICAgIGtleSA9IGNbMF07XG4gICAgICBvcHRpb25zU3RyaW5nID0gdGhpcy5pbnRlcnBvbGF0ZShvcHRpb25zU3RyaW5nLCBjbG9uZWRPcHRpb25zKTtcbiAgICAgIG9wdGlvbnNTdHJpbmcgPSBvcHRpb25zU3RyaW5nLnJlcGxhY2UoLycvZywgJ1wiJyk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGNsb25lZE9wdGlvbnMgPSBKU09OLnBhcnNlKG9wdGlvbnNTdHJpbmcpO1xuXG4gICAgICAgIGlmIChpbmhlcml0ZWRPcHRpb25zKSBjbG9uZWRPcHRpb25zID0geyAuLi5pbmhlcml0ZWRPcHRpb25zLCAuLi5jbG9uZWRPcHRpb25zIH07XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLndhcm4oYGZhaWxlZCBwYXJzaW5nIG9wdGlvbnMgc3RyaW5nIGluIG5lc3RpbmcgZm9yIGtleSAke2tleX1gLCBlKTtcbiAgICAgICAgcmV0dXJuIGAke2tleX0ke3NlcH0ke29wdGlvbnNTdHJpbmd9YDtcbiAgICAgIH1cblxuICAgICAgLy8gYXNzZXJ0IHdlIGRvIG5vdCBnZXQgYSBlbmRsZXNzIGxvb3Agb24gaW50ZXJwb2xhdGluZyBkZWZhdWx0VmFsdWUgYWdhaW4gYW5kIGFnYWluXG4gICAgICBkZWxldGUgY2xvbmVkT3B0aW9ucy5kZWZhdWx0VmFsdWU7XG4gICAgICByZXR1cm4ga2V5O1xuICAgIH1cblxuICAgIC8vIHJlZ3VsYXIgZXNjYXBlIG9uIGRlbWFuZFxuICAgIHdoaWxlICgobWF0Y2ggPSB0aGlzLm5lc3RpbmdSZWdleHAuZXhlYyhzdHIpKSkge1xuICAgICAgbGV0IGZvcm1hdHRlcnMgPSBbXTtcblxuICAgICAgLyoqXG4gICAgICAgKiBJZiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIHBhcmFtZXRlciAoY29udGFpbnMgdGhlIGZvcm1hdCBzZXBhcmF0b3IpLiBFLmcuOlxuICAgICAgICogICAtIHQoYSwgYilcbiAgICAgICAqICAgLSB0KGEsIGIsIGMpXG4gICAgICAgKlxuICAgICAgICogQW5kIHRob3NlIHBhcmFtZXRlcnMgYXJlIG5vdCBkeW5hbWljIHZhbHVlcyAocGFyYW1ldGVycyBkbyBub3QgaW5jbHVkZSBjdXJseSBicmFjZXMpLiBFLmcuOlxuICAgICAgICogICAtIE5vdCB0KGEsIHsgXCJrZXlcIjogXCJ7e3ZhcmlhYmxlfX1cIiB9KVxuICAgICAgICogICAtIE5vdCB0KGEsIGIsIHtcImtleUFcIjogXCJ2YWx1ZUFcIiwgXCJrZXlCXCI6IFwidmFsdWVCXCJ9KVxuICAgICAgICovXG4gICAgICBsZXQgZG9SZWR1Y2UgPSBmYWxzZTtcbiAgICAgIGlmIChtYXRjaFswXS5pbmNsdWRlcyh0aGlzLmZvcm1hdFNlcGFyYXRvcikgJiYgIS97Lip9Ly50ZXN0KG1hdGNoWzFdKSkge1xuICAgICAgICBjb25zdCByID0gbWF0Y2hbMV0uc3BsaXQodGhpcy5mb3JtYXRTZXBhcmF0b3IpLm1hcChlbGVtID0+IGVsZW0udHJpbSgpKTtcbiAgICAgICAgbWF0Y2hbMV0gPSByLnNoaWZ0KCk7XG4gICAgICAgIGZvcm1hdHRlcnMgPSByO1xuICAgICAgICBkb1JlZHVjZSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHZhbHVlID0gZmMoaGFuZGxlSGFzT3B0aW9ucy5jYWxsKHRoaXMsIG1hdGNoWzFdLnRyaW0oKSwgY2xvbmVkT3B0aW9ucyksIGNsb25lZE9wdGlvbnMpO1xuXG4gICAgICAvLyBpcyBvbmx5IHRoZSBuZXN0aW5nIGtleSAoa2V5MSA9ICckKGtleTIpJykgcmV0dXJuIHRoZSB2YWx1ZSB3aXRob3V0IHN0cmluZ2lmeVxuICAgICAgaWYgKHZhbHVlICYmIG1hdGNoWzBdID09PSBzdHIgJiYgdHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIHZhbHVlO1xuXG4gICAgICAvLyBubyBzdHJpbmcgdG8gaW5jbHVkZSBvciBlbXB0eVxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHZhbHVlID0gdXRpbHMubWFrZVN0cmluZyh2YWx1ZSk7XG4gICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLndhcm4oYG1pc3NlZCB0byByZXNvbHZlICR7bWF0Y2hbMV19IGZvciBuZXN0aW5nICR7c3RyfWApO1xuICAgICAgICB2YWx1ZSA9ICcnO1xuICAgICAgfVxuXG4gICAgICBpZiAoZG9SZWR1Y2UpIHtcbiAgICAgICAgdmFsdWUgPSBmb3JtYXR0ZXJzLnJlZHVjZSgodiwgZikgPT4gdGhpcy5mb3JtYXQodiwgZiwgb3B0aW9ucy5sbmcsIG9wdGlvbnMpLCB2YWx1ZS50cmltKCkpO1xuICAgICAgfVxuXG4gICAgICAvLyBOZXN0ZWQga2V5cyBzaG91bGQgbm90IGJlIGVzY2FwZWQgYnkgZGVmYXVsdCAjODU0XG4gICAgICAvLyB2YWx1ZSA9IHRoaXMuZXNjYXBlVmFsdWUgPyByZWdleFNhZmUodXRpbHMuZXNjYXBlKHZhbHVlKSkgOiByZWdleFNhZmUodmFsdWUpO1xuICAgICAgc3RyID0gc3RyLnJlcGxhY2UobWF0Y2hbMF0sIHZhbHVlKTtcbiAgICAgIHRoaXMucmVnZXhwLmxhc3RJbmRleCA9IDA7XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSW50ZXJwb2xhdG9yO1xuIiwiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgYmFzZUxvZ2dlciBmcm9tICcuL2xvZ2dlci5qcyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vRXZlbnRFbWl0dGVyLmpzJztcblxuZnVuY3Rpb24gcmVtb3ZlKGFyciwgd2hhdCkge1xuICBsZXQgZm91bmQgPSBhcnIuaW5kZXhPZih3aGF0KTtcblxuICB3aGlsZSAoZm91bmQgIT09IC0xKSB7XG4gICAgYXJyLnNwbGljZShmb3VuZCwgMSk7XG4gICAgZm91bmQgPSBhcnIuaW5kZXhPZih3aGF0KTtcbiAgfVxufVxuXG5jbGFzcyBDb25uZWN0b3IgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvcihiYWNrZW5kLCBzdG9yZSwgc2VydmljZXMsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKHV0aWxzLmlzSUUxMCkge1xuICAgICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7IC8vIDw9SUUxMCBmaXggKHVuYWJsZSB0byBjYWxsIHBhcmVudCBjb25zdHJ1Y3RvcilcbiAgICB9XG5cbiAgICB0aGlzLmJhY2tlbmQgPSBiYWNrZW5kO1xuICAgIHRoaXMuc3RvcmUgPSBzdG9yZTtcbiAgICB0aGlzLnNlcnZpY2VzID0gc2VydmljZXM7XG4gICAgdGhpcy5sYW5ndWFnZVV0aWxzID0gc2VydmljZXMubGFuZ3VhZ2VVdGlscztcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMubG9nZ2VyID0gYmFzZUxvZ2dlci5jcmVhdGUoJ2JhY2tlbmRDb25uZWN0b3InKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICB0aGlzLnF1ZXVlID0gW107XG5cbiAgICBpZiAodGhpcy5iYWNrZW5kICYmIHRoaXMuYmFja2VuZC5pbml0KSB7XG4gICAgICB0aGlzLmJhY2tlbmQuaW5pdChzZXJ2aWNlcywgb3B0aW9ucy5iYWNrZW5kLCBvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICBxdWV1ZUxvYWQobGFuZ3VhZ2VzLCBuYW1lc3BhY2VzLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIC8vIGZpbmQgd2hhdCBuZWVkcyB0byBiZSBsb2FkZWRcbiAgICBjb25zdCB0b0xvYWQgPSBbXTtcbiAgICBjb25zdCBwZW5kaW5nID0gW107XG4gICAgY29uc3QgdG9Mb2FkTGFuZ3VhZ2VzID0gW107XG4gICAgY29uc3QgdG9Mb2FkTmFtZXNwYWNlcyA9IFtdO1xuXG4gICAgbGFuZ3VhZ2VzLmZvckVhY2gobG5nID0+IHtcbiAgICAgIGxldCBoYXNBbGxOYW1lc3BhY2VzID0gdHJ1ZTtcblxuICAgICAgbmFtZXNwYWNlcy5mb3JFYWNoKG5zID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGAke2xuZ318JHtuc31gO1xuXG4gICAgICAgIGlmICghb3B0aW9ucy5yZWxvYWQgJiYgdGhpcy5zdG9yZS5oYXNSZXNvdXJjZUJ1bmRsZShsbmcsIG5zKSkge1xuICAgICAgICAgIHRoaXMuc3RhdGVbbmFtZV0gPSAyOyAvLyBsb2FkZWRcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlW25hbWVdIDwgMCkge1xuICAgICAgICAgIC8vIG5vdGhpbmcgdG8gZG8gZm9yIGVyclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGVbbmFtZV0gPT09IDEpIHtcbiAgICAgICAgICBpZiAocGVuZGluZy5pbmRleE9mKG5hbWUpIDwgMCkgcGVuZGluZy5wdXNoKG5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc3RhdGVbbmFtZV0gPSAxOyAvLyBwZW5kaW5nXG5cbiAgICAgICAgICBoYXNBbGxOYW1lc3BhY2VzID0gZmFsc2U7XG5cbiAgICAgICAgICBpZiAocGVuZGluZy5pbmRleE9mKG5hbWUpIDwgMCkgcGVuZGluZy5wdXNoKG5hbWUpO1xuICAgICAgICAgIGlmICh0b0xvYWQuaW5kZXhPZihuYW1lKSA8IDApIHRvTG9hZC5wdXNoKG5hbWUpO1xuICAgICAgICAgIGlmICh0b0xvYWROYW1lc3BhY2VzLmluZGV4T2YobnMpIDwgMCkgdG9Mb2FkTmFtZXNwYWNlcy5wdXNoKG5zKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmICghaGFzQWxsTmFtZXNwYWNlcykgdG9Mb2FkTGFuZ3VhZ2VzLnB1c2gobG5nKTtcbiAgICB9KTtcblxuICAgIGlmICh0b0xvYWQubGVuZ3RoIHx8IHBlbmRpbmcubGVuZ3RoKSB7XG4gICAgICB0aGlzLnF1ZXVlLnB1c2goe1xuICAgICAgICBwZW5kaW5nLFxuICAgICAgICBsb2FkZWQ6IHt9LFxuICAgICAgICBlcnJvcnM6IFtdLFxuICAgICAgICBjYWxsYmFjayxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0b0xvYWQsXG4gICAgICBwZW5kaW5nLFxuICAgICAgdG9Mb2FkTGFuZ3VhZ2VzLFxuICAgICAgdG9Mb2FkTmFtZXNwYWNlcyxcbiAgICB9O1xuICB9XG5cbiAgbG9hZGVkKG5hbWUsIGVyciwgZGF0YSkge1xuICAgIGNvbnN0IHMgPSBuYW1lLnNwbGl0KCd8Jyk7XG4gICAgY29uc3QgbG5nID0gc1swXTtcbiAgICBjb25zdCBucyA9IHNbMV07XG5cbiAgICBpZiAoZXJyKSB0aGlzLmVtaXQoJ2ZhaWxlZExvYWRpbmcnLCBsbmcsIG5zLCBlcnIpO1xuXG4gICAgaWYgKGRhdGEpIHtcbiAgICAgIHRoaXMuc3RvcmUuYWRkUmVzb3VyY2VCdW5kbGUobG5nLCBucywgZGF0YSk7XG4gICAgfVxuXG4gICAgLy8gc2V0IGxvYWRlZFxuICAgIHRoaXMuc3RhdGVbbmFtZV0gPSBlcnIgPyAtMSA6IDI7XG5cbiAgICAvLyBjb25zb2xpZGF0ZWQgbG9hZGluZyBkb25lIGluIHRoaXMgcnVuIC0gb25seSBlbWl0IG9uY2UgZm9yIGEgbG9hZGVkIG5hbWVzcGFjZVxuICAgIGNvbnN0IGxvYWRlZCA9IHt9O1xuXG4gICAgLy8gY2FsbGJhY2sgaWYgcmVhZHlcbiAgICB0aGlzLnF1ZXVlLmZvckVhY2gocSA9PiB7XG4gICAgICB1dGlscy5wdXNoUGF0aChxLmxvYWRlZCwgW2xuZ10sIG5zKTtcbiAgICAgIHJlbW92ZShxLnBlbmRpbmcsIG5hbWUpO1xuXG4gICAgICBpZiAoZXJyKSBxLmVycm9ycy5wdXNoKGVycik7XG5cbiAgICAgIGlmIChxLnBlbmRpbmcubGVuZ3RoID09PSAwICYmICFxLmRvbmUpIHtcbiAgICAgICAgLy8gb25seSBkbyBvbmNlIHBlciBsb2FkZWQgLT4gdGhpcy5lbWl0KCdsb2FkZWQnLCBxLmxvYWRlZCk7XG4gICAgICAgIE9iamVjdC5rZXlzKHEubG9hZGVkKS5mb3JFYWNoKGwgPT4ge1xuICAgICAgICAgIGlmICghbG9hZGVkW2xdKSBsb2FkZWRbbF0gPSBbXTtcbiAgICAgICAgICBpZiAocS5sb2FkZWRbbF0ubGVuZ3RoKSB7XG4gICAgICAgICAgICBxLmxvYWRlZFtsXS5mb3JFYWNoKG5zID0+IHtcbiAgICAgICAgICAgICAgaWYgKGxvYWRlZFtsXS5pbmRleE9mKG5zKSA8IDApIGxvYWRlZFtsXS5wdXNoKG5zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyogZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOiAwICovXG4gICAgICAgIHEuZG9uZSA9IHRydWU7XG4gICAgICAgIGlmIChxLmVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICBxLmNhbGxiYWNrKHEuZXJyb3JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBxLmNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGVtaXQgY29uc29saWRhdGVkIGxvYWRlZCBldmVudFxuICAgIHRoaXMuZW1pdCgnbG9hZGVkJywgbG9hZGVkKTtcblxuICAgIC8vIHJlbW92ZSBkb25lIGxvYWQgcmVxdWVzdHNcbiAgICB0aGlzLnF1ZXVlID0gdGhpcy5xdWV1ZS5maWx0ZXIocSA9PiAhcS5kb25lKTtcbiAgfVxuXG4gIHJlYWQobG5nLCBucywgZmNOYW1lLCB0cmllZCA9IDAsIHdhaXQgPSAzNTAsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCFsbmcubGVuZ3RoKSByZXR1cm4gY2FsbGJhY2sobnVsbCwge30pOyAvLyBub3RpbmcgdG8gbG9hZFxuXG4gICAgcmV0dXJuIHRoaXMuYmFja2VuZFtmY05hbWVdKGxuZywgbnMsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgIGlmIChlcnIgJiYgZGF0YSAvKiA9IHJldHJ5RmxhZyAqLyAmJiB0cmllZCA8IDUpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5yZWFkLmNhbGwodGhpcywgbG5nLCBucywgZmNOYW1lLCB0cmllZCArIDEsIHdhaXQgKiAyLCBjYWxsYmFjayk7XG4gICAgICAgIH0sIHdhaXQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjYWxsYmFjayhlcnIsIGRhdGEpO1xuICAgIH0pO1xuICB9XG5cbiAgLyogZXNsaW50IGNvbnNpc3RlbnQtcmV0dXJuOiAwICovXG4gIHByZXBhcmVMb2FkaW5nKGxhbmd1YWdlcywgbmFtZXNwYWNlcywgb3B0aW9ucyA9IHt9LCBjYWxsYmFjaykge1xuICAgIGlmICghdGhpcy5iYWNrZW5kKSB7XG4gICAgICB0aGlzLmxvZ2dlci53YXJuKCdObyBiYWNrZW5kIHdhcyBhZGRlZCB2aWEgaTE4bmV4dC51c2UuIFdpbGwgbm90IGxvYWQgcmVzb3VyY2VzLicpO1xuICAgICAgcmV0dXJuIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBsYW5ndWFnZXMgPT09ICdzdHJpbmcnKSBsYW5ndWFnZXMgPSB0aGlzLmxhbmd1YWdlVXRpbHMudG9SZXNvbHZlSGllcmFyY2h5KGxhbmd1YWdlcyk7XG4gICAgaWYgKHR5cGVvZiBuYW1lc3BhY2VzID09PSAnc3RyaW5nJykgbmFtZXNwYWNlcyA9IFtuYW1lc3BhY2VzXTtcblxuICAgIGNvbnN0IHRvTG9hZCA9IHRoaXMucXVldWVMb2FkKGxhbmd1YWdlcywgbmFtZXNwYWNlcywgb3B0aW9ucywgY2FsbGJhY2spO1xuICAgIGlmICghdG9Mb2FkLnRvTG9hZC5sZW5ndGgpIHtcbiAgICAgIGlmICghdG9Mb2FkLnBlbmRpbmcubGVuZ3RoKSBjYWxsYmFjaygpOyAvLyBub3RoaW5nIHRvIGxvYWQgYW5kIG5vIHBlbmRpbmdzLi4uY2FsbGJhY2sgbm93XG4gICAgICByZXR1cm4gbnVsbDsgLy8gcGVuZGluZ3Mgd2lsbCB0cmlnZ2VyIGNhbGxiYWNrXG4gICAgfVxuXG4gICAgdG9Mb2FkLnRvTG9hZC5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgdGhpcy5sb2FkT25lKG5hbWUpO1xuICAgIH0pO1xuICB9XG5cbiAgbG9hZChsYW5ndWFnZXMsIG5hbWVzcGFjZXMsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5wcmVwYXJlTG9hZGluZyhsYW5ndWFnZXMsIG5hbWVzcGFjZXMsIHt9LCBjYWxsYmFjayk7XG4gIH1cblxuICByZWxvYWQobGFuZ3VhZ2VzLCBuYW1lc3BhY2VzLCBjYWxsYmFjaykge1xuICAgIHRoaXMucHJlcGFyZUxvYWRpbmcobGFuZ3VhZ2VzLCBuYW1lc3BhY2VzLCB7IHJlbG9hZDogdHJ1ZSB9LCBjYWxsYmFjayk7XG4gIH1cblxuICBsb2FkT25lKG5hbWUsIHByZWZpeCA9ICcnKSB7XG4gICAgY29uc3QgcyA9IG5hbWUuc3BsaXQoJ3wnKTtcbiAgICBjb25zdCBsbmcgPSBzWzBdO1xuICAgIGNvbnN0IG5zID0gc1sxXTtcblxuICAgIHRoaXMucmVhZChsbmcsIG5zLCAncmVhZCcsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICBpZiAoZXJyKSB0aGlzLmxvZ2dlci53YXJuKGAke3ByZWZpeH1sb2FkaW5nIG5hbWVzcGFjZSAke25zfSBmb3IgbGFuZ3VhZ2UgJHtsbmd9IGZhaWxlZGAsIGVycik7XG4gICAgICBpZiAoIWVyciAmJiBkYXRhKVxuICAgICAgICB0aGlzLmxvZ2dlci5sb2coYCR7cHJlZml4fWxvYWRlZCBuYW1lc3BhY2UgJHtuc30gZm9yIGxhbmd1YWdlICR7bG5nfWAsIGRhdGEpO1xuXG4gICAgICB0aGlzLmxvYWRlZChuYW1lLCBlcnIsIGRhdGEpO1xuICAgIH0pO1xuICB9XG5cbiAgc2F2ZU1pc3NpbmcobGFuZ3VhZ2VzLCBuYW1lc3BhY2UsIGtleSwgZmFsbGJhY2tWYWx1ZSwgaXNVcGRhdGUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGlmIChcbiAgICAgIHRoaXMuc2VydmljZXMudXRpbHMgJiZcbiAgICAgIHRoaXMuc2VydmljZXMudXRpbHMuaGFzTG9hZGVkTmFtZXNwYWNlICYmXG4gICAgICAhdGhpcy5zZXJ2aWNlcy51dGlscy5oYXNMb2FkZWROYW1lc3BhY2UobmFtZXNwYWNlKVxuICAgICkge1xuICAgICAgdGhpcy5sb2dnZXIud2FybihcbiAgICAgICAgYGRpZCBub3Qgc2F2ZSBrZXkgXCIke2tleX1cIiBhcyB0aGUgbmFtZXNwYWNlIFwiJHtuYW1lc3BhY2V9XCIgd2FzIG5vdCB5ZXQgbG9hZGVkYCxcbiAgICAgICAgJ1RoaXMgbWVhbnMgc29tZXRoaW5nIElTIFdST05HIGluIHlvdXIgc2V0dXAuIFlvdSBhY2Nlc3MgdGhlIHQgZnVuY3Rpb24gYmVmb3JlIGkxOG5leHQuaW5pdCAvIGkxOG5leHQubG9hZE5hbWVzcGFjZSAvIGkxOG5leHQuY2hhbmdlTGFuZ3VhZ2Ugd2FzIGRvbmUuIFdhaXQgZm9yIHRoZSBjYWxsYmFjayBvciBQcm9taXNlIHRvIHJlc29sdmUgYmVmb3JlIGFjY2Vzc2luZyBpdCEhIScsXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGlnbm9yZSBub24gdmFsaWQga2V5c1xuICAgIGlmIChrZXkgPT09IHVuZGVmaW5lZCB8fCBrZXkgPT09IG51bGwgfHwga2V5ID09PSAnJykgcmV0dXJuO1xuXG4gICAgaWYgKHRoaXMuYmFja2VuZCAmJiB0aGlzLmJhY2tlbmQuY3JlYXRlKSB7XG4gICAgICB0aGlzLmJhY2tlbmQuY3JlYXRlKGxhbmd1YWdlcywgbmFtZXNwYWNlLCBrZXksIGZhbGxiYWNrVmFsdWUsIG51bGwgLyogdW51c2VkIGNhbGxiYWNrICovLCB7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIGlzVXBkYXRlLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gd3JpdGUgdG8gc3RvcmUgdG8gYXZvaWQgcmVzZW5kaW5nXG4gICAgaWYgKCFsYW5ndWFnZXMgfHwgIWxhbmd1YWdlc1swXSkgcmV0dXJuO1xuICAgIHRoaXMuc3RvcmUuYWRkUmVzb3VyY2UobGFuZ3VhZ2VzWzBdLCBuYW1lc3BhY2UsIGtleSwgZmFsbGJhY2tWYWx1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29ubmVjdG9yO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIGdldCgpIHtcbiAgcmV0dXJuIHtcbiAgICBkZWJ1ZzogZmFsc2UsXG4gICAgaW5pdEltbWVkaWF0ZTogdHJ1ZSxcblxuICAgIG5zOiBbJ3RyYW5zbGF0aW9uJ10sXG4gICAgZGVmYXVsdE5TOiBbJ3RyYW5zbGF0aW9uJ10sXG4gICAgZmFsbGJhY2tMbmc6IFsnZGV2J10sXG4gICAgZmFsbGJhY2tOUzogZmFsc2UsIC8vIHN0cmluZyBvciBhcnJheSBvZiBuYW1lc3BhY2VzXG5cbiAgICAvLyB0ZW1wb3JhbCBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSBXSElURUxJU1QgUkVNT1ZBTFxuICAgIHdoaXRlbGlzdDogZmFsc2UsIC8vIGFycmF5IHdpdGggc3VwcG9ydGVkIGxhbmd1YWdlc1xuICAgIG5vbkV4cGxpY2l0V2hpdGVsaXN0OiBmYWxzZSxcbiAgICAvLyBlbmQgdGVtcG9yYWwgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgV0hJVEVMSVNUIFJFTU9WQUxcblxuICAgIHN1cHBvcnRlZExuZ3M6IGZhbHNlLCAvLyBhcnJheSB3aXRoIHN1cHBvcnRlZCBsYW5ndWFnZXNcbiAgICBub25FeHBsaWNpdFN1cHBvcnRlZExuZ3M6IGZhbHNlLFxuICAgIGxvYWQ6ICdhbGwnLCAvLyB8IGN1cnJlbnRPbmx5IHwgbGFuZ3VhZ2VPbmx5XG4gICAgcHJlbG9hZDogZmFsc2UsIC8vIGFycmF5IHdpdGggcHJlbG9hZCBsYW5ndWFnZXNcblxuICAgIHNpbXBsaWZ5UGx1cmFsU3VmZml4OiB0cnVlLFxuICAgIGtleVNlcGFyYXRvcjogJy4nLFxuICAgIG5zU2VwYXJhdG9yOiAnOicsXG4gICAgcGx1cmFsU2VwYXJhdG9yOiAnXycsXG4gICAgY29udGV4dFNlcGFyYXRvcjogJ18nLFxuXG4gICAgcGFydGlhbEJ1bmRsZWRMYW5ndWFnZXM6IGZhbHNlLCAvLyBhbGxvdyBidW5kbGluZyBjZXJ0YWluIGxhbmd1YWdlcyB0aGF0IGFyZSBub3QgcmVtb3RlbHkgZmV0Y2hlZFxuICAgIHNhdmVNaXNzaW5nOiBmYWxzZSwgLy8gZW5hYmxlIHRvIHNlbmQgbWlzc2luZyB2YWx1ZXNcbiAgICB1cGRhdGVNaXNzaW5nOiBmYWxzZSwgLy8gZW5hYmxlIHRvIHVwZGF0ZSBkZWZhdWx0IHZhbHVlcyBpZiBkaWZmZXJlbnQgZnJvbSB0cmFuc2xhdGVkIHZhbHVlIChvbmx5IHVzZWZ1bCBvbiBpbml0aWFsIGRldmVsb3BtZW50LCBvciB3aGVuIGtlZXBpbmcgY29kZSBhcyBzb3VyY2Ugb2YgdHJ1dGgpXG4gICAgc2F2ZU1pc3NpbmdUbzogJ2ZhbGxiYWNrJywgLy8gJ2N1cnJlbnQnIHx8ICdhbGwnXG4gICAgc2F2ZU1pc3NpbmdQbHVyYWxzOiB0cnVlLCAvLyB3aWxsIHNhdmUgYWxsIGZvcm1zIG5vdCBvbmx5IHNpbmd1bGFyIGtleVxuICAgIG1pc3NpbmdLZXlIYW5kbGVyOiBmYWxzZSwgLy8gZnVuY3Rpb24obG5nLCBucywga2V5LCBmYWxsYmFja1ZhbHVlKSAtPiBvdmVycmlkZSBpZiBwcmVmZXIgb24gaGFuZGxpbmdcbiAgICBtaXNzaW5nSW50ZXJwb2xhdGlvbkhhbmRsZXI6IGZhbHNlLCAvLyBmdW5jdGlvbihzdHIsIG1hdGNoKVxuXG4gICAgcG9zdFByb2Nlc3M6IGZhbHNlLCAvLyBzdHJpbmcgb3IgYXJyYXkgb2YgcG9zdFByb2Nlc3NvciBuYW1lc1xuICAgIHBvc3RQcm9jZXNzUGFzc1Jlc29sdmVkOiBmYWxzZSwgLy8gcGFzcyByZXNvbHZlZCBvYmplY3QgaW50byAnb3B0aW9ucy5pMThuUmVzb2x2ZWQnIGZvciBwb3N0cHJvY2Vzc29yXG4gICAgcmV0dXJuTnVsbDogdHJ1ZSwgLy8gYWxsb3dzIG51bGwgdmFsdWUgYXMgdmFsaWQgdHJhbnNsYXRpb25cbiAgICByZXR1cm5FbXB0eVN0cmluZzogdHJ1ZSwgLy8gYWxsb3dzIGVtcHR5IHN0cmluZyB2YWx1ZSBhcyB2YWxpZCB0cmFuc2xhdGlvblxuICAgIHJldHVybk9iamVjdHM6IGZhbHNlLFxuICAgIGpvaW5BcnJheXM6IGZhbHNlLCAvLyBvciBzdHJpbmcgdG8gam9pbiBhcnJheVxuICAgIHJldHVybmVkT2JqZWN0SGFuZGxlcjogZmFsc2UsIC8vIGZ1bmN0aW9uKGtleSwgdmFsdWUsIG9wdGlvbnMpIHRyaWdnZXJlZCBpZiBrZXkgcmV0dXJucyBvYmplY3QgYnV0IHJldHVybk9iamVjdHMgaXMgc2V0IHRvIGZhbHNlXG4gICAgcGFyc2VNaXNzaW5nS2V5SGFuZGxlcjogZmFsc2UsIC8vIGZ1bmN0aW9uKGtleSkgcGFyc2VkIGEga2V5IHRoYXQgd2FzIG5vdCBmb3VuZCBpbiB0KCkgYmVmb3JlIHJldHVybmluZ1xuICAgIGFwcGVuZE5hbWVzcGFjZVRvTWlzc2luZ0tleTogZmFsc2UsXG4gICAgYXBwZW5kTmFtZXNwYWNlVG9DSU1vZGU6IGZhbHNlLFxuICAgIG92ZXJsb2FkVHJhbnNsYXRpb25PcHRpb25IYW5kbGVyOiBmdW5jdGlvbiBoYW5kbGUoYXJncykge1xuICAgICAgdmFyIHJldCA9IHt9O1xuICAgICAgaWYgKHR5cGVvZiBhcmdzWzFdID09PSAnb2JqZWN0JykgcmV0ID0gYXJnc1sxXTtcbiAgICAgIGlmICh0eXBlb2YgYXJnc1sxXSA9PT0gJ3N0cmluZycpIHJldC5kZWZhdWx0VmFsdWUgPSBhcmdzWzFdO1xuICAgICAgaWYgKHR5cGVvZiBhcmdzWzJdID09PSAnc3RyaW5nJykgcmV0LnREZXNjcmlwdGlvbiA9IGFyZ3NbMl07XG4gICAgICBpZiAodHlwZW9mIGFyZ3NbMl0gPT09ICdvYmplY3QnIHx8IHR5cGVvZiBhcmdzWzNdID09PSAnb2JqZWN0Jykge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IGFyZ3NbM10gfHwgYXJnc1syXTtcbiAgICAgICAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICByZXRba2V5XSA9IG9wdGlvbnNba2V5XTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG4gICAgaW50ZXJwb2xhdGlvbjoge1xuICAgICAgZXNjYXBlVmFsdWU6IHRydWUsXG4gICAgICBmb3JtYXQ6ICh2YWx1ZSwgZm9ybWF0LCBsbmcsIG9wdGlvbnMpID0+IHZhbHVlLFxuICAgICAgcHJlZml4OiAne3snLFxuICAgICAgc3VmZml4OiAnfX0nLFxuICAgICAgZm9ybWF0U2VwYXJhdG9yOiAnLCcsXG4gICAgICAvLyBwcmVmaXhFc2NhcGVkOiAne3snLFxuICAgICAgLy8gc3VmZml4RXNjYXBlZDogJ319JyxcbiAgICAgIC8vIHVuZXNjYXBlU3VmZml4OiAnJyxcbiAgICAgIHVuZXNjYXBlUHJlZml4OiAnLScsXG5cbiAgICAgIG5lc3RpbmdQcmVmaXg6ICckdCgnLFxuICAgICAgbmVzdGluZ1N1ZmZpeDogJyknLFxuICAgICAgbmVzdGluZ09wdGlvbnNTZXBhcmF0b3I6ICcsJyxcbiAgICAgIC8vIG5lc3RpbmdQcmVmaXhFc2NhcGVkOiAnJHQoJyxcbiAgICAgIC8vIG5lc3RpbmdTdWZmaXhFc2NhcGVkOiAnKScsXG4gICAgICAvLyBkZWZhdWx0VmFyaWFibGVzOiB1bmRlZmluZWQgLy8gb2JqZWN0IHRoYXQgY2FuIGhhdmUgdmFsdWVzIHRvIGludGVycG9sYXRlIG9uIC0gZXh0ZW5kcyBwYXNzZWQgaW4gaW50ZXJwb2xhdGlvbiBkYXRhXG4gICAgICBtYXhSZXBsYWNlczogMTAwMCwgLy8gbWF4IHJlcGxhY2VzIHRvIHByZXZlbnQgZW5kbGVzcyBsb29wXG4gICAgICBza2lwT25WYXJpYWJsZXM6IGZhbHNlLFxuICAgIH0sXG4gIH07XG59XG5cbi8qIGVzbGludCBuby1wYXJhbS1yZWFzc2lnbjogMCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU9wdGlvbnMob3B0aW9ucykge1xuICAvLyBjcmVhdGUgbmFtZXNwYWNlIG9iamVjdCBpZiBuYW1lc3BhY2UgaXMgcGFzc2VkIGluIGFzIHN0cmluZ1xuICBpZiAodHlwZW9mIG9wdGlvbnMubnMgPT09ICdzdHJpbmcnKSBvcHRpb25zLm5zID0gW29wdGlvbnMubnNdO1xuICBpZiAodHlwZW9mIG9wdGlvbnMuZmFsbGJhY2tMbmcgPT09ICdzdHJpbmcnKSBvcHRpb25zLmZhbGxiYWNrTG5nID0gW29wdGlvbnMuZmFsbGJhY2tMbmddO1xuICBpZiAodHlwZW9mIG9wdGlvbnMuZmFsbGJhY2tOUyA9PT0gJ3N0cmluZycpIG9wdGlvbnMuZmFsbGJhY2tOUyA9IFtvcHRpb25zLmZhbGxiYWNrTlNdO1xuXG4gIC8vIHRlbXBvcmFsIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IFdISVRFTElTVCBSRU1PVkFMXG4gIGlmIChvcHRpb25zLndoaXRlbGlzdCkge1xuICAgIGlmIChvcHRpb25zLndoaXRlbGlzdCAmJiBvcHRpb25zLndoaXRlbGlzdC5pbmRleE9mKCdjaW1vZGUnKSA8IDApIHtcbiAgICAgIG9wdGlvbnMud2hpdGVsaXN0ID0gb3B0aW9ucy53aGl0ZWxpc3QuY29uY2F0KFsnY2ltb2RlJ10pO1xuICAgIH1cblxuICAgIG9wdGlvbnMuc3VwcG9ydGVkTG5ncyA9IG9wdGlvbnMud2hpdGVsaXN0O1xuICB9XG5cbiAgaWYgKG9wdGlvbnMubm9uRXhwbGljaXRXaGl0ZWxpc3QpIHtcbiAgICBvcHRpb25zLm5vbkV4cGxpY2l0U3VwcG9ydGVkTG5ncyA9IG9wdGlvbnMubm9uRXhwbGljaXRXaGl0ZWxpc3Q7XG4gIH1cbiAgLy8gZW5kIHRlbXBvcmFsIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IFdISVRFTElTVCBSRU1PVkFMXG5cbiAgLy8gZXh0ZW5kIHN1cHBvcnRlZExuZ3Mgd2l0aCBjaW1vZGVcbiAgaWYgKG9wdGlvbnMuc3VwcG9ydGVkTG5ncyAmJiBvcHRpb25zLnN1cHBvcnRlZExuZ3MuaW5kZXhPZignY2ltb2RlJykgPCAwKSB7XG4gICAgb3B0aW9ucy5zdXBwb3J0ZWRMbmdzID0gb3B0aW9ucy5zdXBwb3J0ZWRMbmdzLmNvbmNhdChbJ2NpbW9kZSddKTtcbiAgfVxuXG4gIHJldHVybiBvcHRpb25zO1xufVxuIiwiaW1wb3J0IGJhc2VMb2dnZXIgZnJvbSAnLi9sb2dnZXIuanMnO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL0V2ZW50RW1pdHRlci5qcyc7XG5pbXBvcnQgUmVzb3VyY2VTdG9yZSBmcm9tICcuL1Jlc291cmNlU3RvcmUuanMnO1xuaW1wb3J0IFRyYW5zbGF0b3IgZnJvbSAnLi9UcmFuc2xhdG9yLmpzJztcbmltcG9ydCBMYW5ndWFnZVV0aWxzIGZyb20gJy4vTGFuZ3VhZ2VVdGlscy5qcyc7XG5pbXBvcnQgUGx1cmFsUmVzb2x2ZXIgZnJvbSAnLi9QbHVyYWxSZXNvbHZlci5qcyc7XG5pbXBvcnQgSW50ZXJwb2xhdG9yIGZyb20gJy4vSW50ZXJwb2xhdG9yLmpzJztcbmltcG9ydCBCYWNrZW5kQ29ubmVjdG9yIGZyb20gJy4vQmFja2VuZENvbm5lY3Rvci5qcyc7XG5pbXBvcnQgeyBnZXQgYXMgZ2V0RGVmYXVsdHMsIHRyYW5zZm9ybU9wdGlvbnMgfSBmcm9tICcuL2RlZmF1bHRzLmpzJztcbmltcG9ydCBwb3N0UHJvY2Vzc29yIGZyb20gJy4vcG9zdFByb2Nlc3Nvci5qcyc7XG5pbXBvcnQgeyBkZWZlciwgaXNJRTEwIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7IH1cblxuY2xhc3MgSTE4biBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSwgY2FsbGJhY2spIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChpc0lFMTApIHtcbiAgICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpIC8vIDw9SUUxMCBmaXggKHVuYWJsZSB0byBjYWxsIHBhcmVudCBjb25zdHJ1Y3RvcilcbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMgPSB0cmFuc2Zvcm1PcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMuc2VydmljZXMgPSB7fTtcbiAgICB0aGlzLmxvZ2dlciA9IGJhc2VMb2dnZXI7XG4gICAgdGhpcy5tb2R1bGVzID0geyBleHRlcm5hbDogW10gfTtcblxuICAgIGlmIChjYWxsYmFjayAmJiAhdGhpcy5pc0luaXRpYWxpemVkICYmICFvcHRpb25zLmlzQ2xvbmUpIHtcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9pMThuZXh0L2kxOG5leHQvaXNzdWVzLzg3OVxuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuaW5pdEltbWVkaWF0ZSkge1xuICAgICAgICB0aGlzLmluaXQob3B0aW9ucywgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmluaXQob3B0aW9ucywgY2FsbGJhY2spO1xuICAgICAgfSwgMCk7XG4gICAgfVxuICB9XG5cbiAgaW5pdChvcHRpb25zID0ge30sIGNhbGxiYWNrKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuXG4gICAgLy8gdGVtcG9yYWwgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgV0hJVEVMSVNUIFJFTU9WQUxcbiAgICBpZiAob3B0aW9ucy53aGl0ZWxpc3QgJiYgIW9wdGlvbnMuc3VwcG9ydGVkTG5ncykge1xuICAgICAgdGhpcy5sb2dnZXIuZGVwcmVjYXRlKCd3aGl0ZWxpc3QnLCAnb3B0aW9uIFwid2hpdGVsaXN0XCIgd2lsbCBiZSByZW5hbWVkIHRvIFwic3VwcG9ydGVkTG5nc1wiIGluIHRoZSBuZXh0IG1ham9yIC0gcGxlYXNlIG1ha2Ugc3VyZSB0byByZW5hbWUgdGhpcyBvcHRpb24gYXNhcC4nKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMubm9uRXhwbGljaXRXaGl0ZWxpc3QgJiYgIW9wdGlvbnMubm9uRXhwbGljaXRTdXBwb3J0ZWRMbmdzKSB7XG4gICAgICB0aGlzLmxvZ2dlci5kZXByZWNhdGUoJ3doaXRlbGlzdCcsICdvcHRpb25zIFwibm9uRXhwbGljaXRXaGl0ZWxpc3RcIiB3aWxsIGJlIHJlbmFtZWQgdG8gXCJub25FeHBsaWNpdFN1cHBvcnRlZExuZ3NcIiBpbiB0aGUgbmV4dCBtYWpvciAtIHBsZWFzZSBtYWtlIHN1cmUgdG8gcmVuYW1lIHRoaXMgb3B0aW9uIGFzYXAuJyk7XG4gICAgfVxuICAgIC8vIGVuZCB0ZW1wb3JhbCBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSBXSElURUxJU1QgUkVNT1ZBTFxuXG5cbiAgICB0aGlzLm9wdGlvbnMgPSB7IC4uLmdldERlZmF1bHRzKCksIC4uLnRoaXMub3B0aW9ucywgLi4udHJhbnNmb3JtT3B0aW9ucyhvcHRpb25zKSB9O1xuXG4gICAgdGhpcy5mb3JtYXQgPSB0aGlzLm9wdGlvbnMuaW50ZXJwb2xhdGlvbi5mb3JtYXQ7XG4gICAgaWYgKCFjYWxsYmFjaykgY2FsbGJhY2sgPSBub29wO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlQ2xhc3NPbkRlbWFuZChDbGFzc09yT2JqZWN0KSB7XG4gICAgICBpZiAoIUNsYXNzT3JPYmplY3QpIHJldHVybiBudWxsO1xuICAgICAgaWYgKHR5cGVvZiBDbGFzc09yT2JqZWN0ID09PSAnZnVuY3Rpb24nKSByZXR1cm4gbmV3IENsYXNzT3JPYmplY3QoKTtcbiAgICAgIHJldHVybiBDbGFzc09yT2JqZWN0O1xuICAgIH1cblxuICAgIC8vIGluaXQgc2VydmljZXNcbiAgICBpZiAoIXRoaXMub3B0aW9ucy5pc0Nsb25lKSB7XG4gICAgICBpZiAodGhpcy5tb2R1bGVzLmxvZ2dlcikge1xuICAgICAgICBiYXNlTG9nZ2VyLmluaXQoY3JlYXRlQ2xhc3NPbkRlbWFuZCh0aGlzLm1vZHVsZXMubG9nZ2VyKSwgdGhpcy5vcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJhc2VMb2dnZXIuaW5pdChudWxsLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBsdSA9IG5ldyBMYW5ndWFnZVV0aWxzKHRoaXMub3B0aW9ucyk7XG4gICAgICB0aGlzLnN0b3JlID0gbmV3IFJlc291cmNlU3RvcmUodGhpcy5vcHRpb25zLnJlc291cmNlcywgdGhpcy5vcHRpb25zKTtcblxuICAgICAgY29uc3QgcyA9IHRoaXMuc2VydmljZXM7XG4gICAgICBzLmxvZ2dlciA9IGJhc2VMb2dnZXI7XG4gICAgICBzLnJlc291cmNlU3RvcmUgPSB0aGlzLnN0b3JlO1xuICAgICAgcy5sYW5ndWFnZVV0aWxzID0gbHU7XG4gICAgICBzLnBsdXJhbFJlc29sdmVyID0gbmV3IFBsdXJhbFJlc29sdmVyKGx1LCB7XG4gICAgICAgIHByZXBlbmQ6IHRoaXMub3B0aW9ucy5wbHVyYWxTZXBhcmF0b3IsXG4gICAgICAgIGNvbXBhdGliaWxpdHlKU09OOiB0aGlzLm9wdGlvbnMuY29tcGF0aWJpbGl0eUpTT04sXG4gICAgICAgIHNpbXBsaWZ5UGx1cmFsU3VmZml4OiB0aGlzLm9wdGlvbnMuc2ltcGxpZnlQbHVyYWxTdWZmaXgsXG4gICAgICB9KTtcbiAgICAgIHMuaW50ZXJwb2xhdG9yID0gbmV3IEludGVycG9sYXRvcih0aGlzLm9wdGlvbnMpO1xuICAgICAgcy51dGlscyA9IHtcbiAgICAgICAgaGFzTG9hZGVkTmFtZXNwYWNlOiB0aGlzLmhhc0xvYWRlZE5hbWVzcGFjZS5iaW5kKHRoaXMpXG4gICAgICB9XG5cbiAgICAgIHMuYmFja2VuZENvbm5lY3RvciA9IG5ldyBCYWNrZW5kQ29ubmVjdG9yKFxuICAgICAgICBjcmVhdGVDbGFzc09uRGVtYW5kKHRoaXMubW9kdWxlcy5iYWNrZW5kKSxcbiAgICAgICAgcy5yZXNvdXJjZVN0b3JlLFxuICAgICAgICBzLFxuICAgICAgICB0aGlzLm9wdGlvbnMsXG4gICAgICApO1xuICAgICAgLy8gcGlwZSBldmVudHMgZnJvbSBiYWNrZW5kQ29ubmVjdG9yXG4gICAgICBzLmJhY2tlbmRDb25uZWN0b3Iub24oJyonLCAoZXZlbnQsIC4uLmFyZ3MpID0+IHtcbiAgICAgICAgdGhpcy5lbWl0KGV2ZW50LCAuLi5hcmdzKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodGhpcy5tb2R1bGVzLmxhbmd1YWdlRGV0ZWN0b3IpIHtcbiAgICAgICAgcy5sYW5ndWFnZURldGVjdG9yID0gY3JlYXRlQ2xhc3NPbkRlbWFuZCh0aGlzLm1vZHVsZXMubGFuZ3VhZ2VEZXRlY3Rvcik7XG4gICAgICAgIHMubGFuZ3VhZ2VEZXRlY3Rvci5pbml0KHMsIHRoaXMub3B0aW9ucy5kZXRlY3Rpb24sIHRoaXMub3B0aW9ucyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm1vZHVsZXMuaTE4bkZvcm1hdCkge1xuICAgICAgICBzLmkxOG5Gb3JtYXQgPSBjcmVhdGVDbGFzc09uRGVtYW5kKHRoaXMubW9kdWxlcy5pMThuRm9ybWF0KTtcbiAgICAgICAgaWYgKHMuaTE4bkZvcm1hdC5pbml0KSBzLmkxOG5Gb3JtYXQuaW5pdCh0aGlzKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50cmFuc2xhdG9yID0gbmV3IFRyYW5zbGF0b3IodGhpcy5zZXJ2aWNlcywgdGhpcy5vcHRpb25zKTtcbiAgICAgIC8vIHBpcGUgZXZlbnRzIGZyb20gdHJhbnNsYXRvclxuICAgICAgdGhpcy50cmFuc2xhdG9yLm9uKCcqJywgKGV2ZW50LCAuLi5hcmdzKSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdChldmVudCwgLi4uYXJncyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5tb2R1bGVzLmV4dGVybmFsLmZvckVhY2gobSA9PiB7XG4gICAgICAgIGlmIChtLmluaXQpIG0uaW5pdCh0aGlzKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZmFsbGJhY2tMbmcgJiYgIXRoaXMuc2VydmljZXMubGFuZ3VhZ2VEZXRlY3RvciAmJiAhdGhpcy5vcHRpb25zLmxuZykge1xuICAgICAgY29uc3QgY29kZXMgPSB0aGlzLnNlcnZpY2VzLmxhbmd1YWdlVXRpbHMuZ2V0RmFsbGJhY2tDb2Rlcyh0aGlzLm9wdGlvbnMuZmFsbGJhY2tMbmcpXG4gICAgICBpZiAoY29kZXMubGVuZ3RoID4gMCAmJiBjb2Rlc1swXSAhPT0gJ2RldicpIHRoaXMub3B0aW9ucy5sbmcgPSBjb2Rlc1swXVxuICAgIH1cbiAgICBpZiAoIXRoaXMuc2VydmljZXMubGFuZ3VhZ2VEZXRlY3RvciAmJiAhdGhpcy5vcHRpb25zLmxuZykge1xuICAgICAgdGhpcy5sb2dnZXIud2FybignaW5pdDogbm8gbGFuZ3VhZ2VEZXRlY3RvciBpcyB1c2VkIGFuZCBubyBsbmcgaXMgZGVmaW5lZCcpO1xuICAgIH1cblxuICAgIC8vIGFwcGVuZCBhcGlcbiAgICBjb25zdCBzdG9yZUFwaSA9IFtcbiAgICAgICdnZXRSZXNvdXJjZScsXG4gICAgICAnaGFzUmVzb3VyY2VCdW5kbGUnLFxuICAgICAgJ2dldFJlc291cmNlQnVuZGxlJyxcbiAgICAgICdnZXREYXRhQnlMYW5ndWFnZScsXG4gICAgXTtcbiAgICBzdG9yZUFwaS5mb3JFYWNoKGZjTmFtZSA9PiB7XG4gICAgICB0aGlzW2ZjTmFtZV0gPSAoLi4uYXJncykgPT4gdGhpcy5zdG9yZVtmY05hbWVdKC4uLmFyZ3MpO1xuICAgIH0pO1xuICAgIGNvbnN0IHN0b3JlQXBpQ2hhaW5lZCA9IFtcbiAgICAgICdhZGRSZXNvdXJjZScsXG4gICAgICAnYWRkUmVzb3VyY2VzJyxcbiAgICAgICdhZGRSZXNvdXJjZUJ1bmRsZScsXG4gICAgICAncmVtb3ZlUmVzb3VyY2VCdW5kbGUnLFxuICAgIF07XG4gICAgc3RvcmVBcGlDaGFpbmVkLmZvckVhY2goZmNOYW1lID0+IHtcbiAgICAgIHRoaXNbZmNOYW1lXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgIHRoaXMuc3RvcmVbZmNOYW1lXSguLi5hcmdzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgY29uc3QgZGVmZXJyZWQgPSBkZWZlcigpO1xuXG4gICAgY29uc3QgbG9hZCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbmlzaCA9IChlcnIsIHQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaXNJbml0aWFsaXplZCkgdGhpcy5sb2dnZXIud2FybignaW5pdDogaTE4bmV4dCBpcyBhbHJlYWR5IGluaXRpYWxpemVkLiBZb3Ugc2hvdWxkIGNhbGwgaW5pdCBqdXN0IG9uY2UhJyk7XG4gICAgICAgIHRoaXMuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmlzQ2xvbmUpIHRoaXMubG9nZ2VyLmxvZygnaW5pdGlhbGl6ZWQnLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLmVtaXQoJ2luaXRpYWxpemVkJywgdGhpcy5vcHRpb25zKTtcblxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHQpOyAvLyBub3QgcmVqZWN0aW5nIG9uIGVyciAoYXMgZXJyIGlzIG9ubHkgYSBsb2FkaW5nIHRyYW5zbGF0aW9uIGZhaWxlZCB3YXJuaW5nKVxuICAgICAgICBjYWxsYmFjayhlcnIsIHQpO1xuICAgICAgfTtcbiAgICAgIC8vIGZpeCBmb3IgdXNlIGNhc2VzIHdoZW4gY2FsbGluZyBjaGFuZ2VMYW5ndWFnZSBiZWZvcmUgZmluaXNoZWQgdG8gaW5pdGlhbGl6ZWQgKGkuZS4gaHR0cHM6Ly9naXRodWIuY29tL2kxOG5leHQvaTE4bmV4dC9pc3N1ZXMvMTU1MilcbiAgICAgIGlmICh0aGlzLmxhbmd1YWdlcyAmJiB0aGlzLm9wdGlvbnMuY29tcGF0aWJpbGl0eUFQSSAhPT0gJ3YxJykgcmV0dXJuIGZpbmlzaChudWxsLCB0aGlzLnQuYmluZCh0aGlzKSk7XG4gICAgICB0aGlzLmNoYW5nZUxhbmd1YWdlKHRoaXMub3B0aW9ucy5sbmcsIGZpbmlzaCk7XG4gICAgfTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMucmVzb3VyY2VzIHx8ICF0aGlzLm9wdGlvbnMuaW5pdEltbWVkaWF0ZSkge1xuICAgICAgbG9hZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRUaW1lb3V0KGxvYWQsIDApO1xuICAgIH1cblxuICAgIHJldHVybiBkZWZlcnJlZDtcbiAgfVxuXG4gIC8qIGVzbGludCBjb25zaXN0ZW50LXJldHVybjogMCAqL1xuICBsb2FkUmVzb3VyY2VzKGxhbmd1YWdlLCBjYWxsYmFjayA9IG5vb3ApIHtcbiAgICBsZXQgdXNlZENhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgbGV0IHVzZWRMbmcgPSB0eXBlb2YgbGFuZ3VhZ2UgPT09ICdzdHJpbmcnID8gbGFuZ3VhZ2UgOiB0aGlzLmxhbmd1YWdlO1xuICAgIGlmICh0eXBlb2YgbGFuZ3VhZ2UgPT09ICdmdW5jdGlvbicpIHVzZWRDYWxsYmFjayA9IGxhbmd1YWdlO1xuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMucmVzb3VyY2VzIHx8IHRoaXMub3B0aW9ucy5wYXJ0aWFsQnVuZGxlZExhbmd1YWdlcykge1xuICAgICAgaWYgKHVzZWRMbmcgJiYgdXNlZExuZy50b0xvd2VyQ2FzZSgpID09PSAnY2ltb2RlJykgcmV0dXJuIHVzZWRDYWxsYmFjaygpOyAvLyBhdm9pZCBsb2FkaW5nIHJlc291cmNlcyBmb3IgY2ltb2RlXG5cbiAgICAgIGNvbnN0IHRvTG9hZCA9IFtdO1xuXG4gICAgICBjb25zdCBhcHBlbmQgPSBsbmcgPT4ge1xuICAgICAgICBpZiAoIWxuZykgcmV0dXJuO1xuICAgICAgICBjb25zdCBsbmdzID0gdGhpcy5zZXJ2aWNlcy5sYW5ndWFnZVV0aWxzLnRvUmVzb2x2ZUhpZXJhcmNoeShsbmcpO1xuICAgICAgICBsbmdzLmZvckVhY2gobCA9PiB7XG4gICAgICAgICAgaWYgKHRvTG9hZC5pbmRleE9mKGwpIDwgMCkgdG9Mb2FkLnB1c2gobCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgaWYgKCF1c2VkTG5nKSB7XG4gICAgICAgIC8vIGF0IGxlYXN0IGxvYWQgZmFsbGJhY2tzIGluIHRoaXMgY2FzZVxuICAgICAgICBjb25zdCBmYWxsYmFja3MgPSB0aGlzLnNlcnZpY2VzLmxhbmd1YWdlVXRpbHMuZ2V0RmFsbGJhY2tDb2Rlcyh0aGlzLm9wdGlvbnMuZmFsbGJhY2tMbmcpO1xuICAgICAgICBmYWxsYmFja3MuZm9yRWFjaChsID0+IGFwcGVuZChsKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcHBlbmQodXNlZExuZyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucHJlbG9hZCkge1xuICAgICAgICB0aGlzLm9wdGlvbnMucHJlbG9hZC5mb3JFYWNoKGwgPT4gYXBwZW5kKGwpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXJ2aWNlcy5iYWNrZW5kQ29ubmVjdG9yLmxvYWQodG9Mb2FkLCB0aGlzLm9wdGlvbnMubnMsIHVzZWRDYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVzZWRDYWxsYmFjayhudWxsKTtcbiAgICB9XG4gIH1cblxuICByZWxvYWRSZXNvdXJjZXMobG5ncywgbnMsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIGlmICghbG5ncykgbG5ncyA9IHRoaXMubGFuZ3VhZ2VzO1xuICAgIGlmICghbnMpIG5zID0gdGhpcy5vcHRpb25zLm5zO1xuICAgIGlmICghY2FsbGJhY2spIGNhbGxiYWNrID0gbm9vcDtcbiAgICB0aGlzLnNlcnZpY2VzLmJhY2tlbmRDb25uZWN0b3IucmVsb2FkKGxuZ3MsIG5zLCBlcnIgPT4ge1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpOyAvLyBub3QgcmVqZWN0aW5nIG9uIGVyciAoYXMgZXJyIGlzIG9ubHkgYSBsb2FkaW5nIHRyYW5zbGF0aW9uIGZhaWxlZCB3YXJuaW5nKVxuICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQ7XG4gIH1cblxuICB1c2UobW9kdWxlKSB7XG4gICAgaWYgKCFtb2R1bGUpIHRocm93IG5ldyBFcnJvcignWW91IGFyZSBwYXNzaW5nIGFuIHVuZGVmaW5lZCBtb2R1bGUhIFBsZWFzZSBjaGVjayB0aGUgb2JqZWN0IHlvdSBhcmUgcGFzc2luZyB0byBpMThuZXh0LnVzZSgpJylcbiAgICBpZiAoIW1vZHVsZS50eXBlKSB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBhcmUgcGFzc2luZyBhIHdyb25nIG1vZHVsZSEgUGxlYXNlIGNoZWNrIHRoZSBvYmplY3QgeW91IGFyZSBwYXNzaW5nIHRvIGkxOG5leHQudXNlKCknKVxuXG4gICAgaWYgKG1vZHVsZS50eXBlID09PSAnYmFja2VuZCcpIHtcbiAgICAgIHRoaXMubW9kdWxlcy5iYWNrZW5kID0gbW9kdWxlO1xuICAgIH1cblxuICAgIGlmIChtb2R1bGUudHlwZSA9PT0gJ2xvZ2dlcicgfHwgKG1vZHVsZS5sb2cgJiYgbW9kdWxlLndhcm4gJiYgbW9kdWxlLmVycm9yKSkge1xuICAgICAgdGhpcy5tb2R1bGVzLmxvZ2dlciA9IG1vZHVsZTtcbiAgICB9XG5cbiAgICBpZiAobW9kdWxlLnR5cGUgPT09ICdsYW5ndWFnZURldGVjdG9yJykge1xuICAgICAgdGhpcy5tb2R1bGVzLmxhbmd1YWdlRGV0ZWN0b3IgPSBtb2R1bGU7XG4gICAgfVxuXG4gICAgaWYgKG1vZHVsZS50eXBlID09PSAnaTE4bkZvcm1hdCcpIHtcbiAgICAgIHRoaXMubW9kdWxlcy5pMThuRm9ybWF0ID0gbW9kdWxlO1xuICAgIH1cblxuICAgIGlmIChtb2R1bGUudHlwZSA9PT0gJ3Bvc3RQcm9jZXNzb3InKSB7XG4gICAgICBwb3N0UHJvY2Vzc29yLmFkZFBvc3RQcm9jZXNzb3IobW9kdWxlKTtcbiAgICB9XG5cbiAgICBpZiAobW9kdWxlLnR5cGUgPT09ICczcmRQYXJ0eScpIHtcbiAgICAgIHRoaXMubW9kdWxlcy5leHRlcm5hbC5wdXNoKG1vZHVsZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjaGFuZ2VMYW5ndWFnZShsbmcsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5pc0xhbmd1YWdlQ2hhbmdpbmdUbyA9IGxuZztcbiAgICBjb25zdCBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdGhpcy5lbWl0KCdsYW5ndWFnZUNoYW5naW5nJywgbG5nKTtcblxuICAgIGNvbnN0IGRvbmUgPSAoZXJyLCBsKSA9PiB7XG4gICAgICBpZiAobCkge1xuICAgICAgICB0aGlzLmxhbmd1YWdlID0gbDtcbiAgICAgICAgdGhpcy5sYW5ndWFnZXMgPSB0aGlzLnNlcnZpY2VzLmxhbmd1YWdlVXRpbHMudG9SZXNvbHZlSGllcmFyY2h5KGwpO1xuICAgICAgICB0aGlzLnRyYW5zbGF0b3IuY2hhbmdlTGFuZ3VhZ2UobCk7XG4gICAgICAgIHRoaXMuaXNMYW5ndWFnZUNoYW5naW5nVG8gPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZW1pdCgnbGFuZ3VhZ2VDaGFuZ2VkJywgbCk7XG4gICAgICAgIHRoaXMubG9nZ2VyLmxvZygnbGFuZ3VhZ2VDaGFuZ2VkJywgbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmlzTGFuZ3VhZ2VDaGFuZ2luZ1RvID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKCguLi5hcmdzKSA9PiB0aGlzLnQoLi4uYXJncykpO1xuICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhlcnIsICguLi5hcmdzKSA9PiB0aGlzLnQoLi4uYXJncykpO1xuICAgIH07XG5cbiAgICBjb25zdCBzZXRMbmcgPSBsbmdzID0+IHtcbiAgICAgIC8vIGRlcGVuZGluZyBvbiBBUEkgaW4gZGV0ZWN0b3IgbG5nIGNhbiBiZSBhIHN0cmluZyAob2xkKSBvciBhbiBhcnJheSBvZiBsYW5ndWFnZXMgb3JkZXJlZCBpbiBwcmlvcml0eVxuICAgICAgY29uc3QgbCA9IHR5cGVvZiBsbmdzID09PSAnc3RyaW5nJyA/IGxuZ3MgOiB0aGlzLnNlcnZpY2VzLmxhbmd1YWdlVXRpbHMuZ2V0QmVzdE1hdGNoRnJvbUNvZGVzKGxuZ3MpO1xuXG4gICAgICBpZiAobCkge1xuICAgICAgICBpZiAoIXRoaXMubGFuZ3VhZ2UpIHtcbiAgICAgICAgICB0aGlzLmxhbmd1YWdlID0gbDtcbiAgICAgICAgICB0aGlzLmxhbmd1YWdlcyA9IHRoaXMuc2VydmljZXMubGFuZ3VhZ2VVdGlscy50b1Jlc29sdmVIaWVyYXJjaHkobCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLnRyYW5zbGF0b3IubGFuZ3VhZ2UpIHRoaXMudHJhbnNsYXRvci5jaGFuZ2VMYW5ndWFnZShsKTtcblxuICAgICAgICBpZiAodGhpcy5zZXJ2aWNlcy5sYW5ndWFnZURldGVjdG9yKSB0aGlzLnNlcnZpY2VzLmxhbmd1YWdlRGV0ZWN0b3IuY2FjaGVVc2VyTGFuZ3VhZ2UobCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubG9hZFJlc291cmNlcyhsLCBlcnIgPT4ge1xuICAgICAgICBkb25lKGVyciwgbCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgaWYgKCFsbmcgJiYgdGhpcy5zZXJ2aWNlcy5sYW5ndWFnZURldGVjdG9yICYmICF0aGlzLnNlcnZpY2VzLmxhbmd1YWdlRGV0ZWN0b3IuYXN5bmMpIHtcbiAgICAgIHNldExuZyh0aGlzLnNlcnZpY2VzLmxhbmd1YWdlRGV0ZWN0b3IuZGV0ZWN0KCkpO1xuICAgIH0gZWxzZSBpZiAoIWxuZyAmJiB0aGlzLnNlcnZpY2VzLmxhbmd1YWdlRGV0ZWN0b3IgJiYgdGhpcy5zZXJ2aWNlcy5sYW5ndWFnZURldGVjdG9yLmFzeW5jKSB7XG4gICAgICB0aGlzLnNlcnZpY2VzLmxhbmd1YWdlRGV0ZWN0b3IuZGV0ZWN0KHNldExuZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldExuZyhsbmcpO1xuICAgIH1cblxuICAgIHJldHVybiBkZWZlcnJlZDtcbiAgfVxuXG4gIGdldEZpeGVkVChsbmcsIG5zKSB7XG4gICAgY29uc3QgZml4ZWRUID0gKGtleSwgb3B0cywgLi4ucmVzdCkgPT4ge1xuICAgICAgbGV0IG9wdGlvbnM7XG4gICAgICBpZiAodHlwZW9mIG9wdHMgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMub3ZlcmxvYWRUcmFuc2xhdGlvbk9wdGlvbkhhbmRsZXIoW2tleSwgb3B0c10uY29uY2F0KHJlc3QpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wdGlvbnMgPSB7IC4uLm9wdHMgfTtcbiAgICAgIH1cblxuICAgICAgb3B0aW9ucy5sbmcgPSBvcHRpb25zLmxuZyB8fCBmaXhlZFQubG5nO1xuICAgICAgb3B0aW9ucy5sbmdzID0gb3B0aW9ucy5sbmdzIHx8IGZpeGVkVC5sbmdzO1xuICAgICAgb3B0aW9ucy5ucyA9IG9wdGlvbnMubnMgfHwgZml4ZWRULm5zO1xuICAgICAgcmV0dXJuIHRoaXMudChrZXksIG9wdGlvbnMpO1xuICAgIH07XG4gICAgaWYgKHR5cGVvZiBsbmcgPT09ICdzdHJpbmcnKSB7XG4gICAgICBmaXhlZFQubG5nID0gbG5nO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaXhlZFQubG5ncyA9IGxuZztcbiAgICB9XG4gICAgZml4ZWRULm5zID0gbnM7XG4gICAgcmV0dXJuIGZpeGVkVDtcbiAgfVxuXG4gIHQoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnRyYW5zbGF0b3IgJiYgdGhpcy50cmFuc2xhdG9yLnRyYW5zbGF0ZSguLi5hcmdzKTtcbiAgfVxuXG4gIGV4aXN0cyguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNsYXRvciAmJiB0aGlzLnRyYW5zbGF0b3IuZXhpc3RzKC4uLmFyZ3MpO1xuICB9XG5cbiAgc2V0RGVmYXVsdE5hbWVzcGFjZShucykge1xuICAgIHRoaXMub3B0aW9ucy5kZWZhdWx0TlMgPSBucztcbiAgfVxuXG4gIGhhc0xvYWRlZE5hbWVzcGFjZShucywgb3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKCF0aGlzLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIHRoaXMubG9nZ2VyLndhcm4oJ2hhc0xvYWRlZE5hbWVzcGFjZTogaTE4bmV4dCB3YXMgbm90IGluaXRpYWxpemVkJywgdGhpcy5sYW5ndWFnZXMpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIXRoaXMubGFuZ3VhZ2VzIHx8ICF0aGlzLmxhbmd1YWdlcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMubG9nZ2VyLndhcm4oJ2hhc0xvYWRlZE5hbWVzcGFjZTogaTE4bi5sYW5ndWFnZXMgd2VyZSB1bmRlZmluZWQgb3IgZW1wdHknLCB0aGlzLmxhbmd1YWdlcyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgbG5nID0gdGhpcy5sYW5ndWFnZXNbMF07XG4gICAgY29uc3QgZmFsbGJhY2tMbmcgPSB0aGlzLm9wdGlvbnMgPyB0aGlzLm9wdGlvbnMuZmFsbGJhY2tMbmcgOiBmYWxzZTtcbiAgICBjb25zdCBsYXN0TG5nID0gdGhpcy5sYW5ndWFnZXNbdGhpcy5sYW5ndWFnZXMubGVuZ3RoIC0gMV07XG5cbiAgICAvLyB3ZSdyZSBpbiBjaW1vZGUgc28gdGhpcyBzaGFsbCBwYXNzXG4gICAgaWYgKGxuZy50b0xvd2VyQ2FzZSgpID09PSAnY2ltb2RlJykgcmV0dXJuIHRydWU7XG5cbiAgICBjb25zdCBsb2FkTm90UGVuZGluZyA9IChsLCBuKSA9PiB7XG4gICAgICBjb25zdCBsb2FkU3RhdGUgPSB0aGlzLnNlcnZpY2VzLmJhY2tlbmRDb25uZWN0b3Iuc3RhdGVbYCR7bH18JHtufWBdO1xuICAgICAgcmV0dXJuIGxvYWRTdGF0ZSA9PT0gLTEgfHwgbG9hZFN0YXRlID09PSAyO1xuICAgIH07XG5cbiAgICAvLyBvcHRpb25hbCBpbmplY3RlZCBjaGVja1xuICAgIGlmIChvcHRpb25zLnByZWNoZWNrKSB7XG4gICAgICBjb25zdCBwcmVSZXN1bHQgPSBvcHRpb25zLnByZWNoZWNrKHRoaXMsIGxvYWROb3RQZW5kaW5nKTtcbiAgICAgIGlmIChwcmVSZXN1bHQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByZVJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBsb2FkZWQgLT4gU1VDQ0VTU1xuICAgIGlmICh0aGlzLmhhc1Jlc291cmNlQnVuZGxlKGxuZywgbnMpKSByZXR1cm4gdHJ1ZTtcblxuICAgIC8vIHdlcmUgbm90IGxvYWRpbmcgYXQgYWxsIC0+IFNFTUkgU1VDQ0VTU1xuICAgIGlmICghdGhpcy5zZXJ2aWNlcy5iYWNrZW5kQ29ubmVjdG9yLmJhY2tlbmQpIHJldHVybiB0cnVlO1xuXG4gICAgLy8gZmFpbGVkIGxvYWRpbmcgbnMgLSBidXQgYXQgbGVhc3QgZmFsbGJhY2sgaXMgbm90IHBlbmRpbmcgLT4gU0VNSSBTVUNDRVNTXG4gICAgaWYgKGxvYWROb3RQZW5kaW5nKGxuZywgbnMpICYmICghZmFsbGJhY2tMbmcgfHwgbG9hZE5vdFBlbmRpbmcobGFzdExuZywgbnMpKSkgcmV0dXJuIHRydWU7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBsb2FkTmFtZXNwYWNlcyhucywgY2FsbGJhY2spIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IGRlZmVyKCk7XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5ucykge1xuICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBucyA9PT0gJ3N0cmluZycpIG5zID0gW25zXTtcblxuICAgIG5zLmZvckVhY2gobiA9PiB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLm5zLmluZGV4T2YobikgPCAwKSB0aGlzLm9wdGlvbnMubnMucHVzaChuKTtcbiAgICB9KTtcblxuICAgIHRoaXMubG9hZFJlc291cmNlcyhlcnIgPT4ge1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhlcnIpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkO1xuICB9XG5cbiAgbG9hZExhbmd1YWdlcyhsbmdzLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gZGVmZXIoKTtcblxuICAgIGlmICh0eXBlb2YgbG5ncyA9PT0gJ3N0cmluZycpIGxuZ3MgPSBbbG5nc107XG4gICAgY29uc3QgcHJlbG9hZGVkID0gdGhpcy5vcHRpb25zLnByZWxvYWQgfHwgW107XG5cbiAgICBjb25zdCBuZXdMbmdzID0gbG5ncy5maWx0ZXIobG5nID0+IHByZWxvYWRlZC5pbmRleE9mKGxuZykgPCAwKTtcbiAgICAvLyBFeGl0IGVhcmx5IGlmIGFsbCBnaXZlbiBsYW5ndWFnZXMgYXJlIGFscmVhZHkgcHJlbG9hZGVkXG4gICAgaWYgKCFuZXdMbmdzLmxlbmd0aCkge1xuICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjaygpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucy5wcmVsb2FkID0gcHJlbG9hZGVkLmNvbmNhdChuZXdMbmdzKTtcbiAgICB0aGlzLmxvYWRSZXNvdXJjZXMoZXJyID0+IHtcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZXJyKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBkZWZlcnJlZDtcbiAgfVxuXG4gIGRpcihsbmcpIHtcbiAgICBpZiAoIWxuZykgbG5nID0gdGhpcy5sYW5ndWFnZXMgJiYgdGhpcy5sYW5ndWFnZXMubGVuZ3RoID4gMCA/IHRoaXMubGFuZ3VhZ2VzWzBdIDogdGhpcy5sYW5ndWFnZTtcbiAgICBpZiAoIWxuZykgcmV0dXJuICdydGwnO1xuXG4gICAgY29uc3QgcnRsTG5ncyA9IFtcbiAgICAgICdhcicsXG4gICAgICAnc2h1JyxcbiAgICAgICdzcXInLFxuICAgICAgJ3NzaCcsXG4gICAgICAneGFhJyxcbiAgICAgICd5aGQnLFxuICAgICAgJ3l1ZCcsXG4gICAgICAnYWFvJyxcbiAgICAgICdhYmgnLFxuICAgICAgJ2FidicsXG4gICAgICAnYWNtJyxcbiAgICAgICdhY3EnLFxuICAgICAgJ2FjdycsXG4gICAgICAnYWN4JyxcbiAgICAgICdhY3knLFxuICAgICAgJ2FkZicsXG4gICAgICAnYWRzJyxcbiAgICAgICdhZWInLFxuICAgICAgJ2FlYycsXG4gICAgICAnYWZiJyxcbiAgICAgICdhanAnLFxuICAgICAgJ2FwYycsXG4gICAgICAnYXBkJyxcbiAgICAgICdhcmInLFxuICAgICAgJ2FycScsXG4gICAgICAnYXJzJyxcbiAgICAgICdhcnknLFxuICAgICAgJ2FyeicsXG4gICAgICAnYXV6JyxcbiAgICAgICdhdmwnLFxuICAgICAgJ2F5aCcsXG4gICAgICAnYXlsJyxcbiAgICAgICdheW4nLFxuICAgICAgJ2F5cCcsXG4gICAgICAnYmJ6JyxcbiAgICAgICdwZ2EnLFxuICAgICAgJ2hlJyxcbiAgICAgICdpdycsXG4gICAgICAncHMnLFxuICAgICAgJ3BidCcsXG4gICAgICAncGJ1JyxcbiAgICAgICdwc3QnLFxuICAgICAgJ3BycCcsXG4gICAgICAncHJkJyxcbiAgICAgICd1ZycsXG4gICAgICAndXInLFxuICAgICAgJ3lkZCcsXG4gICAgICAneWRzJyxcbiAgICAgICd5aWgnLFxuICAgICAgJ2ppJyxcbiAgICAgICd5aScsXG4gICAgICAnaGJvJyxcbiAgICAgICdtZW4nLFxuICAgICAgJ3htbicsXG4gICAgICAnZmEnLFxuICAgICAgJ2pwcicsXG4gICAgICAncGVvJyxcbiAgICAgICdwZXMnLFxuICAgICAgJ3BycycsXG4gICAgICAnZHYnLFxuICAgICAgJ3NhbScsXG4gICAgXTtcblxuICAgIHJldHVybiBydGxMbmdzLmluZGV4T2YodGhpcy5zZXJ2aWNlcy5sYW5ndWFnZVV0aWxzLmdldExhbmd1YWdlUGFydEZyb21Db2RlKGxuZykpID49IDBcbiAgICAgID8gJ3J0bCdcbiAgICAgIDogJ2x0cic7XG4gIH1cblxuICAvKiBlc2xpbnQgY2xhc3MtbWV0aG9kcy11c2UtdGhpczogMCAqL1xuICBjcmVhdGVJbnN0YW5jZShvcHRpb25zID0ge30sIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBJMThuKG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGNsb25lSW5zdGFuY2Uob3B0aW9ucyA9IHt9LCBjYWxsYmFjayA9IG5vb3ApIHtcbiAgICBjb25zdCBtZXJnZWRPcHRpb25zID0geyAuLi50aGlzLm9wdGlvbnMsIC4uLm9wdGlvbnMsIC4uLnsgaXNDbG9uZTogdHJ1ZSB9IH07XG4gICAgY29uc3QgY2xvbmUgPSBuZXcgSTE4bihtZXJnZWRPcHRpb25zKTtcbiAgICBjb25zdCBtZW1iZXJzVG9Db3B5ID0gWydzdG9yZScsICdzZXJ2aWNlcycsICdsYW5ndWFnZSddO1xuICAgIG1lbWJlcnNUb0NvcHkuZm9yRWFjaChtID0+IHtcbiAgICAgIGNsb25lW21dID0gdGhpc1ttXTtcbiAgICB9KTtcbiAgICBjbG9uZS5zZXJ2aWNlcyA9IHsgLi4udGhpcy5zZXJ2aWNlcyB9O1xuICAgIGNsb25lLnNlcnZpY2VzLnV0aWxzID0ge1xuICAgICAgaGFzTG9hZGVkTmFtZXNwYWNlOiBjbG9uZS5oYXNMb2FkZWROYW1lc3BhY2UuYmluZChjbG9uZSlcbiAgICB9O1xuICAgIGNsb25lLnRyYW5zbGF0b3IgPSBuZXcgVHJhbnNsYXRvcihjbG9uZS5zZXJ2aWNlcywgY2xvbmUub3B0aW9ucyk7XG4gICAgY2xvbmUudHJhbnNsYXRvci5vbignKicsIChldmVudCwgLi4uYXJncykgPT4ge1xuICAgICAgY2xvbmUuZW1pdChldmVudCwgLi4uYXJncyk7XG4gICAgfSk7XG4gICAgY2xvbmUuaW5pdChtZXJnZWRPcHRpb25zLCBjYWxsYmFjayk7XG4gICAgY2xvbmUudHJhbnNsYXRvci5vcHRpb25zID0gY2xvbmUub3B0aW9uczsgLy8gc3luYyBvcHRpb25zXG4gICAgY2xvbmUudHJhbnNsYXRvci5iYWNrZW5kQ29ubmVjdG9yLnNlcnZpY2VzLnV0aWxzID0ge1xuICAgICAgaGFzTG9hZGVkTmFtZXNwYWNlOiBjbG9uZS5oYXNMb2FkZWROYW1lc3BhY2UuYmluZChjbG9uZSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBJMThuKCk7XG4iLCIvKiBlc2xpbnQtZGlzYWJsZVxuICAgIEB0eXBlc2NyaXB0LWVzbGludC9uby1uYW1lc3BhY2VcbiAqL1xuXG5pbXBvcnQge1xuICAgIGRlZmF1bHQgYXMgaTE4bmV4dCxcbiAgICBpMThuIGFzIGkxOG5leHRJbnN0YW5jZSxcbiAgICBGYWxsYmFja0xuZ09iakxpc3QgYXMgaTE4bmV4dEZhbGxiYWNrTG5nT2JqTGlzdCxcbiAgICBGYWxsYmFja0xuZyBhcyBpMThuZXh0RmFsbGJhY2tMbmcsXG4gICAgRm9ybWF0RnVuY3Rpb24gYXMgaTE4bmV4dEZvcm1hdEZ1bmN0aW9uLFxuICAgIEludGVycG9sYXRpb25PcHRpb25zIGFzIGkxOG5leHRJbnRlcnBvbGF0aW9uT3B0aW9ucyxcbiAgICBSZWFjdE9wdGlvbnMgYXMgaTE4bmV4dFJlYWN0T3B0aW9ucyxcbiAgICBJbml0T3B0aW9ucyBhcyBpMThuZXh0SW5pdE9wdGlvbnMsXG4gICAgVE9wdGlvbnNCYXNlIGFzIGkxOG5leHRUT3B0aW9uc0Jhc2UsXG4gICAgU3RyaW5nTWFwIGFzIGkxOG5leHRTdHJpbmdNYXAsXG4gICAgVE9wdGlvbnMgYXMgaTE4bmV4dFRPcHRpb25zLFxuICAgIENhbGxiYWNrIGFzIGkxOG5leHRDYWxsYmFjayxcbiAgICBFeGlzdHNGdW5jdGlvbiBhcyBpMThuZXh0RXhpc3RzRnVuY3Rpb24sXG4gICAgV2l0aFQgYXMgaTE4bmV4dFdpdGhULFxuICAgIFRGdW5jdGlvblJlc3VsdCBhcyBpMThuZXh0VEZ1bmN0aW9uUmVzdWx0LFxuICAgIFRGdW5jdGlvbktleXMgYXMgaTE4bmV4dFRGdW5jdGlvbktleXMsXG4gICAgVEZ1bmN0aW9uIGFzIGkxOG5leHRURnVuY3Rpb24sXG4gICAgUmVzb3VyY2UgYXMgaTE4bmV4dFJlc291cmNlLFxuICAgIFJlc291cmNlTGFuZ3VhZ2UgYXMgaTE4bmV4dFJlc291cmNlTGFuZ3VhZ2UsXG4gICAgUmVzb3VyY2VLZXkgYXMgaTE4bmV4dFJlc291cmNlS2V5LFxuICAgIEludGVycG9sYXRvciBhcyBpMThuZXh0SW50ZXJwb2xhdG9yLFxuICAgIFJlc291cmNlU3RvcmUgYXMgaTE4bmV4dFJlc291cmNlU3RvcmUsXG4gICAgU2VydmljZXMgYXMgaTE4bmV4dFNlcnZpY2VzLFxuICAgIE1vZHVsZSBhcyBpMThuZXh0TW9kdWxlLFxuICAgIENhbGxiYWNrRXJyb3IgYXMgaTE4bmV4dENhbGxiYWNrRXJyb3IsXG4gICAgUmVhZENhbGxiYWNrIGFzIGkxOG5leHRSZWFkQ2FsbGJhY2ssXG4gICAgTXVsdGlSZWFkQ2FsbGJhY2sgYXMgaTE4bmV4dE11bHRpUmVhZENhbGxiYWNrLFxuICAgIEJhY2tlbmRNb2R1bGUgYXMgaTE4bmV4dEJhY2tlbmRNb2R1bGUsXG4gICAgTGFuZ3VhZ2VEZXRlY3Rvck1vZHVsZSBhcyBpMThuZXh0TGFuZ3VhZ2VEZXRlY3Rvck1vZHVsZSxcbiAgICBMYW5ndWFnZURldGVjdG9yQXN5bmNNb2R1bGUgYXMgaTE4bmV4dExhbmd1YWdlRGV0ZWN0b3JBc3luY01vZHVsZSxcbiAgICBQb3N0UHJvY2Vzc29yTW9kdWxlIGFzIGkxOG5leHRQb3N0UHJvY2Vzc29yTW9kdWxlLFxuICAgIExvZ2dlck1vZHVsZSBhcyBpMThuZXh0TG9nZ2VyTW9kdWxlLFxuICAgIEkxOG5Gb3JtYXRNb2R1bGUgYXMgaTE4bmV4dEkxOG5Gb3JtYXRNb2R1bGUsXG4gICAgVGhpcmRQYXJ0eU1vZHVsZSBhcyBpMThuZXh0VGhpcmRQYXJ0eU1vZHVsZSxcbiAgICBNb2R1bGVzIGFzIGkxOG5leHRNb2R1bGVzLFxuICAgIE5ld2FibGUgYXMgaTE4bmV4dE5ld2FibGUsXG59IGZyb20gJ2kxOG5leHQnO1xuXG5jb25zdCBpMThuOiBpMThuLmkxOG4gPSBpMThuZXh0O1xuXG5kZWNsYXJlIG5hbWVzcGFjZSBpMThuIHtcbiAgICBleHBvcnQgdHlwZSBpMThuID0gaTE4bmV4dEluc3RhbmNlO1xuICAgIGV4cG9ydCB0eXBlIEZhbGxiYWNrTG5nT2JqTGlzdCA9IGkxOG5leHRGYWxsYmFja0xuZ09iakxpc3Q7XG4gICAgZXhwb3J0IHR5cGUgRmFsbGJhY2tMbmcgPSBpMThuZXh0RmFsbGJhY2tMbmc7XG4gICAgZXhwb3J0IHR5cGUgRm9ybWF0RnVuY3Rpb24gPSBpMThuZXh0Rm9ybWF0RnVuY3Rpb247XG4gICAgZXhwb3J0IHR5cGUgSW50ZXJwb2xhdGlvbk9wdGlvbnMgPSBpMThuZXh0SW50ZXJwb2xhdGlvbk9wdGlvbnM7XG4gICAgZXhwb3J0IHR5cGUgUmVhY3RPcHRpb25zID0gaTE4bmV4dFJlYWN0T3B0aW9ucztcbiAgICBleHBvcnQgdHlwZSBJbml0T3B0aW9ucyA9IGkxOG5leHRJbml0T3B0aW9ucztcbiAgICBleHBvcnQgdHlwZSBUT3B0aW9uc0Jhc2UgPSBpMThuZXh0VE9wdGlvbnNCYXNlO1xuICAgIGV4cG9ydCB0eXBlIFN0cmluZ01hcCA9IGkxOG5leHRTdHJpbmdNYXA7XG4gICAgZXhwb3J0IHR5cGUgVE9wdGlvbnM8VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0gU3RyaW5nTWFwPiA9IGkxOG5leHRUT3B0aW9uczxUPjtcbiAgICBleHBvcnQgdHlwZSBDYWxsYmFjayA9IGkxOG5leHRDYWxsYmFjaztcbiAgICBleHBvcnQgdHlwZSBFeGlzdHNGdW5jdGlvbjxLIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nLCBUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSBTdHJpbmdNYXA+ID0gaTE4bmV4dEV4aXN0c0Z1bmN0aW9uPEssIFQ+O1xuICAgIGV4cG9ydCB0eXBlIFdpdGhUID0gaTE4bmV4dFdpdGhUO1xuICAgIGV4cG9ydCB0eXBlIFRGdW5jdGlvblJlc3VsdCA9IGkxOG5leHRURnVuY3Rpb25SZXN1bHQ7XG4gICAgZXhwb3J0IHR5cGUgVEZ1bmN0aW9uS2V5cyA9IGkxOG5leHRURnVuY3Rpb25LZXlzO1xuICAgIGV4cG9ydCB0eXBlIFRGdW5jdGlvbiA9IGkxOG5leHRURnVuY3Rpb247XG4gICAgZXhwb3J0IHR5cGUgUmVzb3VyY2UgPSBpMThuZXh0UmVzb3VyY2U7XG4gICAgZXhwb3J0IHR5cGUgUmVzb3VyY2VMYW5ndWFnZSA9IGkxOG5leHRSZXNvdXJjZUxhbmd1YWdlO1xuICAgIGV4cG9ydCB0eXBlIFJlc291cmNlS2V5ID0gaTE4bmV4dFJlc291cmNlS2V5O1xuICAgIGV4cG9ydCB0eXBlIEludGVycG9sYXRvciA9IGkxOG5leHRJbnRlcnBvbGF0b3I7XG4gICAgZXhwb3J0IHR5cGUgUmVzb3VyY2VTdG9yZSA9IGkxOG5leHRSZXNvdXJjZVN0b3JlO1xuICAgIGV4cG9ydCB0eXBlIFNlcnZpY2VzID0gaTE4bmV4dFNlcnZpY2VzO1xuICAgIGV4cG9ydCB0eXBlIE1vZHVsZSA9IGkxOG5leHRNb2R1bGU7XG4gICAgZXhwb3J0IHR5cGUgQ2FsbGJhY2tFcnJvciA9IGkxOG5leHRDYWxsYmFja0Vycm9yO1xuICAgIGV4cG9ydCB0eXBlIFJlYWRDYWxsYmFjayA9IGkxOG5leHRSZWFkQ2FsbGJhY2s7XG4gICAgZXhwb3J0IHR5cGUgTXVsdGlSZWFkQ2FsbGJhY2sgPSBpMThuZXh0TXVsdGlSZWFkQ2FsbGJhY2s7XG4gICAgZXhwb3J0IHR5cGUgQmFja2VuZE1vZHVsZTxUID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj4+ID0gaTE4bmV4dEJhY2tlbmRNb2R1bGU8VD47XG4gICAgZXhwb3J0IHR5cGUgTGFuZ3VhZ2VEZXRlY3Rvck1vZHVsZSA9IGkxOG5leHRMYW5ndWFnZURldGVjdG9yTW9kdWxlO1xuICAgIGV4cG9ydCB0eXBlIExhbmd1YWdlRGV0ZWN0b3JBc3luY01vZHVsZSA9IGkxOG5leHRMYW5ndWFnZURldGVjdG9yQXN5bmNNb2R1bGU7XG4gICAgZXhwb3J0IHR5cGUgUG9zdFByb2Nlc3Nvck1vZHVsZSA9IGkxOG5leHRQb3N0UHJvY2Vzc29yTW9kdWxlO1xuICAgIGV4cG9ydCB0eXBlIExvZ2dlck1vZHVsZSA9IGkxOG5leHRMb2dnZXJNb2R1bGU7XG4gICAgZXhwb3J0IHR5cGUgSTE4bkZvcm1hdE1vZHVsZSA9IGkxOG5leHRJMThuRm9ybWF0TW9kdWxlO1xuICAgIGV4cG9ydCB0eXBlIFRoaXJkUGFydHlNb2R1bGUgPSBpMThuZXh0VGhpcmRQYXJ0eU1vZHVsZTtcbiAgICBleHBvcnQgdHlwZSBNb2R1bGVzID0gaTE4bmV4dE1vZHVsZXM7XG4gICAgZXhwb3J0IHR5cGUgTmV3YWJsZTxUPiA9IGkxOG5leHROZXdhYmxlPFQ+O1xufVxuXG5leHBvcnQgeyBpMThuIH07XG4iXSwibmFtZXMiOlsidXRpbHMuZ2V0UGF0aCIsInV0aWxzLnNldFBhdGgiLCJ1dGlscy5kZWVwRXh0ZW5kIiwidXRpbHMuY29weSIsInV0aWxzLmVzY2FwZSIsInV0aWxzLnJlZ2V4RXNjYXBlIiwidXRpbHMuZ2V0UGF0aFdpdGhEZWZhdWx0cyIsInV0aWxzLm1ha2VTdHJpbmciLCJ1dGlscy5wdXNoUGF0aCIsImdldERlZmF1bHRzIiwiTGFuZ3VhZ2VVdGlscyIsIkJhY2tlbmRDb25uZWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0VBQUEsTUFBTSxhQUFhLEdBQUc7RUFDdEIsRUFBRSxJQUFJLEVBQUUsUUFBUTtBQUNoQjtFQUNBLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRTtFQUNaLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDN0IsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFO0VBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztFQUM5QixHQUFHO0FBQ0g7RUFDQSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUU7RUFDZCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQy9CLEdBQUc7QUFDSDtFQUNBLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7RUFDckI7RUFDQSxJQUFJLElBQUksT0FB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SSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJO0VBQzVFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLO0VBQ3RFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNyRjtFQUNBLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSTtFQUNsRixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNwRTtFQUNBLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzVFO0VBQ0EsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtFQUMvQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtFQUMzQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtFQUM1QyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtFQUN4QyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7RUFDcEMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0VBQzVDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0VBQzFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtFQUNyQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7RUFDckMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7RUFDekMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtFQUN4QyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0VBQ3ZDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtFQUNyQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0VBQ3hDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0VBQzNDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtFQUNwQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0VBQ3hDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0VBQ3pDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtFQUNoRCxFQUFDO0FBQ0Q7RUFDQSxJQUFJLGtCQUFrQixHQUFHO0VBQ3pCLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDeEMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUN6QyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7RUFDNUIsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNuSCxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNqSCxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDdEUsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ25HLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3hGLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDekMsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0VBQ2pGLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUN6RyxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUN4RCxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzNDLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUM5RSxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3pHLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDOUUsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3hFLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMzRCxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNuSCxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzFGLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUMvRixFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFH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QyxDQUFDO0VBQ3ZDLEdBQUc7QUFDSDtFQUNBLEVBQUUsYUFBYSxDQUFDLE9BQU8sR0FBRyxFQUFFLEVBQUUsUUFBUSxHQUFHLElBQUksRUFBRTtFQUMvQyxJQUFJLE1BQU0sYUFBYSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsT0FBTyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztFQUNoRixJQUFJLE1BQU0sS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0VBQzFDLElBQUksTUFBTSxhQUFhLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0VBQzVELElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUk7RUFDL0IsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3pCLEtBQUssQ0FBQyxDQUFDO0VBQ1AsSUFBSSxLQUFLLENBQUMsUUFBUSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7RUFDMUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRztFQUMzQixNQUFNLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0VBQzlELEtBQUssQ0FBQztFQUNOLElBQUksS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztFQUNyRSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUksS0FBSztFQUNqRCxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7RUFDakMsS0FBSyxDQUFDLENBQUM7RUFDUCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0VBQ3hDLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztFQUM3QyxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRztFQUN2RCxNQUFNLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0VBQzlELEtBQUssQ0FBQztBQUNOO0VBQ0EsSUFBSSxPQUFPLEtBQUssQ0FBQztFQUNqQixHQUFHO0VBQ0gsQ0FBQztBQUNEO0FBQ0Esa0JBQWUsSUFBSSxJQUFJLEVBQUU7O0VDbmhCekI7OztRQTJDTSxJQUFJLEdBQWM7Ozs7OzsiLCJzb3VyY2VSb290IjoiY2RwOi8vL0BjZHAvZXh0ZW5zaW9uLWkxOG4vIn0=
