# egg-json-logger

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-json-logger.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-json-logger
[travis-image]: https://img.shields.io/travis/eggjs/egg-json-logger.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-json-logger
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-json-logger.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-json-logger?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-json-logger.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-json-logger
[download-image]: https://img.shields.io/npm/dm/egg-json-logger.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-json-logger

    JSON 化输出logger, 使用 阿里云日志服务 => LogStore => 采集日志 => 文本格式日志 => JSON模式

## Install

```bash
$ npm i egg-json-logger --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.logger = {
  enable: true,
  package: 'egg-json-logger',
};
```

```
//由于暂时无法 在插件扩展的 extend.js 里覆盖egg内置extend的属性(logger),
//只能具体服务里的extend.js里覆盖
// {app_root}/app/extend/context.js
module.exports = {
  get logger() {
    return this.jsonLogger
  },

  get coreLogger() {
    return this.jsonLogger
  }
 }
 ```

### controller/service
    this.logger.info('日志的关键字', '日志的内容1', '日志的内容2'...)
### middleware/model
    app.logger.info('[middlewave.中间件文件名称]', '日志的关键字', '日志的内容1', '日志的内容2'...)
    app.logger.info('[model.模型文件名称]', '日志的关键字', '日志的内容1', '日志的内容2'...)
## app.js
    app.logger.info('[任何from]', '日志的关键字', '日志的内容1', '日志的内容2'...)
## Configuration

```js
// {app_root}/config/config.default.js
exports.logger = {

  // 在 已有的 logger 扩展配置参数，以下是默认的扩展参数
  // 忽略 request/reponse 日志的路由, 用于过滤存活检测/静态资源等路由， 支持字符和正则
  ingore: ['/', /.+\.{html|css|js}/],

  event: {
    // 是否输出 request/reponse/error 事件日志
    request: true,
    response: true,
    error: true,
  },
};
```


## Description
* 基于egg内置的logger, 二次封装，JSON化输出logger
* 内置了 date, level ，pid，hostname 常规信息
* 内置了 from 字段，标识日志从哪个 第三方模块/controller文件的方法/service文件的方法输出的日志，middleware/model需要手动在第一个参数中输出
* 内置了 reqid 字段，串联某一次请求的所有日志
* 格式化 request/response/error 事件信息打印，这两种日志比普通日志多了 ip/method/origin/path/url等信息 和 query/params/body信息(如果有的话)
* 日志落盘时对内容都做了 扁平化处理 + 序列化处理
* 渲染页面返回时，提取 html 内容 里面第一个 json 对象 赋值到 response ，方便排查

## Example
### 请求 GET http://127.0.0.1:7001/index/123?key=123
```
//request event log
{
    level: 'INFO',
    date: '2018-08-08 16:00:43',
    pid: 6535,
    hostname: 'MokdeMacBook-Pro.local',
    from: 'request',
    //请求贯穿整条线
    reqid: '403229b7-84f0-454d-a906-a09992ea6ada',
    ip: '127.0.0.1',
    origin: 'http://127.0.0.1:7001',
    host: '127.0.0.1:7001',
    method: 'GET',
    path: '/index/123',
    url: '/index/123?key=123',
    //三种参数位置都会打印
    body: {},
    query: { key: '123' },
    params: {},
    //有内容的会被展开
    'query.key': '123'
}
```

```
//controller/service log
this.logger.info('massage', {obj: 123}, [{arroy: 123}])
{
    level: 'INFO',
    date: '2018-08-08 16:00:43',
    pid: 6535,
    hostname: 'MokdeMacBook-Pro.local',
    from: 'controller.home',
    log1: 'massage',

    //string化的 和 扁平化的对象形式都有
    log2: { obj: 123 },
    'log2.obj': 123,

    log3: [ { arroy: 123 } ],
    'log3.0.arroy': 123,
    reqid: '403229b7-84f0-454d-a906-a09992ea6ada',
    uid: '',
    use: 8
}
{
    level: 'DEBUG',
    date: '2018-08-08 16:00:43',
    pid: 6535,
    hostname: 'MokdeMacBook-Pro.local',
    from: 'controller.home',
    log1: 'massage',
    'log2.obj': 123,
    log2: { obj: 123 },
    'log3.0.arroy': 123,
    log3: [ { arroy: 123 } ],
    reqid: '403229b7-84f0-454d-a906-a09992ea6ada',
    uid: '',
    use: 8
}
```
```
//error event log
{
    "level": "ERROR",
    "date": "2018-08-13 18:50:11",
    "pid": 6629,
    "hostname": "MokdeMacBook-Pro.local",
    "from": "error",
    "reqid": "a24c82dd-b58b-4652-ad70-395598e773d9",
    "ip": "127.0.0.1",
    "origin": "http://127.0.0.1:7001",
    "host": "127.0.0.1:7001",
    "method": "GET",
    "path": "/index/123",
    "url": "/index/123?key=123",
    "body": {},
    "query": {"key": "123"},
    "params": {"abc": "123"},
    "error": {
      "name": "Error",
      "message": "ReferenceError: hi is not defined",
      "stack": "Error ReferenceError hi is not defined at getErrorJson (/Users/mok/Desktop/x-standard/node_modules/egg-json-logger/lib/util.js 33 13) at Application.app.on (/Users/mok/Desktop/x-standard/node_modules/egg-json-logger/app.js 29 20) at emitTwo (events.js 131 20) at Application.emit (events.js 214 7) at /Users/mok/Desktop/x-standard/node_modules/egg-ecarx-interface/app/middleware/interface.js 29 17 at _combinedTickCallback (internal/process/next_tick.js 131 7) at process._tickCallback (internal/process/next_tick.js 180 9)"
    },
    "query.key": "123",
    "params.abc": "123",
    "error.name": "Error",
    "error.message": "ReferenceError: hi is not defined",
    "error.stack": "Error ReferenceError hi is not defined at getErrorJson (/Users/mok/Desktop/x-standard/node_modules/egg-json-logger/lib/util.js 33 13) at Application.app.on (/Users/mok/Desktop/x-standard/node_modules/egg-json-logger/app.js 29 20) at emitTwo (events.js 131 20) at Application.emit (events.js 214 7) at /Users/mok/Desktop/x-standard/node_modules/egg-ecarx-interface/app/middleware/interface.js 29 17 at _combinedTickCallback (internal/process/next_tick.js 131 7) at process._tickCallback (internal/process/next_tick.js 180 9)"
}

```

```
// response event log
{
    level: 'WARN',
    date: '2018-08-08 16:00:43',
    pid: 6535,
    hostname: 'MokdeMacBook-Pro.local',
    from: 'response',
    reqid: '403229b7-84f0-454d-a906-a09992ea6ada',
    uid: '',
    use: 15,
    ip: '127.0.0.1',
    host: '127.0.0.1:7001',
    origin: 'http://127.0.0.1:7001',
    method: 'GET',
    path: '/index/123',
    url: '/index/123?key=123',
    body: {},
    query: { key: '123' },
    params: { abc: '123' },
    'query.key': '123',
    'params.abc': '123',
    response: {
       success: false,
       code: 500,
       message: 'hi is not defined',
       data: ''
    }
    'response.success': false,
    'response.code': 500,
    'response.message': 'hi is not defined',
    'response.data': ''
}
```