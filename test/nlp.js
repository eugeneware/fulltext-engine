var expect = require('chai').expect,
    nlp = require('../nlp');

describe('nlp functions', function () {
  var doc = 'Blessed are the undefiled in the way, who walk in the law of the LORD.';

  it('should be able to break some text into words', function(done) {
    var words = nlp.words(doc);
    expect(words).to.deep.equals(
      [ 'Blessed', 'are', 'the', 'undefiled', 'in', 'the', 'way', 'who',
        'walk', 'in', 'the', 'law', 'of', 'the', 'LORD' ]);
    done();
  });

  it('should be able to stem words', function(done) {
    var stems = nlp.stem(nlp.words(doc));
    expect(stems).to.deep.equals(
      [ 'bless', 'are', 'the', 'undefiled', 'in', 'the', 'wai', 'who', 'walk',
        'in', 'the', 'law', 'of', 'the', 'lord' ]);
    done();
  });

  it('should be able to strip stop words', function(done) {
    var words = nlp.stripStopWords(nlp.words(doc));
    expect(words).to.deep.equals(
      [ 'Blessed', 'undefiled', 'walk', 'law', 'LORD' ]);
    done();
  });

  it('should be able to count words', function(done) {
    var words = nlp.countWords(nlp.words(doc));
    expect(words).to.deep.equals({ Blessed: 1, are: 1, the: 4, undefiled: 1,
      in: 2, way: 1, who: 1, walk: 1, law: 1, of: 1, LORD: 1 });
    done();
  });

  it('should be able to metaphone map words', function(done) {
    var words = nlp.metaphoneMap(nlp.words(doc));
    expect(words).to.deep.equals({ Blessed: 'BLST', are: 'AR', the: '0',
      undefiled: 'UNTFLT', in: 'IN', way: 'W', who: 'W', walk: 'WLK',
      law: 'L', of: 'OF', LORD: 'LRT' });
    done();
  });

  it('should be able to metaphone an array of words', function(done) {
    var words = nlp.metaphoneArray(nlp.words(doc));
    expect(words).to.deep.equals([ 'BLST', 'AR', '0', 'UNTFLT', 'IN', 'W',
      'WLK', 'L', 'OF', 'LRT' ]);
    done();
  });
});
