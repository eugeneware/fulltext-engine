var nlp = require('./nlp'),
    andStream = require('and-stream'),
    orStream = require('joiner-stream'),
    tokenizeWords = nlp.tokenizeWords;

module.exports = fulltextEngine;
function fulltextEngine(opts) {
  if (typeof opts === 'boolean') { // backwards compatibility
    opts = {
      fuzzy: opts
    };
  }
  opts = opts || {};
  opts.fuzzy = opts.fuzzy || false;
  opts.stopwords = opts.stopwords || null;

  return {
    options: opts,
    query: query,
    match: match,
    plans: {
      'fulltext': fulltextPlan,
    }
  };
}

module.exports.index = index;
function index(prop) {
  return function (key, value, emit, options) {
    var db = this;
    var _prop = prop || (options && options.name);
    var val;
    if (value && _prop &&
       (val = fetchProp(value, _prop.split('.'))) !== undefined) {
      tokenizeWords(val, db.query.engine.options).forEach(emit);
    }
  };
}

function keyfn(index) {
  return index.key[index.key.length - 1];
}

function fulltextPlan(idx, tokens, type) {
  var db = this;
  var s = (type === 'and') ? andStream(keyfn) : orStream();
  if (tokens.length === 0) {
    tokens.push('');
  }
  tokens.forEach(function (token) {
    idx.createIndexStream({
      start: [token, null],
      end: [token, undefined]
    })
    .pipe(type === 'and' ? s.stream() : s);
  });
  return s;
}

function query(prop, q, type) {
  type = type || 'and';
  type = type.toLowerCase();
  var db = this;
  var idx = db.indexes[prop];
  if (idx && idx.type in db.query.engine.plans) {
    var path = prop.split('.');
    var tokens = tokenizeWords(q, db.query.engine.options);
    return db.query.engine.plans[idx.type].call(db, idx, tokens, type);
  } else {
    return null;
  }
}

function match(obj, prop, q, type) {
  type = type || 'and';
  var db = this;
  var path = prop.split('.');

  var needles = tokenizeWords(q, db.query.engine.options);
  var haystack = tokenizeWords(fetchProp(obj, path), db.query.engine.options);
  var hits = needles.reduce(
    function (acc, needle) {
      return acc + (~haystack.indexOf(needle) ? 1 : 0);
    }, 0);
  if (type === 'and') {
    return hits === needles.length;
  } else {
    return hits > 0;
  }
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
