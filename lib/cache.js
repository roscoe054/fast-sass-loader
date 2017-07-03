'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = require('./utils'

// 编译缓存
// cache = {
//   <entry>: {
//      mtime: <Number>,            // 修改时间
//      writeTimes: <Number>,       // 编译次数
//      readTimes: <Number>,        // 读取次数 (自最后一次编译)
//      lastCompile: <Number>,      // 最后一次编译
//      result: <String>,           // 编译结果
//      dependencies: {             // 依赖文件状态
//          <file>: <Number>,       // 依赖文件以及修改时间
//          ...
//      }
//   },
//   ...
// }
);var CACHE_STORE = {};

/**
 * Cache
 *
 * Usage:
 *
 * let cache = new Cache(entry)
 *
 * if (cache.isValid()) {
 *   return cache.read()
 * } else {
 *   // compile sass ....
 *   cache.write(dependencies, result.css.toString())
 * }
 */

var Cache = function () {
  function Cache(entry) {
    _classCallCheck(this, Cache);

    this.entry = entry;
  }

  _createClass(Cache, [{
    key: 'isValid',
    value: function isValid() {
      if (!(this.entry in CACHE_STORE)) {
        return false;
      }

      var cache = CACHE_STORE[this.entry];
      var estat = utils.fstat(this.entry

      // 文件不存在, 或时间不正确
      );if (!estat || estat.mtime.getTime() !== cache.mtime) {
        return false;
      }

      for (var depFile in cache.dependencies) {
        if (!cache.dependencies.hasOwnProperty(depFile)) {
          continue;
        }

        var mtime = cache.dependencies[depFile];
        var dstat = utils.fstat(depFile);

        if (!dstat || dstat.mtime.getTime() !== mtime) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: 'read',
    value: function read() {
      if (this.entry in CACHE_STORE) {
        var cache = CACHE_STORE[this.entry];
        cache.readTimes++;

        return cache.result;
      } else {
        return false;
      }
    }
  }, {
    key: 'getDependencies',
    value: function getDependencies() {
      if (this.entry in CACHE_STORE) {
        var cache = CACHE_STORE[this.entry];

        return Object.keys(cache.dependencies);
      } else {
        return [];
      }
    }
  }, {
    key: 'markInvalid',
    value: function markInvalid() {
      delete CACHE_STORE[this.entry];
    }
  }, {
    key: 'write',
    value: function write(dependencies, result) {
      var cache = CACHE_STORE[this.entry];

      if (!cache) {
        CACHE_STORE[this.entry] = cache = {
          mtime: 0,
          writeTimes: 0,
          readTimes: 0,
          lastCompile: Date.now(),
          result: null,
          dependencies: {}
        };
      }

      cache.mtime = utils.fstat(this.entry).mtime.getTime();
      cache.writeTimes++;
      cache.readTimes = 0;
      cache.result = result;
      cache.dependencies = {};

      for (var i = 0; i < dependencies.length; i++) {
        var depFile = dependencies[i];
        var dstat = utils.fstat(depFile);

        cache.dependencies[depFile] = dstat ? dstat.mtime.getTime() : 0;
      }
    }
  }]);

  return Cache;
}();

module.exports = Cache;
