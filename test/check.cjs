// Content checks for Wilco. Run: npm test
// They need no network, no API key and no Electron.
const test = require('node:test');
const assert = require('node:assert/strict');
const knowledge = require('../knowledge.cjs');
const catalog = require('../catalog.json');

// The guide section each suggested question must reach, in catalog order.
// Several numbers mean that any of them answers the question.
const expected = {
  ops: [['T2'], ['T3'], ['T4'], ['T11'], ['T5'], ['T15']],
  techlog: [['3.3'], ['3.8'], ['3.7'], ['3.2']],
  sms: [['3.1'], ['3.4'], ['3.8'], ['3.6']],
  crew: [['13.'], ['13.'], ['4.', '6.', '14.'], ['4.'], ['13.'], ['17.']],
  frat: [['1.1', '3.3'], ['3.8'], ['3.8', '3.4'], ['3.9']],
  docgen: [['3.3', '3.4'], ['3.18'], ['3.18'], ['3.16']],
  audit: [['3.2'], ['3.6'], ['3.11'], ['3.17']]
};

test('every suggested question reaches its guide section', async t => {
  for (const product of catalog.filter(p => expected[p.id])) {
    for (const lang of ['en', 'it', 'fr', 'de']) {
      const questions = lang === 'en' ? product.questions : product.locales[lang].questions;
      for (const [index, question] of questions.entries()) {
        await t.test(`${product.id} ${lang}: ${question}`, () => {
          const found = knowledge.productContext(question, product.id).map(e => e.chapter.split(' ')[0]);
          const wanted = expected[product.id][index];
          assert.ok(found.some(number => wanted.includes(number)), `wanted ${wanted.join(' or ')}, found ${found.join(', ') || 'nothing'}`);
        });
      }
    }
  }
});

test('guide titles are in English and name the task', () => {
  const wrong = /\b(?:security bulletin|security meeting|close a signal|dangers in a relationship|make flights|sell a mission|azienda|copertura|sul campo)\b/i;
  for (const id of ['ops', 'techlog', 'sms', 'audit', 'docgen', 'frat']) {
    for (const item of knowledge.items(catalog, id, 'en').filter(item => item.key.endsWith('.title'))) {
      assert.doesNotMatch(item.text, wrong, `${item.key}: ${item.text}`);
    }
  }
});

test('a title override changes the chapter name that Wilco cites', t => {
  t.after(() => knowledge.load({}));
  knowledge.load({'ops/guide.T13.title': 'How do I invoice flights?'});
  const chapters = knowledge.productContext('Come fatturo i voli?', 'ops').map(e => e.chapter);
  assert.ok(chapters.includes('T13 How do I invoice flights?'), chapters.join(' | '));
});

test('a body override replaces the excerpt and keeps its verification line', t => {
  t.after(() => knowledge.load({}));
  knowledge.load({'ops/guide.T13.body': 'Open Invoices and press New.\n\n**Verification.** checked by the stand team.'});
  const entry = knowledge.productContext('Come fatturo i voli?', 'ops').find(e => e.chapter.startsWith('T13 '));
  assert.equal(entry.excerpt, 'Open Invoices and press New.\n\n**Verification.** checked by the stand team.');
});

test('a keyword override makes a section reachable with new words', t => {
  t.after(() => knowledge.load({}));
  assert.deepEqual(knowledge.productContext('zeppelin', 'ops'), []);
  knowledge.load({'ops/guide.T1.topics': 'zeppelin'});
  assert.match(knowledge.productContext('zeppelin', 'ops')[0].chapter, /^T1 /);
});

test('a CrewOverview chapter override replaces its text', t => {
  t.after(() => knowledge.load({}));
  knowledge.load({'crew/guide.09-certificates.md.body': '# 9. All certificates\n\n## Zeppelin licences\n\nZeppelin licences are stored here.'});
  const excerpts = knowledge.productContext('zeppelin licences', 'crew');
  assert.match(excerpts[0].excerpt, /Zeppelin licences are stored here/);
});

test('card overrides replace the text of one language only', t => {
  t.after(() => knowledge.load({}));
  knowledge.load({'ops/facts.fr': 'Texte du stand.', 'ops/questions.fr': 'Première ?\nDeuxième ?', 'ops/prompt.en': 'Stand prompt?'});
  const ops = knowledge.products(catalog).find(p => p.id === 'ops');
  assert.equal(ops.locales.fr.facts, 'Texte du stand.');
  assert.deepEqual(ops.locales.fr.questions, ['Première ?', 'Deuxième ?']);
  assert.equal(ops.prompt, 'Stand prompt?');
  assert.equal(ops.locales.it.facts, catalog.find(p => p.id === 'ops').locales.it.facts);
});

test('a notes override replaces the notes sent to the model', t => {
  t.after(() => knowledge.load({}));
  knowledge.load({'efb/notes': 'First note.\n\nSecond note.'});
  const efb = knowledge.products(catalog).find(p => p.id === 'efb');
  assert.deepEqual(efb.help.flatMap(entry => entry.notes), ['First note.', 'Second note.']);
});

test('a product hidden in the catalog is off until the stand team switches it on, and the other way round', t => {
  t.after(() => knowledge.load({}));
  const shown = () => Object.fromEntries(knowledge.products(catalog).map(product => [product.id, product.shown]));
  assert.equal(shown().efb, false);
  assert.equal(shown().ops, true);
  knowledge.load({'efb/@shown': 'yes', 'ops/@shown': 'no'});
  assert.equal(shown().efb, true);
  assert.equal(shown().ops, false);
});

test('the catalog itself is never modified by overrides', t => {
  t.after(() => knowledge.load({}));
  const before = JSON.stringify(catalog);
  knowledge.load({'ops/facts.en': 'Changed.', 'ops/notes': 'Changed.'});
  knowledge.products(catalog);
  assert.equal(JSON.stringify(catalog), before);
});

test('items list every editable text with its original and a modified mark', t => {
  t.after(() => knowledge.load({}));
  knowledge.load({'ops/guide.T13.title': 'How do I invoice flights?', 'ops/facts.fr': 'Texte du stand.'});
  const items = knowledge.items(catalog, 'ops', 'fr');
  const byKey = Object.fromEntries(items.map(item => [item.key, item]));
  assert.equal(byKey['ops/facts.fr'].text, 'Texte du stand.');
  assert.equal(byKey['ops/facts.fr'].modified, true);
  assert.equal(byKey['ops/facts.fr'].original, catalog.find(p => p.id === 'ops').locales.fr.facts);
  assert.equal(byKey['ops/guide.T13.title'].text, 'How do I invoice flights?');
  assert.equal(byKey['ops/guide.T2.title'].modified, false);
  assert.ok(byKey['ops/notes'].text.includes('Scheduled and Engaged are distinct states'));
  assert.ok(byKey['ops/guide.T2.topics'].text.includes('calendar'));
  for (const item of items) assert.equal(typeof item.text, 'string', item.key);
});

test('a product without a guide still lists its card and notes', () => {
  const keys = knowledge.items(catalog, 'efb', 'en').map(item => item.key);
  assert.deepEqual(keys, ['efb/prompt.en', 'efb/facts.en', 'efb/questions.en', 'efb/notes']);
});

// ---------- Webcam presence (presence.js) ----------
const {presenceStep} = require('../presence.js');
const presenceRun = (frames, threshold = 0.10) => frames.reduce((s, [t, faces]) => presenceStep(s, faces, t, threshold), {near: false, since: null, lastNearAt: -Infinity});

test('presence: a face over the threshold for 1 s turns near, a shorter one does not', () => {
  const face = [{width: 0.2, x: 0.5}];
  assert.equal(presenceRun([[0, face], [800, face]]).near, false);
  assert.equal(presenceRun([[0, face], [600, face], [1000, face]]).near, true);
  assert.equal(presenceRun([[0, face], [600, []], [1000, face]]).near, false); // Interrupted: the second starts again.
});

test('presence: near ends 3 s after the last near face', () => {
  const face = [{width: 0.2, x: 0.5}], on = [[0, face], [1000, face]];
  assert.equal(presenceRun([...on, [3900, []]]).near, true);
  assert.equal(presenceRun([...on, [4100, []]]).near, false);
  assert.equal(presenceRun([...on, [3000, face], [5500, []]]).near, true); // Seen again: the 3 s start over.
});

test('presence: faces under the threshold never count; the biggest face is the one followed', () => {
  assert.equal(presenceRun([[0, [{width: 0.09, x: 0.5}]], [2000, [{width: 0.09, x: 0.5}]]]).near, false);
  const two = [{width: 0.12, x: 0.2}, {width: 0.3, x: 0.8}];
  const s = presenceRun([[0, two], [1000, two]]);
  assert.deepEqual(s.face, {width: 0.3, x: 0.8});
  assert.equal(s.lastNearAt, 1000);
});

test('presence.js never keeps, sends or stores an image', () => {
  const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '../presence.js'), 'utf8');
  for (const word of ['toDataURL', 'toBlob', 'getImageData', 'MediaRecorder', 'captureStream', 'fetch(', 'XMLHttpRequest', 'localStorage', 'indexedDB', 'window.wilco', 'api.', 'console.'])
    assert.ok(!source.includes(word), `presence.js uses ${word}`);
});

test('the camera preview in Settings never captures a frame', () => {
  const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '../settings.js'), 'utf8');
  for (const word of ['toDataURL', 'toBlob', 'getImageData', 'drawImage', 'MediaRecorder', 'captureStream'])
    assert.ok(!source.includes(word), `settings.js uses ${word}`);
});
