var expect = require('chai').expect,
    bytewise = require('byteup')(),
    levelup = require('levelup'),
    path = require('path'),
    levelQuery = require('level-queryengine'),
    fulltextEngine = require('..'),
    rimraf = require('rimraf');

describe('fulltext-engine', function() {
  var db, dbPath = path.join(__dirname, '..', 'data', 'test-db');

  beforeEach(function(done) {
    rimraf.sync(dbPath);
    db = levelup(dbPath, { keyEncoding: 'bytewise', valueEncoding: 'json' }, done);
  });

  afterEach(function(done) {
    db.close(done);
  });

  it('should be able to index a document (non fuzzy)', function(done) {
    db = levelQuery(db);

    db.query.use(fulltextEngine());
    db.ensureIndex('doc', 'fulltext', fulltextEngine.index());

    db.batch(testData(), doQuery);
    function doQuery(err) {
      if (err) return done(err);
      var hits = 0;
      db.query('doc', 'fear word', 'and')
        .on('data', function (data) {
          hits++;
        })
        .on('stats', function (stats) {
          expect(stats).to.deep.equals(
            { indexHits: 2, dataHits: 2, matchHits: 2 });
        })
        .on('end', function () {
          expect(hits).to.deep.equals(2);
          done();
        });
    }
  });

  it('should be able to index a document (fuzzy)', function(done) {
    db = levelQuery(db);

    db.query.use(fulltextEngine(true));
    db.ensureIndex('doc', 'fulltext', fulltextEngine.index());

    db.batch(testData(), doQuery);
    function doQuery(err) {
      if (err) return done(err);
      var hits = 0;
      db.query('doc', 'fear word', 'and')
        .on('data', function (data) {
          hits++;
        })
        .on('stats', function (stats) {
          expect(stats).to.deep.equals(
            { indexHits: 3, dataHits: 3, matchHits: 3 });
        })
        .on('end', function () {
          expect(hits).to.deep.equals(3);
          done();
        });
    }
  });

  it('should be able to search with ors', function(done) {
    db = levelQuery(db);

    db.query.use(fulltextEngine());
    db.ensureIndex('doc', 'fulltext', fulltextEngine.index());

    db.batch(testData(), doQuery);
    function doQuery(err) {
      if (err) return done(err);
      var hits = 0;
      db.query('doc', 'fear word', 'or')
        .on('data', function (data) {
          hits++;
        })
        .on('stats', function (stats) {
          expect(stats).to.deep.equals(
            { indexHits: 26, dataHits: 24, matchHits: 2 });
        })
        .on('end', function () {
          expect(hits).to.deep.equals(2);
          done();
        });
    }
  });
});

function testData() {
  var docs =
  [
    'Blessed are the undefiled in the way, who walk in the law of the LORD.',
    'Blessed are they that keep his testimonies, and that seek him with the whole heart.',
    'They also do no iniquity: they walk in his ways.',
    'Thou hast commanded us to keep thy precepts diligently.',
    'O that my ways were directed to keep thy statutes!',
    'Then shall I not be ashamed, when I have respect unto all thy commandments.',
    'I will praise thee with uprightness of heart, when I shall have learned thy righteous judgments.',
    'I will keep thy statutes: O forsake me not utterly.',
    'Wherewithal shall a young man cleanse his way? by taking heed thereto according to thy word.',
    'With my whole heart have I sought thee: O let me not wander from thy commandments.',
    'Thy word have I hid in mine heart, that I might not sin against thee.',
    'Blessed art thou, O LORD: teach me thy statutes.',
    'With my lips have I declared all the judgments of thy mouth.',
    'I have rejoiced in the way of thy testimonies, as much as in all riches.',
    'I will meditate in thy precepts, and have respect unto thy ways.',
    'I will delight myself in thy statutes: I will not forget thy word.',
    'Deal bountifully with thy servant, that I may live, and keep thy word.',
    'Open thou mine eyes, that I may behold wondrous things out of thy law.',
    'I am a stranger in the earth: hide not thy commandments from me.',
    'My soul breaketh for the longing that it hath unto thy judgments at all times.',
    'Thou hast rebuked the proud that are cursed, which do err from thy commandments.',
    'Remove from me reproach and contempt; for I have kept thy testimonies.',
    'Princes also did sit and speak against me: but thy servant did meditate in thy statutes.',
    'Thy testimonies also are my delight and my counsellors.',
    'My soul cleaveth unto the dust: quicken thou me according to thy word.',
    'I have declared my ways, and thou heardest me: teach me thy statutes.',
    'Make me to understand the way of thy precepts: so shall I talk of thy wondrous works.',
    'My soul melteth for heaviness: strengthen thou me according unto thy word.',
    'Remove from me the way of lying: and grant me thy law graciously.',
    'I have chosen the way of truth: thy judgments have I laid before me.',
    'I have stuck unto thy testimonies: O LORD, put me not to shame.',
    'I will run the way of thy commandments, when thou shalt enlarge my heart.',
    'Teach me, O LORD, the way of thy statutes; and I shall keep it unto the end.',
    'Give me understanding, and I shall keep thy law; yea, I shall observe it with my whole heart.',
    'Make me to go in the path of thy commandments; for therein do I delight.',
    'Incline my heart unto thy testimonies, and not to covetousness.',
    'Turn away mine eyes from beholding vanity; and quicken thou me in thy way.',
    'Stablish thy word unto thy servant, who is devoted to thy fear.',
    'Turn away my reproach which I fear: for thy judgments are good.',
    'Behold, I have longed after thy precepts: quicken me in thy righteousness.',
    'Let thy mercies come also unto me, O LORD, even thy salvation, according to thy word.',
    'So shall I have wherewith to answer him that reproacheth me: for I trust in thy word.',
    'And take not the word of truth utterly out of my mouth; for I have hoped in thy judgments.',
    'So shall I keep thy law continually for ever and ever.',
    'And I will walk at liberty: for I seek thy precepts.',
    'I will speak of thy testimonies also before kings, and will not be ashamed.',
    'And I will delight myself in thy commandments, which I have loved.',
    'My hands also will I lift up unto thy commandments, which I have loved; and I will meditate in thy statutes.',
    'Remember the word unto thy servant, upon which thou hast caused me to hope.',
    'This is my comfort in my affliction: for thy word hath quickened me.',
    'The proud have had me greatly in derision: yet have I not declined from thy law.',
    'I remembered thy judgments of old, O LORD; and have comforted myself.',
    'Horror hath taken hold upon me because of the wicked that forsake thy law.',
    'Thy statutes have been my songs in the house of my pilgrimage.',
    'I have remembered thy name, O LORD, in the night, and have kept thy law.',
    'This I had, because I kept thy precepts.',
    'Thou art my portion, O LORD: I have said that I would keep thy words.',
    'I intreated thy favour with my whole heart: be merciful unto me according to thy word.',
    'I thought on my ways, and turned my feet unto thy testimonies.',
    'I made haste, and delayed not to keep thy commandments.',
    'The bands of the wicked have robbed me: but I have not forgotten thy law.',
    'At midnight I will rise to give thanks unto thee because of thy righteous judgments.',
    'I am a companion of all them that fear thee, and of them that keep thy precepts.',
    'The earth, O LORD, is full of thy mercy: teach me thy statutes.',
    'Thou hast dealt well with thy servant, O LORD, according unto thy word.',
    'Teach me good judgment and knowledge: for I have believed thy commandments.',
    'Before I was afflicted I went astray: but now have I kept thy word.',
    'Thou art good, and doest good; teach me thy statutes.',
    'The proud have forged a lie against me: but I will keep thy precepts with my whole heart.',
    'Their heart is as fat as grease; but I delight in thy law.',
    'It is good for me that I have been afflicted; that I might learn thy statutes.',
    'The law of thy mouth is better unto me than thousands of gold and silver.',
    'Thy hands have made me and fashioned me: give me understanding, that I may learn thy commandments.',
    'They that fear thee will be glad when they see me; because I have hoped in thy word.',
    'I know, O LORD, that thy judgments are right, and that thou in faithfulness hast afflicted me.',
    'Let, I pray thee, thy merciful kindness be for my comfort, according to thy word unto thy servant.',
    'Let thy tender mercies come unto me, that I may live: for thy law is my delight.',
    'Let the proud be ashamed; for they dealt perversely with me without a cause: but I will meditate in thy precepts.',
    'Let those that fear thee turn unto me, and those that have known thy testimonies.',
    'Let my heart be sound in thy statutes; that I be not ashamed.',
    'My soul fainteth for thy salvation: but I hope in thy word.',
    'Mine eyes fail for thy word, saying, When wilt thou comfort me?',
    'For I am become like a bottle in the smoke; yet do I not forget thy statutes.',
    'How many are the days of thy servant? when wilt thou execute judgment on them that persecute me?',
    'The proud have digged pits for me, which are not after thy law.',
    'All thy commandments are faithful: they persecute me wrongfully; help thou me.',
    'They had almost consumed me upon earth; but I forsook not thy precepts.',
    'Quicken me after thy lovingkindness; so shall I keep the testimony of thy mouth.',
    'For ever, O LORD, thy word is settled in heaven.',
    'Thy faithfulness is unto all generations: thou hast established the earth, and it abideth.',
    'They continue this day according to thine ordinances: for all are thy servants.',
    'Unless thy law had been my delights, I should then have perished in mine affliction.',
    'I will never forget thy precepts: for with them thou hast quickened me.',
    'I am thine, save me; for I have sought thy precepts.',
    'The wicked have waited for me to destroy me: but I will consider thy testimonies.',
    'I have seen an end of all perfection: but thy commandment is exceeding broad.',
    'O how love I thy law! it is my meditation all the day.',
    'Thou through thy commandments hast made me wiser than mine enemies: for they are ever with me.',
    'I have more understanding than all my teachers: for thy testimonies are my meditation.',
    'I understand more than the ancients, because I keep thy precepts.'
  ];

  var batch = [];
  for (var i = 0; i < 100; i++) {
    var obj = {
      name: 'name ' + i,
      car: {
        make: 'Toyota',
        model: i % 2 ? 'Camry' : 'Corolla',
        year: 1993 + i
      },
      pets: [
        { species: 'Cat', breed: i == 50 ? 'Saimese' : 'Burmese' },
        { species: 'Cat', breed: 'DSH' },
        { species: 'Dog', breed: 'Dalmation' }
      ],
      tags: [
        'tag1', 'tag2', 'tag3'
      ],
      tagsNoIndex: [
        'tag1', 'tag2', 'tag3'
      ],
      tree: {
        a: i,
        b: i + 1,
      },
      treeNoIndex: {
        a: i,
        b: i + 1,
      },
      num: 10*i,
      numNoIndex: 10*i,
      doc: docs[i]
    };
    if (i === 42) {
      obj.tags.push('tag4');
      obj.tagsNoIndex.push('tag4');
    }
    if (i === 84) {
      delete obj.name;
    }
    batch.push({ type: 'put', key: i, value: obj });
  }

  return batch;
}
