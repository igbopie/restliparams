"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * RESTli utils for talking to restli APIs.
 */
var lodash_1 = require("lodash");
/**
 * @function
 * @param {String} str string to be encoded.
 * @desc
 * Converts a string to an URI encoded string including characters like '!', ', (', ')' and '*'
 */
var fixedEncodeURIComponent = function (str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
};
exports.fixedEncodeURIComponent = fixedEncodeURIComponent;
/**
 * It will convert an obj to string restli obj
 * @param {*} obj Any kind of object
 */
var toRestli = function (obj) {
    if (Array.isArray(obj)) {
        return "List(" + obj.map(function (item) { return toRestli(item); }) + ")";
    }
    else if (lodash_1.isPlainObject(obj)) {
        var strObj = Object.keys(obj).map(function (key) { return key + ":" + toRestli(obj[key]); });
        return "(" + strObj + ")";
    }
    else {
        return "" + fixedEncodeURIComponent(obj);
    }
};
exports.toRestli = toRestli;
/**
 * Will parse a restli string. This code is only used in test and right now it is not production ready.
 * @param {*} str
 * @param {*} state
 */
var fromRestli = function (str, state) {
    if (state === void 0) { state = { index: 0 }; }
    var next = 'INIT';
    var obj;
    var propertyName = '';
    var propertyValue;
    while (state.index <= str.length) {
        var substr = str.substr(state.index);
        var isObjectRegex = /^\(/g;
        var isListRegex = /^List\(/g;
        var isCommaRegex = /^,/g;
        var isDelimiterRegex = /^:/g;
        var isEndParentesisRegex = /^\)/g;
        var objMatch = isObjectRegex.exec(substr);
        var listMatch = isListRegex.exec(substr);
        var isComma = isCommaRegex.exec(substr);
        var isDelimiter = isDelimiterRegex.exec(substr);
        var isEndParenthesis = isEndParentesisRegex.exec(substr);
        if (next === 'ARRAYELEMENT') {
            if (listMatch || objMatch && propertyValue === '') {
                obj.push(fromRestli(str, state));
                propertyValue = '';
            }
            else if (isEndParenthesis) {
                if (propertyValue) {
                    obj.push(decodeURIComponent(propertyValue));
                }
                next = 'INIT';
                return obj;
            }
            else if (isComma) {
                if (propertyValue) {
                    obj.push(decodeURIComponent(propertyValue));
                }
                propertyValue = '';
            }
            else {
                propertyValue += substr.charAt(0);
            }
        }
        else if (next === 'PROPERTYVALUE') {
            if (listMatch || objMatch && propertyValue === '') {
                obj[propertyName] = fromRestli(str, state);
                next = 'PROPERTYNAME';
                propertyName = '';
            }
            else if (isEndParenthesis) {
                obj[propertyName] = decodeURIComponent(propertyValue);
                next = 'INIT';
                return obj;
            }
            else if (isComma) {
                obj[propertyName] = decodeURIComponent(propertyValue);
                next = 'PROPERTYNAME';
                propertyName = '';
            }
            else {
                propertyValue += substr.charAt(0);
            }
        }
        else if (next === 'PROPERTYNAME') {
            if (isComma) {
                next = 'PROPERTYNAME';
                propertyName = '';
            }
            else if (isDelimiter) {
                propertyValue = '';
                next = 'PROPERTYVALUE';
            }
            else if (isEndParenthesis) {
                next = 'INIT';
                return obj;
            }
            else {
                propertyName += substr.charAt(0);
            }
        }
        else if (next === 'INIT') {
            if (listMatch) {
                next = 'ARRAYELEMENT';
                obj = [];
                state.index += 4;
                propertyValue = '';
            }
            else {
                next = 'PROPERTYNAME';
                obj = {};
                propertyName = '';
            }
        }
        state.index += 1;
    }
    return {};
};
exports.fromRestli = fromRestli;
/**
 * Will return STRING params for APIs in a restli style.
 * @param {*} params JSON object
 */
var toParams = function (params) {
    if (!params) {
        return '';
    }
    return Object.keys(params).map(function (key) {
        var p = params[key];
        var pString = lodash_1.isPlainObject(p) || lodash_1.isArray(p) ? toRestli(p) : encodeURIComponent(p).replace(/%2C/g, ',');
        return key + "=" + pString;
    }).join('&');
};
exports.toParams = toParams;
