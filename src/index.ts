/**
 * RESTli utils for talking to restli APIs.
 */
import { isPlainObject, isArray } from 'lodash';

/**
 * @function
 * @param {String} str string to be encoded.
 * @desc
 * Converts a string to an URI encoded string including characters like '!', ', (', ')' and '*'
 */
const fixedEncodeURIComponent = (str: string): string =>
  encodeURIComponent(str).replace(/[!'()*]/g, (c) =>
    '%' + c.charCodeAt(0).toString(16).toUpperCase());

/**
 * It will convert an obj to string restli obj
 * @param {*} obj Any kind of object
 */
const toRestli = (obj: any): string => {
  if (Array.isArray(obj)) {
    return `List(${obj.map((item) => toRestli(item))})`;
  } else if (isPlainObject(obj)) {
    const strObj = Object.keys(obj).map((key) => `${key}:${toRestli(obj[key])}`);
    return `(${strObj})`;
  } else {
    return `${fixedEncodeURIComponent(obj)}`;
  }
};

/**
 * Will parse a restli string. This code is only used in test and right now it is not production ready.
 * @param {*} str
 * @param {*} state
 */
const fromRestli = (str: string, state = { index: 0 }) => {
  let next = 'INIT';
  let obj: any;
  let propertyName: string = '';
  let propertyValue;

  while (state.index <= str.length) {
    const substr = str.substr(state.index);
    const isObjectRegex = /^\(/g;
    const isListRegex = /^List\(/g;
    const isCommaRegex = /^,/g;
    const isDelimiterRegex = /^:/g;
    const isEndParentesisRegex = /^\)/g;
    const objMatch = isObjectRegex.exec(substr);
    const listMatch = isListRegex.exec(substr);
    const isComma = isCommaRegex.exec(substr);
    const isDelimiter = isDelimiterRegex.exec(substr);
    const isEndParenthesis = isEndParentesisRegex.exec(substr);

    if (next === 'ARRAYELEMENT') {
      if (listMatch || objMatch && propertyValue === '') {
        obj.push(fromRestli(str, state));
        propertyValue = '';
      } else if (isEndParenthesis) {
        if (propertyValue) {
          obj.push(decodeURIComponent(propertyValue));
        }
        next = 'INIT';
        return obj;

      } else if (isComma) {
        if (propertyValue) {
          obj.push(decodeURIComponent(propertyValue));
        }
        propertyValue = '';
      } else {
        propertyValue += substr.charAt(0);
      }
    } else if (next === 'PROPERTYVALUE') {
      if (listMatch || objMatch && propertyValue === '') {
        obj[propertyName] = fromRestli(str, state);
        next = 'PROPERTYNAME';
        propertyName = '';
      } else if (isEndParenthesis) {
        obj[propertyName] = decodeURIComponent(propertyValue as string);
        next = 'INIT';
        return obj;

      } else if (isComma) {
        obj[propertyName] = decodeURIComponent(propertyValue as string);

        next = 'PROPERTYNAME';
        propertyName = '';
      } else {
        propertyValue += substr.charAt(0);
      }
    } else if (next === 'PROPERTYNAME') {
      if (isComma) {
        next = 'PROPERTYNAME';
        propertyName = '';
      } else if (isDelimiter) {
        propertyValue = '';
        next = 'PROPERTYVALUE';
      } else if (isEndParenthesis) {
        next = 'INIT';
        return obj;
      } else {
        propertyName += substr.charAt(0);
      }
    } else if (next === 'INIT') {
      if (listMatch) {
        next = 'ARRAYELEMENT';
        obj = [];
        state.index += 4;
        propertyValue = '';
      } else {
        next = 'PROPERTYNAME';
        obj = {};
        propertyName = '';
      }
    }
    state.index += 1;
  }
  return {};
};

/**
 * Will return STRING params for APIs in a restli style.
 * @param {*} params JSON object
 */
const toParams = (params: any) => {
  if (!params) {
    return '';
  }
  return Object.keys(params).map((key) => {
    const p = params[key];
    const pString = isPlainObject(p) || isArray(p) ? toRestli(p) : encodeURIComponent(p).replace(/%2C/g, ',');
    return `${key}=${pString}`;
  }).join('&');
};

export { toParams, toRestli, fromRestli, fixedEncodeURIComponent };
