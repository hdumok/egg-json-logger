'use strict';

const util = require('./lib/util')

module.exports = app => {

  ['error', 'warn', 'info', 'debug'].forEach(level => {
    const LEVEL = Symbol(level)
    app.logger[LEVEL] = app.logger[level];
    app.logger[level] = function (...args) {
      //格式化参数
      for (let i = 0, len = args.length; i < len; i++) {
        //错误对象重新封装
        if (args[i] instanceof Error) {
          args[i] = {
            error: util.getErrorJson(args[i])
          }
        }

        //对象序列化
        args[i] = typeof args[i] === 'string' ? args[i] : JSON.stringify(args[i])
      }
      app.logger[LEVEL](...args)
    };
  });

  let config = app.config.logger || {};

  //借助 module 缓存特性 传递日志类型, 在最终格式化输出日志时使用
  util.flattenr = !!config.flattenr
  util.stringify = !!config.stringify

  if (config.event.error) {

    app.on('error', (err, ctx) => {
      let meta = ctx && ctx.meta || {}

      Object.assign({}, meta, {
        origin: ctx.origin,
        ip: ctx.ip,
        host: ctx.host,
        method: ctx.method,
        path: ctx.path,
        url: ctx.url,
        body: ctx.request.body,
        query: ctx.query,
        params: ctx.params
      })

      app.logger.error('[error]', meta, err)
    });
  }

  if (config.event.request) {

    app.on('request', ctx => {

      if (util.checkIgnorePath(config.ingore)) return

      let meta = Object.assign({
        origin: ctx.origin,
        ip: ctx.ip,
        host: ctx.host,
        method: ctx.method,
        path: ctx.path,
        url: ctx.url,
        body: ctx.request.body,
        query: ctx.query,
      }, ctx.meta)

      app.logger.info('[request]', meta)
    });
  }

  if (config.event.response) {

    app.on('response', ctx => {

      if (util.checkIgnorePath(config.ingore)) return;

      let meta = Object.assign({
        origin: ctx.origin,
        ip: ctx.ip,
        host: ctx.host,
        method: ctx.method,
        path: ctx.path,
        url: ctx.url,
        body: ctx.request.body,
        query: ctx.query,
        params: ctx.params
      }, ctx.meta)

      meta.response = ctx.body

      switch (typeof meta.response) {
        case 'string':
          if (meta.response.indexOf('DOCTYPE') !== -1) {
            meta.response = util.getHtmlJson(meta.response)
          }
          break;
        case 'buffer':
          meta.response = ctx.path
          break
        default:
      }

      //接口非正确返回要单独标志
      if (meta.response && meta.response.success === false) {
        app.logger.warn('[response]', meta)
      }
      else {
        app.logger.info('[response]', meta)
      }
    });
  }
};
