'use strict';

const {getMessageArray, getFlattenrObj} = require('../lib/util')


exports.logger = {

  ignore: {
    path: ['/']
  },

  formatter: function (meta) {

    let msgArray = getMessageArray(meta.message)
    delete meta.message;

    let index = 1;
    for (let msg of msgArray) {
      try {
        let obj = JSON.parse(msg)
        if (!obj.hasOwnProperty('reqid') && !obj.hasOwnProperty('error')) {
          obj = {[`log${index++}`]: obj}
        }

        Object.assign(meta, obj)
        Object.assign(meta, getFlattenrObj(obj))
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
};

