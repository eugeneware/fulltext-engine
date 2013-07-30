var natural = require('natural');

exports.words = words;
function words (str){
  return String(str).match(/\w+/g);
}

exports.stem = stem;
function stem (words) {
  var ret = [];
  for (var i = 0, len = words.length; i < len; ++i) {
    ret.push(natural.PorterStemmer.stem(words[i]));
  }
  return ret;
}

exports.stripStopWords = stripStopWords;
function stripStopWords(words) {
  var ret = [];
  if (words) {
    for (var i = 0, len = words.length; i < len; ++i) {
      if (~natural.stopwords.indexOf(words[i])) continue;
      ret.push(words[i]);
    }
  }
  return ret;
}

exports.countWords = countWords;
function countWords(words) {
  var obj = {};
  for (var i = 0, len = words.length; i < len; ++i) {
    obj[words[i]] = (obj[words[i]] || 0) + 1;
  }
  return obj;
}

exports.metaphoneMap = metaphoneMap;
function metaphoneMap(words){
  var obj = {};
  for (var i = 0, len = words.length; i < len; ++i) {
    obj[words[i]] = natural.Metaphone.process(words[i]);
  }
  return obj;
}

exports.metaphoneArray = metaphoneArray;
function metaphoneArray(words) {
  var arr = []
    , constant;
  for (var i = 0, len = words.length; i < len; ++i) {
    constant = natural.Metaphone.process(words[i]);
    if (!~arr.indexOf(constant)) arr.push(constant);
  }
  return arr;
}

exports.tokenizeWords = tokenizeWords;
function tokenizeWords(text, fuzzy) {
  var _words = stem(stripStopWords(words(text)));
  if (!fuzzy) return _words;

  var map = metaphoneMap(_words);
  return Object.keys(map).map(
    function (word) {
      return map[word];
    });
}
