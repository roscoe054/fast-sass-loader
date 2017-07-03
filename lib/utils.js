'use strict';

var fs = require('fs');

var utils = {
  fstat: function fstat(file) {
    try {
      return fs.statSync(file);
    } catch (err) {
      return false;
    }
  },
  findComments: function findComments(text) {
    var ranges = [];
    var ruleMap = {
      '//': '\n',
      '/*': '*/'
    };
    var startRule = /\/\/|\/\*/g;
    var matches = void 0;

    while (matches = startRule.exec(text)) {
      // eslint-disable-line
      var endChars = ruleMap[matches[0]];
      var start = startRule.lastIndex - matches[0].length;
      var end = text.indexOf(endChars, startRule.lastIndex);

      if (end < 0) {
        end = Infinity;
      }

      ranges.push([start, end]);

      startRule.lastIndex = end;
    }

    return ranges;
  }
};

module.exports = utils;
