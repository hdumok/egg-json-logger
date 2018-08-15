'use strict';

const Flattenr = require("flattenr");

const util = module.exports = {}

util.stringify = false;
util.flattenr = false;

util.formatter = function (meta) {

  let msgArray = util.getMessageArray(meta.message)
  meta.message = undefined;
  meta.from = '';

  let index = 1;
  for (let msg of msgArray) {
    try {
      let obj = JSON.parse(msg)
      if (!obj.hasOwnProperty('reqid') && !obj.hasOwnProperty('error')) {
        obj = {[`log${index++}`]: obj}
      }

      if (util.stringify) {
        Object.assign(meta, obj)
      }

      if (util.flattenr) {
        Object.assign(meta, new Flattenr(obj, ".").get())
      }
    }
    catch (e) {
      //会识别第一个 [内容] 作为from, 普通的数组序列化后，不会到这里来
      if (!meta.from && /\[*\]/.test(msg)) {
        meta.from = msg.slice(1, -1)
      }
      else {
        let obj = {[`log${index++}`]: msg}
        Object.assign(meta, obj)
      }
    }
  }

  meta.date = meta.date.split(',')[0]

  return JSON.stringify(meta)
}

util.checkIgnorePath = function (array, path) {
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
}

util.getMessageArray = function (str = '') {
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
}

util.getErrorJson = function (err) {

  if (err instanceof Error) {
    err = new Error(err)
  }
  return {
    name: err.name,
    message: err.message,
    stack: err.stack ? err.stack.replace(/\n|\s+|:/g, ',').replace(/,,|,/g, ' ') : ''
  }
}

util.getHtmlJson = function (html = '') {

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
