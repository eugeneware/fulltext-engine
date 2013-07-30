var nlp = require('./nlp'),
    andStream = require('and-stream'),
    tokenizeWords = nlp.tokenizeWords;

module.exports = fulltextEngine;
function fulltextEngine() {
  return {
    query: query,
    match: match,
    plans: {
      'fulltext': fulltextPlan,
    }
  };
}

module.exports.index = index;
function index(prop) {
  return function (key, value, emit) {
    var val;
    if (value && prop && (val = fetchProp(value, prop.split('.'))) !== undefined) {
      tokenizeWords(val).forEach(emit);
    }
  };
}

function keyfn(index) {
  return index.key[index.key.length - 1];
}

function fulltextPlan(idx, tokens) {
  var db = this;
  var and = andStream(keyfn);
  tokens.forEach(function (token) {
    idx.createIndexStream({
      start: [token, null],
      end: [token, undefined]
    })
    .pipe(and.stream());
  });
  return and;
}

function query(prop, q) {
  var db = this;
  var path = prop.split('.');
  var tokens = tokenizeWords(q);
  var idx = db.indexes[prop];
  if (idx && idx.type in db.query.engine.plans) {
    return db.query.engine.plans[idx.type].call(db, idx, tokens);
  } else {
    return null;
  }
}

function match(prop, q, obj) {
  var path = prop.split('.');

  var needles = tokenizeWords(q);
  var haystack = tokenizeWords(fetchProp(obj, path));
  return needles.reduce(
    function (acc, needle) {
      return acc && ~haystack.indexOf(needle);
    }, true);
}

function fetchProp(obj, path) {
  while (path.length > 0) {
    var prop = path.shift();
    if (obj[prop] !== undefined) {
      obj = obj[prop];
    } else {
      return;
    }
  }
  return obj;
}
