# fulltext-engine

Query your levelup/leveldb engine using full text search phrases **with INDEXES**.

This is a plugin for [level-queryengine](https://github.com/eugeneware/level-queryengine).

[![build status](https://secure.travis-ci.org/eugeneware/fulltext-engine.png)](http://travis-ci.org/eugeneware/fulltext-engine)

## Installation

Install through npm:

```
$ npm install fulltext-engine
```

## Usage

``` js
var levelQuery = require('level-queryengine'),
    fulltextEngine = require('fulltext-engine'),
    levelup = require('levelup'),
    db = levelQuery(levelup('my-db'));

db.query.use(fulltextEngine());

// index the properties you want (the 'doc' property on objects in this case):
db.ensureIndex('doc', 'fulltext', fulltextEngine.index());

db.batch(makeSomeData(), function (err) {
  // will find all objects where 'my' and 'query' are present
  db.query('doc', 'my query')
    .on('data', console.log)
    .on('stats', function (stats) {
      // stats contains the query statistics in the format
      //  { indexHits: 1, dataHits: 1, matchHits: 1 });
    });

  // will find all objects where 'my' OR 'query' are present
  db.query('doc', 'my query', 'or')
    .on('data', console.log)
    .on('stats', function (stats) {
      // stats contains the query statistics in the format
      //  { indexHits: 1, dataHits: 1, matchHits: 1 });
    });
});
```

## Indexing Strategy Support

Currently only one index strategy is supported:

* `'fulltext'` (default) - full text index the property defined by the `indexName`.

Note: if you want to index another property with a different name than the
`indexName` then pass the property path through to the constructor of the
`fulltextEngine.index()` function.

``` js
db.query.use(fulltextEngine());

// index 'stringfield' property of objects
db.ensureIndex('stringfield', 'fulltext', fulltextEngine.index());

// index the 'anotherName' property of objects but store it in the 'oneName' index
db.ensureIndex('oneName', 'fulltext', fulltextEngine.index('anotherName'));
```

## When indexes aren't present

If a full text index is not present for a query, then it will result in a full
leveldb "table" scan. You will get the same results as an index query, it will
just take longer.

The result stream that gets returned from `db#query` also emits `'stats'` events
so you can tell if an index did or didn't get used.

``` js
  db.query('doc', 'my query', 'or')
    .on('data', console.log)
    .on('stats', function (stats) {
      // stats looks like this if an index got used
      //  { indexHits: 1, dataHits: 1, matchHits: 1 });

      // stats looks like this if an index did not get used
      //  { indexHits: 0, dataHits: 100, matchHits: 1 });
    });
```

## API

### fulltextEngine([fuzzy])

Returns a full text engine query engine for use with `level-queryEngine`.

Note: you can pass an optional boolean parameter to the contructor of the fulltextEngine
factory function if you want to use a "fuzzy" search similar sounding words will
match; (eg. "for" and "fear" would match under the fuzzy match).

### fulltextEngine.index([propertyToIndex])

Returns a full text engine indexing strategy to use with `db.ensureIndex`.

If not provided, the `ensureIndex` will index the object path defined by the index name.

### db.query(pathName, searchText, [andOr])

Will seach the object path `pathName` for the presence of `searchText`. The
default search is an AND (ie. all search terms must be present). You can also
pass in `'or'` if you want to match any documents that have ANY of the search
terms present.

## TODO

This project is under active development. Here's a list of things I'm planning to add:

* indexing the frequency of words as well and use it to rank better matching documents higher.
* proper Information Retrieval ranking algorithms

