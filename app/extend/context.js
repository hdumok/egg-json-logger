'use strict';

const uuid = require('uuid/v4')
const META = Symbol('meta')

module.exports = {

  get meta() {
    return {
      reqid: uuid(),
      uid: this.userId || this.uid || '',
      use: this.starttime ? Date.now() - this.starttime : 0,
      origin: this.origin,
      ip: this.ip,
      host: this.host,
      method: this.method,
      path: this.path,
      url: this.url,
      body: this.request.body,
      query: this.query,
      params: this.params
    }
  },

  get jsonLogger() {
    let logger = {};
    ['info', 'debug', 'warn', 'error'].forEach(level => {
      logger[level] = (...args) => {
        args.push(this.meta)
        this.app.logger[level](...args)
      }
    });
    return logger;
  },
};
