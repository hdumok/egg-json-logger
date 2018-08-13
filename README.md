# egg-ecarx-logger

<!--
基于egg内置的logger, 二次封装，JSON化输出logger
-->

## Install

```bash
$ npm i egg-json-logger --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.logger = {
  enable: true,
  package: 'egg-ecarx-logger',
};
```

```
//由于暂时无法 在插件扩展的 extend.js 里覆盖egg 内置extend的属性(logger), 只能具体服务里的extend.js里覆盖
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

## Configuration

```js
// {app_root}/config/config.default.js
exports.logger = {
    
};
```

see [config/config.default.js](config/config.default.js) for more detail.