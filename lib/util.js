'use strict';

const Flattenr = require("flattenr");

module.exports = {

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


  getErrorData(err){

    if (err instanceof Error) {
      err = new Error(err)
    }
    return {
      name: err.name,
      message: err.message,
      stack: err.stack ? err.stack.replace(/\n|\s+|:/g, ',').replace(/,,|,/g, ' ') : ''
    }
  },

  getHtmlInfo(html = '') {
    /*
    "<!DOCTYPE html>\r\n<html>\r\n<head>\r\n    <meta charset=utf-8>\r\n    <meta name=viewport content=\"width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no\">\r\n    <meta name=screen-orientation content=portrait>\r\n    <meta name=apple-mobile-web-app-capable content=yes>\r\n    <meta name=format-detection content=\"telephone=no\">\r\n    <meta name=full-screen content=yes>\r\n    <meta name=x5-fullscreen content=true>\r\n    <style>body, html {\r\n        width: 100%;\r\n        height: 100%;\r\n    }</style>\r\n    <script type=\"text/javascript\">\r\n      window.config = {\r\n        appId: 'ww62cb43b2c001376e',\r\n        timestamp: '1533182982',\r\n        nonceStr: 'mb1lo87xmze',\r\n        signature: '9cd343f76183c61d8b5fa48d46a88458c88019b2',\r\n      }\r\n    </script>\r\n    <title>定制专属title>\r\n    <link href=//scdn.xchanger.cn/ecarx-web/WeChatGame-dev/static/css/app.css?v=1533182982635 rel=stylesheet>\r\n</head>\r\n<body>\r\n<div id=app></div>\r\n<script type=text/javascript src=http://res.wx.qq.com/open/js/jweixin-1.0.0.js></script>\r\n<script src=https://cdn.bootcss.com/fabric.js/2.0.0-rc.3/fabric.min.js></script>\r\n<script src=static/js/jquery-1.11.0.min.js></script>\r\n<script src=static/js/exif.js></script>\r\n<script type=text/javascript src=//scdn.xchanger.cn/ecarx-web/WeChatGame-dev/static/js/manifest.js?v=1533182982635></script>\r\n<script type=text/javascript src=//scdn.xchanger.cn/ecarx-web/WeChatGame-dev/static/js/vendor.js?v=1533182982635></script>\r\n<script type=text/javascript src=//scdn.xchanger.cn/ecarx-web/WeChatGame-dev/static/js/app.js?v=1533182982635></script>\r\n</body>\r\n</html>"}
    */
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