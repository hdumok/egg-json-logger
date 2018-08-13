'use strict';

const {getHtmlJson, getErrorJson} = require('./lib/util')

module.exports = app => {

  let config = app.config.logger;
  if (config.event.error) {

    app.on('error', (err, ctx) => {
      let meta = {}
      if (ctx) {
        meta = {
          reqid: ctx.requestId,
          ip: ctx.ip || '',
          origin: ctx.origin || '',
          host: ctx.host || '',
          method: ctx.method || '',
          path: ctx.path || '',
          url: ctx.url || '',
          body: ctx.request.body || {},
          query: ctx.query || {},
          params: ctx.params || {}
        }
      }

      meta.error = getErrorJson(err)

      app.logger.error('[error]', JSON.stringify(meta))
    });
  }

  if (config.event.request) {

    app.on('request', ctx => {

      let ignore = config.ignore || [];
      if (ignore.indexOf(ctx.path) !== -1) return;

      ctx.requestId = require('uuid/v4')()

      let meta = {
        reqid: ctx.requestId,
        ip: ctx.ip || '',
        origin: ctx.origin || '',
        host: ctx.host || '',
        method: ctx.method || '',
        path: ctx.path || '',
        url: ctx.url || '',
        body: ctx.request.body || {},
        query: ctx.query || {},
        params: ctx.params || {}
      };

      app.logger.info('[request]', JSON.stringify(meta))
    });
  }

  if (config.event.request) {

    app.on('response', ctx => {

      let ignore = config.ignore || [];
      if (ignore.indexOf(ctx.path) !== -1) return;

      let meta = {
        reqid: ctx.requestId || '',
        uid: ctx.userId || '',
        use: ctx.starttime ? Date.now() - ctx.starttime : 0,
        ip: ctx.ip || '',
        host: ctx.host || '',
        origin: ctx.origin || '',
        method: ctx.method || '',
        path: ctx.path || '',
        url: ctx.url || '',
        body: ctx.request.body || {},
        query: ctx.query || {},
        params: ctx.params || {},

        response: ctx.body
      };

      switch (typeof meta.response) {
        case 'string':
          if (meta.response.indexOf('DOCTYPE') !== -1) {
            meta.response = getHtmlJson(meta.response)
          }
          break;
        case 'buffer':
          meta.response = ctx.path
          break
        default:
      }

      //接口非正确返回要单独标志
      if (meta.response && meta.response.success === false) {
        app.logger.warn('[response]', JSON.stringify(meta))
      }
      else {
        app.logger.info('[response]', JSON.stringify(meta))
      }
    });
  }
};
