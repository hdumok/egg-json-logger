'use strict';

const {getErrorJson} = require('../../lib/util')

module.exports = {

  get jsonLogger() {

    let meta = {
      reqid: this.requestId || '',
      uid: this.userId || '',
      use: this.starttime ? Date.now() - this.starttime : 0
    };

    let log = {};

    ['info', 'debug', 'warn', 'error'].forEach(level => {
      log[level] = (...args) => {
        //加入meta
        args.push(meta)

        for (let i = 0, len = args.length; i < len; i++) {

          if (args[i] instanceof Error) {
            args[i] = {
              error: getErrorJson(args[i])
            }
          }

          args[i] = typeof args[i] === 'string' ? args[i] : JSON.stringify(args[i])
        }

        this.app.logger[level](...args)
      }
    });

    return log;
  },
};
