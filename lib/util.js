'use strict';

const Flattenr = require("flattenr");

module.exports = {

  checkIgnorePath(array, path) {
    let flag = false;
    for (let item of array) {
      if (typeof item === "string") {
        flag = item === path
      }
      else if (item && typeof item === "object" && typeof item.test === "function") {
        flag = item.test(path)
      }

      if (flag) break;
    }
    return flag
  },

  getFlattenrObj(obj) {
    return new Flattenr(obj, ".").get()
  },

  getMessageArray(str = '') {
    let V = {'[': -1, ']': 1, '{': -10000, '}': 10000}
    let v = 0, s = 0, a = [], f = 0, l = str.length;
    for (let i = 0; i < l; i++) {
      i === l - 1 && a.push(str.slice(s).trim())
      if (V[str[i]]) {
        f = 1;
        v += V[str[i]];
      }
      if (str[i] !== ' ') continue;
      if (!v && (f || V[str[i + 1]])) {
        a.push(str.slice(s, i + 1).trim())
        s = i + 1
        f = 0
      }
    }
    return a
  },

  getErrorJson(err) {

    if (err instanceof Error) {
      err = new Error(err)
    }
    return {
      name: err.name,
      message: err.message,
      stack: err.stack ? err.stack.replace(/\n|\s+|:/g, ',').replace(/,,|,/g, ' ') : ''
    }
  },

  getHtmlJson(html = '') {

    let start = html.indexOf('{', html.indexOf('window'))
    let end = html.indexOf('}', start) + 1
    html = html.slice(start, end).replace(/\r\n|\s/g, '');

    let str = html.replace(',}', '}')
    str = str.replace(/'/g, '"')
    str = str.replace(/{/g, '{"')
    str = str.replace(/,/g, ',"')
    str = str.replace(/:"/g, '":"')

    try {
      return JSON.parse(str)
    }
    catch (e) {
      return html
    }
  }
}