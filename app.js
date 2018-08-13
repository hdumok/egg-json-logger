'use strict';

const {getHtmlInfo, getErrorData} = require('./lib/util')

module.exports = app => {

  process.on('uncaughtException', function (err) {
    app.logger.error('[uncaughtException]', JSON.stringify({error: getErrorData(err)}))
  })

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

    meta.error = getErrorData(err)

    app.logger.error('[error]', JSON.stringify(meta))
  });

  app.on('request', ctx => {

    let ignore = app.config.logger.ignore || [];
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

  app.on('response', ctx => {

    let ignore = app.config.logger.ignore || [];
    if (ignore.indexOf(ctx.path) !== -1) return;

    try {

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
            meta.response = getHtmlInfo(meta.response)
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
    }
    catch (err) {
      app.logger.error('[response.error]', JSON.stringify({error: getErrorData(err)}))
    }
  });
};
