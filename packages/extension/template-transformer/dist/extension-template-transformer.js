/*!
 * @cdp/extension-template-transformer 0.9.5
 *   extension for transform to HTML templates from mustache.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.CDP = global.CDP || {}, global.CDP.Exension = global.CDP.Exension || {})));
}(this, (function (exports) { 'use strict';

  /** 
   * @param {object} config = {
   *  html: lit-html.html,
   *  delimiter: { start: '{{', end: '}}' },
   *  transformers: { // note that transformVariable is not here. It gets applied when no transformer.test has passed
   *    name: {
   *      test: (str, config) => bool,
   *      transform: (str, config) => ({
   *        remainingTmplStr: str,
   *        insertionPoint: ctx => lit-html.TemplateResult | undefined, // if undefined remainingTmplStr will be merged with last static part 
   *      }),
   *    },
   *  },
   *  transformVariable, 
   * }
   * @returns {function} strTemplate => ctx => lit-html.TemplateResult
   */
  const createCustom = config => strTemplate => transform(strTemplate, config);

  function transform(tmpl2Parse, config) {
    const staticParts = [];
    const insertionPoints = [];

    let remainingTmplStr = tmpl2Parse;
    let startIndexOfIP = remainingTmplStr.indexOf(config.delimiter.start);
    while (startIndexOfIP >= 0) {
      if (remainingTmplStr.indexOf(config.delimiter.end, startIndexOfIP) < 0)
        throw new Error(`missing end delimiter at: '${remainingTmplStr}'`)

      staticParts.push(remainingTmplStr.substring(0, startIndexOfIP));

      const iPTransformResult = transformIP(
        remainingTmplStr.substring(startIndexOfIP + config.delimiter.start.length),
        config
      );

      if (iPTransformResult.insertionPoint) {
        remainingTmplStr = iPTransformResult.remainingTmplStr;
        insertionPoints.push(iPTransformResult.insertionPoint);
        startIndexOfIP = remainingTmplStr.indexOf(config.delimiter.start);
      } else { // e.g. comment or customDelimeter
        const lastStaticPart = staticParts.pop();
        remainingTmplStr = lastStaticPart + iPTransformResult.remainingTmplStr;
        startIndexOfIP = remainingTmplStr.indexOf(config.delimiter.start, lastStaticPart.length);
      }
    }

    staticParts.push(remainingTmplStr);

    return ctx =>
      config.html(staticParts, ...insertionPoints.map(iP => iP(ctx)))
  }

  function transformIP(remainingTmplStr, config) {
    const transformer = Object.values(config.transformers).find(t => t.test(remainingTmplStr, config));
    const transformFunction = transformer
      ? transformer.transform
      : config.transformVariable;
    return transformFunction(remainingTmplStr, config)
  }

  function ctx2Value(ctx, key) {
    if (key === '.')
      return ctx

    let result = ctx;
    for (let k of key.split('.')) {
      if (!result.hasOwnProperty(k))
        return ''

      result = result[k];
    }

    return result
  }

  function ctx2MustacheString(ctx, key) {
    return mustacheStringyfy(ctx2Value(ctx, key))
  }

  function mustacheStringyfy(value) {
    if (value === undefined || value === null)
      return ''

    return '' + value
  }

  const variable = (remainingTmplStr, { delimiter }) => {
    const indexOfEndDelimiter = remainingTmplStr.indexOf(delimiter.end);
    const dataKey = remainingTmplStr.substring(0, indexOfEndDelimiter);
    return {
      remainingTmplStr: remainingTmplStr.substring(indexOfEndDelimiter + delimiter.end.length),
      insertionPoint: ctx => ctx2MustacheString(ctx, dataKey)
    }
  };

  /** Note, this is unsafe to use, because the rendered output could be any JavaScript! */
  const unsafeVariable = unsafeHTML => ({
    test: remainingTmplStr => remainingTmplStr[0] === '{',
    transform: (remainingTmplStr, { delimiter }) => {
      const indexOfEndDelimiter = remainingTmplStr.indexOf('}' + delimiter.end);
      if (indexOfEndDelimiter < 0)
        throw new Error(`missing end delimiter at: '${delimiter.start}${remainingTmplStr}'`)
    
      const dataKey = remainingTmplStr.substring(1, indexOfEndDelimiter);
      return {
        remainingTmplStr: remainingTmplStr.substring(indexOfEndDelimiter + 1 + delimiter.end.length),
        insertionPoint: ctx => unsafeHTML(ctx2MustacheString(ctx, dataKey)),
      }
    }
  });

  function isMustacheFalsy(value) {
    return [null, undefined, false, 0, NaN, '']
      .some(falsy => falsy === value)
      || (value.length && value.length === 0)
  }

  function parseSection(tmplStr, delimiter) {
    const indexOfStartTagEnd = tmplStr.indexOf(delimiter.end);
    const dataKey = tmplStr.substring(1, indexOfStartTagEnd);
    const endTag = `${delimiter.start}/${dataKey}${delimiter.end}`;
    const indexOfEndTagStart = tmplStr.indexOf(endTag);
    if (indexOfEndTagStart < 0)
      throw new Error(`missing end delimiter at: '${delimiter.start}${tmplStr}'`)
    
    return {
      dataKey,
      innerTmpl: tmplStr.substring(indexOfStartTagEnd + delimiter.start.length, indexOfEndTagStart),
      remainingTmplStr: tmplStr.substring(indexOfEndTagStart + endTag.length),
    }
  }

  /** Note, unlike within mustache functions as data values are not supported out of the box */
  const section = () => ({
    test: remainingTmplStr => remainingTmplStr[0] === '#',
    transform: (remainingTmplStr, config) => {
      const parsedSection = parseSection(remainingTmplStr, config.delimiter);
      const transformedInnerTmpl = transform(parsedSection.innerTmpl, config);
      
      return {
        remainingTmplStr: parsedSection.remainingTmplStr,
        insertionPoint: ctx => {
          const sectionData = ctx2Value(ctx, parsedSection.dataKey);
          
          if (isMustacheFalsy(sectionData))
            return '';

          return sectionData.map
            ? sectionData.map(innerCtx => transformedInnerTmpl(innerCtx))
            : transformedInnerTmpl(ctx)
        }
      }
    }
  });

  const invertedSection = () => ({
    test: remainingTmplStr => remainingTmplStr[0] === '^',
    transform: (remainingTmplStr, { delimiter }) => {
      const parsedSection = parseSection(remainingTmplStr, delimiter);

      return {
        remainingTmplStr: parsedSection.remainingTmplStr,
        insertionPoint: ctx =>
          isMustacheFalsy(ctx2Value(ctx, parsedSection.dataKey))
            ? parsedSection.innerTmpl
            : '',
      }
    }
  });

  const comment = () => ({
    test: remainingTmplStr => remainingTmplStr[0] === '!',
    transform: (remainingTmplStr, { delimiter }) => ({
      remainingTmplStr: remainingTmplStr.substring(remainingTmplStr.indexOf(delimiter.end) + delimiter.end.length),
      insertionPoint: undefined,
    })
  });

  const customDelimiter = () => ({
    test: remainingTmplStr => remainingTmplStr[0] === '=',
    transform: (remainingTmplStr, config) => {
      const originalEndDeliLength = config.delimiter.end.length;
      const indexOfEndTag = remainingTmplStr.indexOf('=' + config.delimiter.end);
      if (indexOfEndTag < 0 )
        throw new Error(`missing end delimiter at: '${remainingTmplStr}'`)

      const [ newStartDeli, newEndDeli ] = remainingTmplStr.substring(1, indexOfEndTag).split(' ');

      config.delimiter.start = newStartDeli;
      config.delimiter.end = newEndDeli;
      
      return {
        remainingTmplStr: remainingTmplStr.substring(indexOfEndTag + 1 + originalEndDeliLength),
        insertionPoint: undefined,  
      }
    }
  });

  const createDefault = (html, unsafeHTML) =>
    createCustom({
      html,
      delimiter: { start: '{{', end: '}}' },
      transformVariable: variable,
      transformers: {
        unsafeVariable: unsafeVariable(unsafeHTML),
        section: section(),
        invertedSection: invertedSection(),
        comment: comment(),
        customDelimiterTransformer: customDelimiter(),
      },
    });

  function createTransformFactory(arg1, arg2) {
      if ('function' === typeof arg1) {
          return createDefault(arg1, arg2);
      }
      else {
          return createCustom(Object.assign({
              delimiter: { start: '{{', end: '}}' },
              transformers: {},
          }, arg1));
      }
  }
  const transformer = {
      variable,
      unsafeVariable,
      section,
      invertedSection,
      comment,
      customDelimiter,
  };

  exports.createTransformFactory = createTransformFactory;
  exports.transformer = transformer;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLXRlbXBsYXRlLXRyYW5zZm9ybWVyLmpzIiwic291cmNlcyI6WyJsaXQtdHJhbnNmb3JtZXIvc3JjL2xpdC10cmFuc2Zvcm1lci5qcyIsImxpdC10cmFuc2Zvcm1lci9zcmMvaGVscGVyL2RhdGFIZWxwZXIuanMiLCJsaXQtdHJhbnNmb3JtZXIvc3JjL3RyYW5zZm9ybWVycy92YXJpYWJsZVRyYW5zZm9ybWVyLmpzIiwibGl0LXRyYW5zZm9ybWVyL3NyYy90cmFuc2Zvcm1lcnMvdW5zYWZlVmFyaWFibGUuanMiLCJsaXQtdHJhbnNmb3JtZXIvc3JjL2hlbHBlci9pc011c3RhY2hlRmFsc3kuanMiLCJsaXQtdHJhbnNmb3JtZXIvc3JjL2hlbHBlci9zZWN0aW9uSGVscGVyLmpzIiwibGl0LXRyYW5zZm9ybWVyL3NyYy90cmFuc2Zvcm1lcnMvc2VjdGlvbi5qcyIsImxpdC10cmFuc2Zvcm1lci9zcmMvdHJhbnNmb3JtZXJzL2ludmVydGVkU2VjdGlvbi5qcyIsImxpdC10cmFuc2Zvcm1lci9zcmMvdHJhbnNmb3JtZXJzL2NvbW1lbnQuanMiLCJsaXQtdHJhbnNmb3JtZXIvc3JjL3RyYW5zZm9ybWVycy9jdXN0b21EZWxpbWl0ZXIuanMiLCJsaXQtdHJhbnNmb3JtZXIvc3JjL2xpdC10cmFuc2Zvcm1lci1jb25maWd1cmVkT3V0T2ZUaGVCb3guanMiLCJpbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgPSB7XHJcbiAqICBodG1sOiBsaXQtaHRtbC5odG1sLFxyXG4gKiAgZGVsaW1pdGVyOiB7IHN0YXJ0OiAne3snLCBlbmQ6ICd9fScgfSxcclxuICogIHRyYW5zZm9ybWVyczogeyAvLyBub3RlIHRoYXQgdHJhbnNmb3JtVmFyaWFibGUgaXMgbm90IGhlcmUuIEl0IGdldHMgYXBwbGllZCB3aGVuIG5vIHRyYW5zZm9ybWVyLnRlc3QgaGFzIHBhc3NlZFxyXG4gKiAgICBuYW1lOiB7XHJcbiAqICAgICAgdGVzdDogKHN0ciwgY29uZmlnKSA9PiBib29sLFxyXG4gKiAgICAgIHRyYW5zZm9ybTogKHN0ciwgY29uZmlnKSA9PiAoe1xyXG4gKiAgICAgICAgcmVtYWluaW5nVG1wbFN0cjogc3RyLFxyXG4gKiAgICAgICAgaW5zZXJ0aW9uUG9pbnQ6IGN0eCA9PiBsaXQtaHRtbC5UZW1wbGF0ZVJlc3VsdCB8IHVuZGVmaW5lZCwgLy8gaWYgdW5kZWZpbmVkIHJlbWFpbmluZ1RtcGxTdHIgd2lsbCBiZSBtZXJnZWQgd2l0aCBsYXN0IHN0YXRpYyBwYXJ0IFxyXG4gKiAgICAgIH0pLFxyXG4gKiAgICB9LFxyXG4gKiAgfSxcclxuICogIHRyYW5zZm9ybVZhcmlhYmxlLCBcclxuICogfVxyXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259IHN0clRlbXBsYXRlID0+IGN0eCA9PiBsaXQtaHRtbC5UZW1wbGF0ZVJlc3VsdFxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY29uZmlnID0+IHN0clRlbXBsYXRlID0+IHRyYW5zZm9ybShzdHJUZW1wbGF0ZSwgY29uZmlnKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybSh0bXBsMlBhcnNlLCBjb25maWcpIHtcclxuICBjb25zdCBzdGF0aWNQYXJ0cyA9IFtdXHJcbiAgY29uc3QgaW5zZXJ0aW9uUG9pbnRzID0gW11cclxuXHJcbiAgbGV0IHJlbWFpbmluZ1RtcGxTdHIgPSB0bXBsMlBhcnNlXHJcbiAgbGV0IHN0YXJ0SW5kZXhPZklQID0gcmVtYWluaW5nVG1wbFN0ci5pbmRleE9mKGNvbmZpZy5kZWxpbWl0ZXIuc3RhcnQpXHJcbiAgd2hpbGUgKHN0YXJ0SW5kZXhPZklQID49IDApIHtcclxuICAgIGlmIChyZW1haW5pbmdUbXBsU3RyLmluZGV4T2YoY29uZmlnLmRlbGltaXRlci5lbmQsIHN0YXJ0SW5kZXhPZklQKSA8IDApXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbWlzc2luZyBlbmQgZGVsaW1pdGVyIGF0OiAnJHtyZW1haW5pbmdUbXBsU3RyfSdgKVxyXG5cclxuICAgIHN0YXRpY1BhcnRzLnB1c2gocmVtYWluaW5nVG1wbFN0ci5zdWJzdHJpbmcoMCwgc3RhcnRJbmRleE9mSVApKVxyXG5cclxuICAgIGNvbnN0IGlQVHJhbnNmb3JtUmVzdWx0ID0gdHJhbnNmb3JtSVAoXHJcbiAgICAgIHJlbWFpbmluZ1RtcGxTdHIuc3Vic3RyaW5nKHN0YXJ0SW5kZXhPZklQICsgY29uZmlnLmRlbGltaXRlci5zdGFydC5sZW5ndGgpLFxyXG4gICAgICBjb25maWdcclxuICAgIClcclxuXHJcbiAgICBpZiAoaVBUcmFuc2Zvcm1SZXN1bHQuaW5zZXJ0aW9uUG9pbnQpIHtcclxuICAgICAgcmVtYWluaW5nVG1wbFN0ciA9IGlQVHJhbnNmb3JtUmVzdWx0LnJlbWFpbmluZ1RtcGxTdHJcclxuICAgICAgaW5zZXJ0aW9uUG9pbnRzLnB1c2goaVBUcmFuc2Zvcm1SZXN1bHQuaW5zZXJ0aW9uUG9pbnQpXHJcbiAgICAgIHN0YXJ0SW5kZXhPZklQID0gcmVtYWluaW5nVG1wbFN0ci5pbmRleE9mKGNvbmZpZy5kZWxpbWl0ZXIuc3RhcnQpXHJcbiAgICB9IGVsc2UgeyAvLyBlLmcuIGNvbW1lbnQgb3IgY3VzdG9tRGVsaW1ldGVyXHJcbiAgICAgIGNvbnN0IGxhc3RTdGF0aWNQYXJ0ID0gc3RhdGljUGFydHMucG9wKClcclxuICAgICAgcmVtYWluaW5nVG1wbFN0ciA9IGxhc3RTdGF0aWNQYXJ0ICsgaVBUcmFuc2Zvcm1SZXN1bHQucmVtYWluaW5nVG1wbFN0clxyXG4gICAgICBzdGFydEluZGV4T2ZJUCA9IHJlbWFpbmluZ1RtcGxTdHIuaW5kZXhPZihjb25maWcuZGVsaW1pdGVyLnN0YXJ0LCBsYXN0U3RhdGljUGFydC5sZW5ndGgpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzdGF0aWNQYXJ0cy5wdXNoKHJlbWFpbmluZ1RtcGxTdHIpXHJcblxyXG4gIHJldHVybiBjdHggPT5cclxuICAgIGNvbmZpZy5odG1sKHN0YXRpY1BhcnRzLCAuLi5pbnNlcnRpb25Qb2ludHMubWFwKGlQID0+IGlQKGN0eCkpKVxyXG59XHJcblxyXG5mdW5jdGlvbiB0cmFuc2Zvcm1JUChyZW1haW5pbmdUbXBsU3RyLCBjb25maWcpIHtcclxuICBjb25zdCB0cmFuc2Zvcm1lciA9IE9iamVjdC52YWx1ZXMoY29uZmlnLnRyYW5zZm9ybWVycykuZmluZCh0ID0+IHQudGVzdChyZW1haW5pbmdUbXBsU3RyLCBjb25maWcpKVxyXG4gIGNvbnN0IHRyYW5zZm9ybUZ1bmN0aW9uID0gdHJhbnNmb3JtZXJcclxuICAgID8gdHJhbnNmb3JtZXIudHJhbnNmb3JtXHJcbiAgICA6IGNvbmZpZy50cmFuc2Zvcm1WYXJpYWJsZVxyXG4gIHJldHVybiB0cmFuc2Zvcm1GdW5jdGlvbihyZW1haW5pbmdUbXBsU3RyLCBjb25maWcpXHJcbn0iLCJleHBvcnQgZnVuY3Rpb24gY3R4MlZhbHVlKGN0eCwga2V5KSB7XHJcbiAgaWYgKGtleSA9PT0gJy4nKVxyXG4gICAgcmV0dXJuIGN0eFxyXG5cclxuICBsZXQgcmVzdWx0ID0gY3R4XHJcbiAgZm9yIChsZXQgayBvZiBrZXkuc3BsaXQoJy4nKSkge1xyXG4gICAgaWYgKCFyZXN1bHQuaGFzT3duUHJvcGVydHkoaykpXHJcbiAgICAgIHJldHVybiAnJ1xyXG5cclxuICAgIHJlc3VsdCA9IHJlc3VsdFtrXVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3R4Mk11c3RhY2hlU3RyaW5nKGN0eCwga2V5KSB7XHJcbiAgcmV0dXJuIG11c3RhY2hlU3RyaW5neWZ5KGN0eDJWYWx1ZShjdHgsIGtleSkpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG11c3RhY2hlU3RyaW5neWZ5KHZhbHVlKSB7XHJcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpXHJcbiAgICByZXR1cm4gJydcclxuXHJcbiAgcmV0dXJuICcnICsgdmFsdWVcclxufSIsImltcG9ydCB7IGN0eDJNdXN0YWNoZVN0cmluZyB9IGZyb20gJy4uL2hlbHBlci9kYXRhSGVscGVyLmpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgKHJlbWFpbmluZ1RtcGxTdHIsIHsgZGVsaW1pdGVyIH0pID0+IHtcclxuICBjb25zdCBpbmRleE9mRW5kRGVsaW1pdGVyID0gcmVtYWluaW5nVG1wbFN0ci5pbmRleE9mKGRlbGltaXRlci5lbmQpXHJcbiAgY29uc3QgZGF0YUtleSA9IHJlbWFpbmluZ1RtcGxTdHIuc3Vic3RyaW5nKDAsIGluZGV4T2ZFbmREZWxpbWl0ZXIpXHJcbiAgcmV0dXJuIHtcclxuICAgIHJlbWFpbmluZ1RtcGxTdHI6IHJlbWFpbmluZ1RtcGxTdHIuc3Vic3RyaW5nKGluZGV4T2ZFbmREZWxpbWl0ZXIgKyBkZWxpbWl0ZXIuZW5kLmxlbmd0aCksXHJcbiAgICBpbnNlcnRpb25Qb2ludDogY3R4ID0+IGN0eDJNdXN0YWNoZVN0cmluZyhjdHgsIGRhdGFLZXkpXHJcbiAgfVxyXG59IiwiaW1wb3J0IHsgY3R4Mk11c3RhY2hlU3RyaW5nIH0gZnJvbSAnLi4vaGVscGVyL2RhdGFIZWxwZXIuanMnXHJcblxyXG4vKiogTm90ZSwgdGhpcyBpcyB1bnNhZmUgdG8gdXNlLCBiZWNhdXNlIHRoZSByZW5kZXJlZCBvdXRwdXQgY291bGQgYmUgYW55IEphdmFTY3JpcHQhICovXHJcbmV4cG9ydCBkZWZhdWx0IHVuc2FmZUhUTUwgPT4gKHtcclxuICB0ZXN0OiByZW1haW5pbmdUbXBsU3RyID0+IHJlbWFpbmluZ1RtcGxTdHJbMF0gPT09ICd7JyxcclxuICB0cmFuc2Zvcm06IChyZW1haW5pbmdUbXBsU3RyLCB7IGRlbGltaXRlciB9KSA9PiB7XHJcbiAgICBjb25zdCBpbmRleE9mRW5kRGVsaW1pdGVyID0gcmVtYWluaW5nVG1wbFN0ci5pbmRleE9mKCd9JyArIGRlbGltaXRlci5lbmQpXHJcbiAgICBpZiAoaW5kZXhPZkVuZERlbGltaXRlciA8IDApXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbWlzc2luZyBlbmQgZGVsaW1pdGVyIGF0OiAnJHtkZWxpbWl0ZXIuc3RhcnR9JHtyZW1haW5pbmdUbXBsU3RyfSdgKVxyXG4gIFxyXG4gICAgY29uc3QgZGF0YUtleSA9IHJlbWFpbmluZ1RtcGxTdHIuc3Vic3RyaW5nKDEsIGluZGV4T2ZFbmREZWxpbWl0ZXIpXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZW1haW5pbmdUbXBsU3RyOiByZW1haW5pbmdUbXBsU3RyLnN1YnN0cmluZyhpbmRleE9mRW5kRGVsaW1pdGVyICsgMSArIGRlbGltaXRlci5lbmQubGVuZ3RoKSxcclxuICAgICAgaW5zZXJ0aW9uUG9pbnQ6IGN0eCA9PiB1bnNhZmVIVE1MKGN0eDJNdXN0YWNoZVN0cmluZyhjdHgsIGRhdGFLZXkpKSxcclxuICAgIH1cclxuICB9XHJcbn0pIiwiZXhwb3J0IGZ1bmN0aW9uIGlzTXVzdGFjaGVGYWxzeSh2YWx1ZSkge1xyXG4gIHJldHVybiBbbnVsbCwgdW5kZWZpbmVkLCBmYWxzZSwgMCwgTmFOLCAnJ11cclxuICAgIC5zb21lKGZhbHN5ID0+IGZhbHN5ID09PSB2YWx1ZSlcclxuICAgIHx8ICh2YWx1ZS5sZW5ndGggJiYgdmFsdWUubGVuZ3RoID09PSAwKVxyXG59IiwiZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2VjdGlvbih0bXBsU3RyLCBkZWxpbWl0ZXIpIHtcclxuICBjb25zdCBpbmRleE9mU3RhcnRUYWdFbmQgPSB0bXBsU3RyLmluZGV4T2YoZGVsaW1pdGVyLmVuZClcclxuICBjb25zdCBkYXRhS2V5ID0gdG1wbFN0ci5zdWJzdHJpbmcoMSwgaW5kZXhPZlN0YXJ0VGFnRW5kKVxyXG4gIGNvbnN0IGVuZFRhZyA9IGAke2RlbGltaXRlci5zdGFydH0vJHtkYXRhS2V5fSR7ZGVsaW1pdGVyLmVuZH1gXHJcbiAgY29uc3QgaW5kZXhPZkVuZFRhZ1N0YXJ0ID0gdG1wbFN0ci5pbmRleE9mKGVuZFRhZylcclxuICBpZiAoaW5kZXhPZkVuZFRhZ1N0YXJ0IDwgMClcclxuICAgIHRocm93IG5ldyBFcnJvcihgbWlzc2luZyBlbmQgZGVsaW1pdGVyIGF0OiAnJHtkZWxpbWl0ZXIuc3RhcnR9JHt0bXBsU3RyfSdgKVxyXG4gIFxyXG4gIHJldHVybiB7XHJcbiAgICBkYXRhS2V5LFxyXG4gICAgaW5uZXJUbXBsOiB0bXBsU3RyLnN1YnN0cmluZyhpbmRleE9mU3RhcnRUYWdFbmQgKyBkZWxpbWl0ZXIuc3RhcnQubGVuZ3RoLCBpbmRleE9mRW5kVGFnU3RhcnQpLFxyXG4gICAgcmVtYWluaW5nVG1wbFN0cjogdG1wbFN0ci5zdWJzdHJpbmcoaW5kZXhPZkVuZFRhZ1N0YXJ0ICsgZW5kVGFnLmxlbmd0aCksXHJcbiAgfVxyXG59IiwiaW1wb3J0IHsgdHJhbnNmb3JtIH0gZnJvbSAnLi4vbGl0LXRyYW5zZm9ybWVyLmpzJ1xyXG5pbXBvcnQgeyBjdHgyVmFsdWUgfSBmcm9tICcuLi9oZWxwZXIvZGF0YUhlbHBlci5qcydcclxuaW1wb3J0IHsgaXNNdXN0YWNoZUZhbHN5IH0gZnJvbSAnLi4vaGVscGVyL2lzTXVzdGFjaGVGYWxzeS5qcydcclxuaW1wb3J0IHsgcGFyc2VTZWN0aW9uIH0gZnJvbSAnLi4vaGVscGVyL3NlY3Rpb25IZWxwZXIuanMnXHJcblxyXG4vKiogTm90ZSwgdW5saWtlIHdpdGhpbiBtdXN0YWNoZSBmdW5jdGlvbnMgYXMgZGF0YSB2YWx1ZXMgYXJlIG5vdCBzdXBwb3J0ZWQgb3V0IG9mIHRoZSBib3ggKi9cclxuZXhwb3J0IGRlZmF1bHQgKCkgPT4gKHtcclxuICB0ZXN0OiByZW1haW5pbmdUbXBsU3RyID0+IHJlbWFpbmluZ1RtcGxTdHJbMF0gPT09ICcjJyxcclxuICB0cmFuc2Zvcm06IChyZW1haW5pbmdUbXBsU3RyLCBjb25maWcpID0+IHtcclxuICAgIGNvbnN0IHBhcnNlZFNlY3Rpb24gPSBwYXJzZVNlY3Rpb24ocmVtYWluaW5nVG1wbFN0ciwgY29uZmlnLmRlbGltaXRlcilcclxuICAgIGNvbnN0IHRyYW5zZm9ybWVkSW5uZXJUbXBsID0gdHJhbnNmb3JtKHBhcnNlZFNlY3Rpb24uaW5uZXJUbXBsLCBjb25maWcpXHJcbiAgICBcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlbWFpbmluZ1RtcGxTdHI6IHBhcnNlZFNlY3Rpb24ucmVtYWluaW5nVG1wbFN0cixcclxuICAgICAgaW5zZXJ0aW9uUG9pbnQ6IGN0eCA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbkRhdGEgPSBjdHgyVmFsdWUoY3R4LCBwYXJzZWRTZWN0aW9uLmRhdGFLZXkpXHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGlzTXVzdGFjaGVGYWxzeShzZWN0aW9uRGF0YSkpXHJcbiAgICAgICAgICByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWN0aW9uRGF0YS5tYXBcclxuICAgICAgICAgID8gc2VjdGlvbkRhdGEubWFwKGlubmVyQ3R4ID0+IHRyYW5zZm9ybWVkSW5uZXJUbXBsKGlubmVyQ3R4KSlcclxuICAgICAgICAgIDogdHJhbnNmb3JtZWRJbm5lclRtcGwoY3R4KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KSIsImltcG9ydCB7IGN0eDJWYWx1ZSB9IGZyb20gJy4uL2hlbHBlci9kYXRhSGVscGVyLmpzJ1xyXG5pbXBvcnQgeyBpc011c3RhY2hlRmFsc3kgfSBmcm9tICcuLi9oZWxwZXIvaXNNdXN0YWNoZUZhbHN5LmpzJ1xyXG5pbXBvcnQgeyBwYXJzZVNlY3Rpb24gfSBmcm9tICcuLi9oZWxwZXIvc2VjdGlvbkhlbHBlci5qcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0ICgpID0+ICh7XHJcbiAgdGVzdDogcmVtYWluaW5nVG1wbFN0ciA9PiByZW1haW5pbmdUbXBsU3RyWzBdID09PSAnXicsXHJcbiAgdHJhbnNmb3JtOiAocmVtYWluaW5nVG1wbFN0ciwgeyBkZWxpbWl0ZXIgfSkgPT4ge1xyXG4gICAgY29uc3QgcGFyc2VkU2VjdGlvbiA9IHBhcnNlU2VjdGlvbihyZW1haW5pbmdUbXBsU3RyLCBkZWxpbWl0ZXIpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVtYWluaW5nVG1wbFN0cjogcGFyc2VkU2VjdGlvbi5yZW1haW5pbmdUbXBsU3RyLFxyXG4gICAgICBpbnNlcnRpb25Qb2ludDogY3R4ID0+XHJcbiAgICAgICAgaXNNdXN0YWNoZUZhbHN5KGN0eDJWYWx1ZShjdHgsIHBhcnNlZFNlY3Rpb24uZGF0YUtleSkpXHJcbiAgICAgICAgICA/IHBhcnNlZFNlY3Rpb24uaW5uZXJUbXBsXHJcbiAgICAgICAgICA6ICcnLFxyXG4gICAgfVxyXG4gIH1cclxufSkiLCJleHBvcnQgZGVmYXVsdCAoKSA9PiAoe1xyXG4gIHRlc3Q6IHJlbWFpbmluZ1RtcGxTdHIgPT4gcmVtYWluaW5nVG1wbFN0clswXSA9PT0gJyEnLFxyXG4gIHRyYW5zZm9ybTogKHJlbWFpbmluZ1RtcGxTdHIsIHsgZGVsaW1pdGVyIH0pID0+ICh7XHJcbiAgICByZW1haW5pbmdUbXBsU3RyOiByZW1haW5pbmdUbXBsU3RyLnN1YnN0cmluZyhyZW1haW5pbmdUbXBsU3RyLmluZGV4T2YoZGVsaW1pdGVyLmVuZCkgKyBkZWxpbWl0ZXIuZW5kLmxlbmd0aCksXHJcbiAgICBpbnNlcnRpb25Qb2ludDogdW5kZWZpbmVkLFxyXG4gIH0pXHJcbn0pIiwiZXhwb3J0IGRlZmF1bHQgKCkgPT4gKHtcclxuICB0ZXN0OiByZW1haW5pbmdUbXBsU3RyID0+IHJlbWFpbmluZ1RtcGxTdHJbMF0gPT09ICc9JyxcclxuICB0cmFuc2Zvcm06IChyZW1haW5pbmdUbXBsU3RyLCBjb25maWcpID0+IHtcclxuICAgIGNvbnN0IG9yaWdpbmFsRW5kRGVsaUxlbmd0aCA9IGNvbmZpZy5kZWxpbWl0ZXIuZW5kLmxlbmd0aFxyXG4gICAgY29uc3QgaW5kZXhPZkVuZFRhZyA9IHJlbWFpbmluZ1RtcGxTdHIuaW5kZXhPZignPScgKyBjb25maWcuZGVsaW1pdGVyLmVuZClcclxuICAgIGlmIChpbmRleE9mRW5kVGFnIDwgMCApXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbWlzc2luZyBlbmQgZGVsaW1pdGVyIGF0OiAnJHtyZW1haW5pbmdUbXBsU3RyfSdgKVxyXG5cclxuICAgIGNvbnN0IFsgbmV3U3RhcnREZWxpLCBuZXdFbmREZWxpIF0gPSByZW1haW5pbmdUbXBsU3RyLnN1YnN0cmluZygxLCBpbmRleE9mRW5kVGFnKS5zcGxpdCgnICcpXHJcblxyXG4gICAgY29uZmlnLmRlbGltaXRlci5zdGFydCA9IG5ld1N0YXJ0RGVsaVxyXG4gICAgY29uZmlnLmRlbGltaXRlci5lbmQgPSBuZXdFbmREZWxpXHJcbiAgICBcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlbWFpbmluZ1RtcGxTdHI6IHJlbWFpbmluZ1RtcGxTdHIuc3Vic3RyaW5nKGluZGV4T2ZFbmRUYWcgKyAxICsgb3JpZ2luYWxFbmREZWxpTGVuZ3RoKSxcclxuICAgICAgaW5zZXJ0aW9uUG9pbnQ6IHVuZGVmaW5lZCwgIFxyXG4gICAgfVxyXG4gIH1cclxufSkiLCJpbXBvcnQgY3JlYXRlVHJhbnNmb3JtIGZyb20gJy4vbGl0LXRyYW5zZm9ybWVyLmpzJ1xyXG5pbXBvcnQgdHJhbnNmb3JtVmFyaWFibGUgZnJvbSAnLi90cmFuc2Zvcm1lcnMvdmFyaWFibGVUcmFuc2Zvcm1lci5qcydcclxuaW1wb3J0IHVuc2FmZVZhcmlhYmxlVHJhbnNmb3JtZXIgZnJvbSAnLi90cmFuc2Zvcm1lcnMvdW5zYWZlVmFyaWFibGUuanMnXHJcbmltcG9ydCBzZWN0aW9uVHJhbnNmb3JtZXIgZnJvbSAnLi90cmFuc2Zvcm1lcnMvc2VjdGlvbi5qcydcclxuaW1wb3J0IGludmVydGVkU2VjdGlvblRyYW5zZm9ybWVyIGZyb20gJy4vdHJhbnNmb3JtZXJzL2ludmVydGVkU2VjdGlvbi5qcydcclxuaW1wb3J0IGNvbW1lbnRUcmFuc2Zvcm1lciBmcm9tICcuL3RyYW5zZm9ybWVycy9jb21tZW50LmpzJ1xyXG5pbXBvcnQgY3VzdG9tRGVsaW1pdGVyVHJhbnNmb3JtZXIgZnJvbSAnLi90cmFuc2Zvcm1lcnMvY3VzdG9tRGVsaW1pdGVyLmpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgKGh0bWwsIHVuc2FmZUhUTUwpID0+XHJcbiAgY3JlYXRlVHJhbnNmb3JtKHtcclxuICAgIGh0bWwsXHJcbiAgICBkZWxpbWl0ZXI6IHsgc3RhcnQ6ICd7eycsIGVuZDogJ319JyB9LFxyXG4gICAgdHJhbnNmb3JtVmFyaWFibGUsXHJcbiAgICB0cmFuc2Zvcm1lcnM6IHtcclxuICAgICAgdW5zYWZlVmFyaWFibGU6IHVuc2FmZVZhcmlhYmxlVHJhbnNmb3JtZXIodW5zYWZlSFRNTCksXHJcbiAgICAgIHNlY3Rpb246IHNlY3Rpb25UcmFuc2Zvcm1lcigpLFxyXG4gICAgICBpbnZlcnRlZFNlY3Rpb246IGludmVydGVkU2VjdGlvblRyYW5zZm9ybWVyKCksXHJcbiAgICAgIGNvbW1lbnQ6IGNvbW1lbnRUcmFuc2Zvcm1lcigpLFxyXG4gICAgICBjdXN0b21EZWxpbWl0ZXJUcmFuc2Zvcm1lcjogY3VzdG9tRGVsaW1pdGVyVHJhbnNmb3JtZXIoKSxcclxuICAgIH0sXHJcbiAgfSkiLCJpbXBvcnQgdHlwZSB7XG4gICAgVGVtcGxhdGVUYWcsXG4gICAgVW5zYWZlSFRNTERpcmVjdGl2ZSxcbiAgICBUZW1wbGF0ZVRyYW5zZm9ybWVyLFxuICAgIFRyYW5zZm9ybVRlc3RlcixcbiAgICBUcmFuc2Zvcm1FeGVjdXRvcixcbiAgICBUcmFuc2Zvcm1lQ29udGV4dCxcbiAgICBUcmFuc2Zvcm1Db25maWcsXG59IGZyb20gJ2xpdC10cmFuc2Zvcm1lci9zcmMvaW50ZXJmYWNlcyc7XG5cbmltcG9ydCBjcmVhdGVEZWZhdWx0IGZyb20gJ2xpdC10cmFuc2Zvcm1lcic7XG5pbXBvcnQgY3JlYXRlQ3VzdG9tIGZyb20gJ2xpdC10cmFuc2Zvcm1lci9zcmMvbGl0LXRyYW5zZm9ybWVyJztcblxuaW1wb3J0IHZhcmlhYmxlIGZyb20gJ2xpdC10cmFuc2Zvcm1lci9zcmMvdHJhbnNmb3JtZXJzL3ZhcmlhYmxlVHJhbnNmb3JtZXInO1xuaW1wb3J0IHVuc2FmZVZhcmlhYmxlIGZyb20gJ2xpdC10cmFuc2Zvcm1lci9zcmMvdHJhbnNmb3JtZXJzL3Vuc2FmZVZhcmlhYmxlJztcbmltcG9ydCBzZWN0aW9uIGZyb20gJ2xpdC10cmFuc2Zvcm1lci9zcmMvdHJhbnNmb3JtZXJzL3NlY3Rpb24nO1xuaW1wb3J0IGludmVydGVkU2VjdGlvbiBmcm9tICdsaXQtdHJhbnNmb3JtZXIvc3JjL3RyYW5zZm9ybWVycy9pbnZlcnRlZFNlY3Rpb24nO1xuaW1wb3J0IGNvbW1lbnQgZnJvbSAnbGl0LXRyYW5zZm9ybWVyL3NyYy90cmFuc2Zvcm1lcnMvY29tbWVudCc7XG5pbXBvcnQgY3VzdG9tRGVsaW1pdGVyIGZyb20gJ2xpdC10cmFuc2Zvcm1lci9zcmMvdHJhbnNmb3JtZXJzL2N1c3RvbURlbGltaXRlcic7XG5cbmZ1bmN0aW9uIGNyZWF0ZVRyYW5zZm9ybUZhY3RvcnkoaHRtbDogVGVtcGxhdGVUYWcsIHVuc2FmZUhUTUw6IFVuc2FmZUhUTUxEaXJlY3RpdmUpOiBUZW1wbGF0ZVRyYW5zZm9ybWVyO1xuZnVuY3Rpb24gY3JlYXRlVHJhbnNmb3JtRmFjdG9yeShjb25maWc6IFRyYW5zZm9ybUNvbmZpZyk6IFRlbXBsYXRlVHJhbnNmb3JtZXI7XG5mdW5jdGlvbiBjcmVhdGVUcmFuc2Zvcm1GYWN0b3J5KGFyZzE6IHVua25vd24sIGFyZzI/OiB1bmtub3duKTogVGVtcGxhdGVUcmFuc2Zvcm1lciB7XG4gICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBhcmcxKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVEZWZhdWx0KGFyZzEgYXMgVGVtcGxhdGVUYWcsIGFyZzIgYXMgVW5zYWZlSFRNTERpcmVjdGl2ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUN1c3RvbShPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGRlbGltaXRlcjogeyBzdGFydDogJ3t7JywgZW5kOiAnfX0nIH0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1lcnM6IHt9LFxuICAgICAgICB9LCBhcmcxKSBhcyBUcmFuc2Zvcm1Db25maWcpO1xuICAgIH1cbn1cblxuY29uc3QgdHJhbnNmb3JtZXI6IHtcbiAgICB2YXJpYWJsZTogVHJhbnNmb3JtRXhlY3V0b3I7XG4gICAgdW5zYWZlVmFyaWFibGU6ICh1bnNhZmVIVE1MOiBVbnNhZmVIVE1MRGlyZWN0aXZlKSA9PiBUcmFuc2Zvcm1lQ29udGV4dDtcbiAgICBzZWN0aW9uOiAoKSA9PiBUcmFuc2Zvcm1lQ29udGV4dDtcbiAgICBpbnZlcnRlZFNlY3Rpb246ICgpID0+IFRyYW5zZm9ybWVDb250ZXh0O1xuICAgIGNvbW1lbnQ6ICgpID0+IFRyYW5zZm9ybWVDb250ZXh0O1xuICAgIGN1c3RvbURlbGltaXRlcjogKCkgPT4gVHJhbnNmb3JtZUNvbnRleHQ7XG59ID0ge1xuICAgIHZhcmlhYmxlLFxuICAgIHVuc2FmZVZhcmlhYmxlLFxuICAgIHNlY3Rpb24sXG4gICAgaW52ZXJ0ZWRTZWN0aW9uLFxuICAgIGNvbW1lbnQsXG4gICAgY3VzdG9tRGVsaW1pdGVyLFxufTtcblxuZXhwb3J0IHtcbiAgICBUZW1wbGF0ZVRhZyxcbiAgICBVbnNhZmVIVE1MRGlyZWN0aXZlLFxuICAgIFRlbXBsYXRlVHJhbnNmb3JtZXIsXG4gICAgVHJhbnNmb3JtVGVzdGVyLFxuICAgIFRyYW5zZm9ybUV4ZWN1dG9yLFxuICAgIFRyYW5zZm9ybWVDb250ZXh0LFxuICAgIFRyYW5zZm9ybUNvbmZpZyxcbiAgICBjcmVhdGVUcmFuc2Zvcm1GYWN0b3J5LFxuICAgIHRyYW5zZm9ybWVyLFxufTtcbiJdLCJuYW1lcyI6WyJjcmVhdGVUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm1WYXJpYWJsZSIsInVuc2FmZVZhcmlhYmxlVHJhbnNmb3JtZXIiLCJzZWN0aW9uVHJhbnNmb3JtZXIiLCJpbnZlcnRlZFNlY3Rpb25UcmFuc2Zvcm1lciIsImNvbW1lbnRUcmFuc2Zvcm1lciIsImN1c3RvbURlbGltaXRlclRyYW5zZm9ybWVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztFQUFBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFD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
