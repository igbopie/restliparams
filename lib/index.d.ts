/**
 * @function
 * @param {String} str string to be encoded.
 * @desc
 * Converts a string to an URI encoded string including characters like '!', ', (', ')' and '*'
 */
declare const fixedEncodeURIComponent: (str: string) => string;
/**
 * It will convert an obj to string restli obj
 * @param {*} obj Any kind of object
 */
declare const toRestli: (obj: any) => string;
/**
 * Will parse a restli string. This code is only used in test and right now it is not production ready.
 * @param {*} str
 * @param {*} state
 */
declare const fromRestli: (str: string, state?: {
    index: number;
}) => any;
/**
 * Will return STRING params for APIs in a restli style.
 * @param {*} params JSON object
 */
declare const toParams: (params: any) => string;
export { toParams, toRestli, fromRestli, fixedEncodeURIComponent };
