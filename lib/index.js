'use strict';

if(!global.__babelPolyfill) {
    global.__babelPolyfill = require('babel-polyfill');
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _marked2 = [mergeSources].map(regeneratorRuntime.mark);

var path = require('path');
var fs = require('fs-promise');
var preview = require('cli-source-preview');
var replaceAsync = require('./replace');
var co = require('co');
var sass = require('node-sass-china');
var Cache = require('./cache');
var utils = require('./utils');
var loaderUtils = require('loader-utils');

var EXT_PRECEDENCE = ['.scss', '.sass', '.css'];
var MATCH_URL_ALL = /url\(\s*(['"]?)([^ '"()]+)(\1)\s*\)/g;
var MATCH_IMPORTS = /@import\s+(['"])([^,;'"]+)(\1)(\s*,\s*(['"])([^,;'"]+)(\1))*\s*;/g;
var MATCH_FILES = /(['"])([^,;'"]+)(\1)/g;

function getImportsToResolve(original, includePaths) {
  var extname = path.extname(original);
  var basename = path.basename(original, extname);
  var dirname = path.dirname(original);

  var imports = [];
  var names = [basename];
  var exts = [extname];

  if (!extname) {
    exts = EXT_PRECEDENCE;
  }
  if (extname && EXT_PRECEDENCE.indexOf(extname) === -1) {
    basename = path.basename(original);
    names = [basename];
    exts = EXT_PRECEDENCE;
  }
  if (basename[0] !== '_') {
    names.push('_' + basename);
  }

  for (var i = 0; i < names.length; i++) {
    for (var j = 0; j < exts.length; j++) {
      // search relative to original file
      imports.push(path.join(dirname, names[i] + exts[j])

      // search in includePaths
      );var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = includePaths[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var includePath = _step.value;

          imports.push(path.join(includePath, dirname, names[i] + exts[j]));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }

  return imports;
}

function getLoaderConfig(ctx) {
  var options = loaderUtils.getOptions(ctx) || {};
  var includePaths = options.includePaths || [];
  var basedir = ctx.options.context || process.cwd

  // convert relative to absolute
  ();for (var i = 0; i < includePaths.length; i++) {
    if (!path.isAbsolute(includePaths[i])) {
      includePaths[i] = path.join(basedir, includePaths[i]);
    }
  }

  return {
    basedir: basedir,
    includePaths: includePaths,
    baseEntryDir: path.dirname(ctx.resourcePath),
    root: options.root,
    data: options.data
  };
}

function mergeSources(opts, entry, resolve, dependencies, level) {
  var _marked, includePaths, content, entryDir, commentRanges, importReplacer;

  return regeneratorRuntime.wrap(function mergeSources$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          importReplacer = function importReplacer(total) {
            var range, finded, contents, matched, originalImport, err, imports, resolvedImport, i, reqFile, _err;

            return regeneratorRuntime.wrap(function importReplacer$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    // if current import is in comments, then skip it
                    range = this;
                    finded = commentRanges.find(function (commentRange) {
                      if (range.start >= commentRange[0] && range.end <= commentRange[1]) {
                        return true;
                      }
                    });

                    if (!finded) {
                      _context.next = 4;
                      break;
                    }

                    return _context.abrupt('return', total);

                  case 4:
                    contents = [];
                    matched = void 0;

                    // must reset lastIndex

                    MATCH_FILES.lastIndex = 0;

                  case 7:
                    if (!(matched = MATCH_FILES.exec(total))) {
                      _context.next = 48;
                      break;
                    }

                    // eslint-disable-line
                    originalImport = matched[2].trim();

                    if (originalImport) {
                      _context.next = 13;
                      break;
                    }

                    err = new Error('import file cannot be empty: "' + total + '" @' + entry);


                    err.file = entry;

                    throw err;

                  case 13:
                    imports = getImportsToResolve(originalImport, includePaths);
                    resolvedImport = void 0;
                    i = 0;

                  case 16:
                    if (!(i < imports.length)) {
                      _context.next = 34;
                      break;
                    }

                    if (!(path.isAbsolute(imports[i]) && fs.existsSync(imports[i]))) {
                      _context.next = 21;
                      break;
                    }

                    resolvedImport = imports[i];
                    _context.next = 31;
                    break;

                  case 21:
                    _context.prev = 21;
                    reqFile = loaderUtils.urlToRequest(imports[i], opts.root);
                    _context.next = 25;
                    return resolve(entryDir, reqFile);

                  case 25:
                    resolvedImport = _context.sent;
                    return _context.abrupt('break', 34);

                  case 29:
                    _context.prev = 29;
                    _context.t0 = _context['catch'](21);

                  case 31:
                    i++;
                    _context.next = 16;
                    break;

                  case 34:
                    if (resolvedImport) {
                      _context.next = 38;
                      break;
                    }

                    _err = new Error('import file cannot be resolved: "' + total + '" @' + entry);


                    _err.file = entry;

                    throw _err;

                  case 38:

                    resolvedImport = path.normalize(resolvedImport);

                    if (!(dependencies.indexOf(resolvedImport) < 0)) {
                      _context.next = 46;
                      break;
                    }

                    dependencies.push(resolvedImport);

                    _context.t1 = contents;
                    _context.next = 44;
                    return mergeSources(opts, resolvedImport, resolve, dependencies, level + 1);

                  case 44:
                    _context.t2 = _context.sent;

                    _context.t1.push.call(_context.t1, _context.t2);

                  case 46:
                    _context.next = 7;
                    break;

                  case 48:
                    return _context.abrupt('return', contents.join('\n'));

                  case 49:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _marked[0], this, [[21, 29]]);
          };

          _marked = [importReplacer].map(regeneratorRuntime.mark);

          level = level || 0;
          dependencies = dependencies || [];

          includePaths = opts.includePaths;
          content = false;

          if (!((typeof entry === 'undefined' ? 'undefined' : _typeof(entry)) === 'object')) {
            _context2.next = 11;
            break;
          }

          content = entry.content;
          entry = entry.file;
          _context2.next = 14;
          break;

        case 11:
          _context2.next = 13;
          return fs.readFile(entry, 'utf8');

        case 13:
          content = _context2.sent;

        case 14:

          if (opts.data) {
            content = opts.data + '\n' + content;
          }

          entryDir = path.dirname(entry);
          commentRanges = utils.findComments(content

          // replace url(...)
          );
          content = content.replace(MATCH_URL_ALL, function (total, left, file, right) {
            if (loaderUtils.isUrlRequest(file)) {
              // handle url(<loader>!<file>)
              var pos = file.lastIndexOf('!');
              if (pos >= 0) {
                left += file.substring(0, pos + 1);
                file = file.substring(pos + 1);
              }

              // test again
              if (loaderUtils.isUrlRequest(file)) {
                var absoluteFile = path.normalize(path.resolve(entryDir, file));
                var relativeFile = path.relative(opts.baseEntryDir, absoluteFile).replace(/\\/g, '/' // fix for windows path

                );if (relativeFile[0] !== '.') {
                  relativeFile = './' + relativeFile;
                }

                return 'url(' + left + relativeFile + right + ')';
              } else {
                return total;
              }
            } else {
              return total;
            }
          }

          // replace @import "..."
          );_context2.next = 20;
          return replaceAsync(content, MATCH_IMPORTS, co.wrap(importReplacer));

        case 20:
          return _context2.abrupt('return', _context2.sent);

        case 21:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked2[0], this);
}

module.exports = function (content) {
  var entry = this.resourcePath;
  var callback = this.async();
  var cache = new Cache(entry);
  var options = getLoaderConfig(this);
  var ctx = this;

  // for webpack 1
  this.cacheable();

  function resolver(ctx) {
    return function (dir, importFile) {
      return new Promise(function (resolve, reject) {
        ctx.resolve(dir, importFile, function (err, resolvedFile) {
          if (err) {
            reject(err);
          } else {
            resolve(resolvedFile);
          }
        });
      });
    };
  }

  return co(regeneratorRuntime.mark(function _callee() {
    var dependencies, merged, result, css;
    return regeneratorRuntime.wrap(function _callee$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            dependencies = [];

            if (!cache.isValid()) {
              _context3.next = 6;
              break;
            }

            cache.getDependencies().forEach(function (file) {
              ctx.dependency(file);
            });

            return _context3.abrupt('return', cache.read());

          case 6:
            _context3.next = 8;
            return mergeSources(options, {
              file: entry,
              content: content
            }, resolver(ctx), dependencies);

          case 8:
            merged = _context3.sent;


            dependencies.forEach(function (file) {
              ctx.dependency(file);
            });

            _context3.prev = 10;
            _context3.next = 13;
            return new Promise(function (resolve, reject) {
              sass.render({
                indentedSyntax: entry.endsWith('.sass'),
                file: entry,
                data: merged
              }, function (err, result) {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              });
            });

          case 13:
            result = _context3.sent;
            css = result.css.toString();


            cache.write(dependencies, css);

            return _context3.abrupt('return', css);

          case 19:
            _context3.prev = 19;
            _context3.t0 = _context3['catch'](10);

            console.log(preview(merged, _context3.t0, {
              offset: 10
            }));
            console.error(_context3.t0.stack || _context3.t0);

            throw _context3.t0;

          case 24:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee, this, [[10, 19]]);
  })).then(function (css) {
    callback(null, css);
  }, function (err) {
    // disabled cache
    cache.markInvalid

    // add error file as deps, so if file changed next time sass-loader will be noticed
    ();err.file && ctx.dependency(err.file);

    callback(err);
  });
};
