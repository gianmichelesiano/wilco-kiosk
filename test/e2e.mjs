// Drives the real kiosk window with stand-in providers (test/mock.cjs). Run: npm run e2e
// No key, no network and no cost. The window opens on this computer, with the sound muted.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
// A product without material for the show carries "hidden": true in catalog.json.
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));
const visible = catalog.filter(product => !product.hidden);
// What "Rewrite this product" writes for OPS (settings.js): its introduction and its suggested questions, in four languages.
const opsAnswers = 4 * (1 + catalog.find(product => product.id === 'ops').questions.length);
// Playwright is shared by the NGFT workspace. Set PLAYWRIGHT to use another copy.
const {_electron: electron} = require(process.env.PLAYWRIGHT || path.resolve(root, '../test-auth/node_modules/playwright-core'));

const state = page => page.evaluate(() => document.body.dataset.state);
const mode = page => page.evaluate(() => document.body.dataset.mode);
const until = (page, fn, arg, timeout = 8000) => page.waitForFunction(fn, arg, {timeout});
const latest = page => page.textContent('#transcript .msg.wilco.latest p');
// For half a second after a visit starts or ends the kiosk ignores touches, so that the second tap of a
// double tap does nothing. A test that taps again waits for that.
const settle = page => page.waitForTimeout(600);
// On the attract screen a language button only picks the language; the next touch starts the visit in it.
async function visit(page, language) {
  await page.click(`#lang [data-lang="${language}"]`);
  await page.click('#begin');
  await settle(page);
}

async function launch(t, {env = {}, files = {}, settings} = {}) {
  settings ??= fs.mkdtempSync(path.join(os.tmpdir(), 'wilco-e2e-'));
  for (const [name, data] of Object.entries(files)) fs.writeFileSync(path.join(settings, name), JSON.stringify(data));
  const app = await electron.launch({
    executablePath: require(path.join(root, 'node_modules/electron')),
    // Its own browser profile: a test never shares one with a kiosk that is open on this computer.
    // The kiosk is drawn off screen (test/mock.cjs): it keeps drawing and its timers keep their pace.
    args: ['--mute-audio', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
      '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-background-timer-throttling',
      '--user-data-dir=' + path.join(settings, 'profile'), '-r', path.join(root, 'test/mock.cjs'), root],
    env: {...process.env, WILCO_DEV: '1', WILCO_SETTINGS_DIR: settings, OPENAI_API_KEY: 'test', ELEVENLABS_API_KEY: 'test', WILCO_SETTINGS_PIN: '4321', ...env}
  });
  let closed = false;
  const close = async () => { if (!closed) { closed = true; await app.close(); } };
  t.after(async () => { await close(); fs.rmSync(settings, {recursive: true, force: true}); });
  const page = await app.firstWindow();
  await page.waitForSelector('#grid .card', {state: 'attached'});
  return {app, page, settings, close, calls: () => app.evaluate(() => ({...globalThis.wilcoMock})), mock: values => app.evaluate((_electron, v) => Object.assign(globalThis.wilcoMock, v), values)};
}
async function hold(page, selector, ms) {
  const box = await page.locator(selector).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
}
async function enterPin(page, pin) {
  for (const digit of pin) await page.click(`#pin [data-key="${digit}"]`);
  await page.click('#pin [data-key="ok"]');
}
async function openSettings(page) {
  await page.click('#settings-open', {timeout: 5000});
  await page.waitForSelector('#pin[open]');
  await enterPin(page, '4321');
  await until(page, () => document.body.dataset.mode === 'settings');
  await page.waitForSelector('#apps [data-id="ops"]');
}
// Rewriting and restoring replace the stand team's work, so they ask for a second tap.
async function tapTwice(page, selector) {
  await page.click(selector);
  await page.click(selector);
}
const openGroups = page => page.evaluate(() => document.querySelectorAll('#context details').forEach(details => { details.open = true; }));
async function edit(page, key, text) {
  await openGroups(page);
  await page.fill(`[data-key="${key}"] textarea`, text);
  await page.click(`[data-key="${key}"] .save`);
  await until(page, k => !document.querySelector(`[data-key="${k}"] .save`)?.matches(':enabled'), key);
}

test('the kiosk waits on the attract screen and a touch starts the visit with a welcome', async t => {
  const {page, calls, settings} = await launch(t);
  assert.equal(await mode(page), 'attract');
  assert.ok(await page.isVisible('#attract'));
  assert.ok(!(await page.isVisible('#controls')), 'the controls stay hidden until a visitor arrives');
  await until(page, () => document.querySelector('#teaser-question').textContent.trim().length > 0);
  await page.click('#begin');
  await settle(page);
  await until(page, () => document.body.dataset.mode === 'visit');
  assert.match(await latest(page), /I’m Wilco/);
  await until(page, () => document.body.dataset.state === 'speaking');
  await until(page, () => document.body.dataset.state === 'standby');
  assert.equal((await calls()).speech, 1);
  assert.equal(fs.readdirSync(path.join(settings, 'cache', 'tts')).length, 1, 'the welcome is kept for the next visitor');
  const first = await latest(page);
  await page.click('#reset');
  await settle(page);
  await until(page, () => document.body.dataset.mode === 'attract');
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await until(page, () => document.body.dataset.state === 'speaking');
  assert.notEqual(await latest(page), first, 'never the same welcome twice in a row');
  assert.equal((await calls()).speech, 2);
  await page.evaluate(text => window.wilco.speak(text, 'en', true), first);
  assert.equal((await calls()).speech, 2, 'a welcome heard before comes from the cache');
});

// Every welcome variant in strings.js says who Wilco is.
for (const [language, greeting] of Object.entries({en:/I’m Wilco/,fr:/je suis Wilco/i,de:/ich bin Wilco/i,it:/sono Wilco/i})) {
  test(`the ${language} button starts the visit with a localized greeting and respects reduced motion`, async t => {
    const {page} = await launch(t);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(() => {
      const avatar = document.querySelector('.portrait');
      avatar.animate = () => { window.wilcoAvatarAnimated = true; };
    });
    await visit(page, language);
    await until(page, () => document.body.dataset.mode === 'visit');
    assert.equal(await page.evaluate(() => document.documentElement.lang), language);
    assert.match(await latest(page), greeting);
    assert.equal(await page.evaluate(() => !!window.wilcoAvatarAnimated), false);
  });
}

test('touching the question on the attract screen opens that product in that language', async t => {
  const {page, calls} = await launch(t);
  await until(page, () => document.querySelector('#teaser-question').textContent.trim().length > 0);
  const shown = await page.evaluate(() => ({lang: document.querySelector('#teaser').lang, name: document.querySelector('#teaser-name').textContent}));
  await page.click('#teaser');
  await until(page, () => !document.querySelector('article').hidden);
  assert.equal(await page.evaluate(() => document.documentElement.lang), shown.lang);
  assert.equal(await page.textContent('#name'), shown.name);
  const messages = page.locator('#transcript .msg.wilco');
  assert.match(await messages.first().textContent(), /Wilco/);
  await until(page, () => document.querySelectorAll('#transcript .msg.wilco').length === 2);
  assert.match(await latest(page), /Mock answer/);
  assert.equal((await calls()).chat, 1);
});

test('a visitor question during the welcome replaces the queued product overview', async t => {
  const {page, calls, mock} = await launch(t);
  await mock({delay:1200});
  await page.click('#teaser');
  await settle(page);
  await page.fill('#question', 'Where can I see the schedule?');
  await page.click('#askbtn');
  await until(page, () => /Mock answer.*Where can I see the schedule/.test(document.querySelector('#transcript .msg.wilco.latest p')?.textContent || ''));
  assert.equal((await calls()).asked, 1);
});

test('a kiosk left alone warns, then clears the visit and returns to the attract screen', async t => {
  const {page} = await launch(t, {files: {'demo.json': {urls: {}, loginOrigins: [], idleSeconds: 4}}});
  await visit(page, 'de');
  // A product without an app tour: a tour that plays keeps the visit going (quiet() in ui.js).
  await page.click(`#grid .card:nth-child(${visible.findIndex(product => !product.intro) + 1})`);
  await until(page, () => document.querySelector('#transcript .msg.wilco'));
  await until(page, () => /Noch da\?/.test(document.querySelector('#status').textContent), null, 12000);
  await until(page, () => document.body.dataset.mode === 'attract', null, 12000);
  assert.equal(await page.evaluate(() => document.querySelectorAll('#transcript .msg').length), 0);
  assert.equal(await page.evaluate(() => document.documentElement.lang), 'en');
});

test('a touch during the warning keeps the visit', async t => {
  const {page} = await launch(t, {files: {'demo.json': {urls: {}, loginOrigins: [], idleSeconds: 4}}});
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await until(page, () => /Still there\?/.test(document.querySelector('#status').textContent), null, 12000);
  await page.click('#transcript');
  assert.doesNotMatch(await page.textContent('#status'), /Still there\?/);
  await page.waitForTimeout(2500);
  assert.equal(await mode(page), 'visit');
});

test('the avatar shows that Wilco is thinking while the answer is on its way', async t => {
  const {page, mock} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await mock({delay: 700});
  await page.click('#grid .card');
  await until(page, () => document.body.dataset.state === 'thinking');
  assert.equal(await page.textContent('#statetext'), 'Thinking…');
  await until(page, () => document.body.dataset.state === 'speaking');
  await until(page, () => document.body.dataset.state === 'standby');
});

test('holding the talk button records and releasing it sends the question', async t => {
  const {page, calls} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await until(page, () => document.body.dataset.state === 'standby');
  const box = await page.locator('#mic').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await until(page, () => document.body.dataset.state === 'listening');
  assert.equal(await page.textContent('#miclabel'), 'Release to send');
  await page.waitForTimeout(700);
  await page.mouse.up();
  await until(page, () => document.querySelector('#transcript .msg.visitor'));
  assert.equal(await page.textContent('#transcript .msg.visitor p'), 'How do I notify the crew?');
  await until(page, () => /Mock answer/.test(document.querySelector('#transcript .msg.wilco.latest p')?.textContent || ''));
  assert.equal((await calls()).transcription, 1);
});

test('a short tap on the talk button keeps listening until the next tap', async t => {
  const {page, calls} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await until(page, () => document.body.dataset.state === 'standby');
  await page.click('#mic');
  await until(page, () => document.body.dataset.state === 'listening');
  await page.waitForTimeout(900);
  assert.equal(await state(page), 'listening');
  assert.equal((await calls()).transcription, 0);
  await page.click('#mic');
  await until(page, () => document.querySelector('#transcript .msg.visitor'));
  assert.equal((await calls()).transcription, 1);
});

test('Settings opens only with the staff PIN', async t => {
  const {page} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await assert.rejects(page.evaluate(() => window.wilco.context('ops', 'en', [])), /Locked/);
  await page.click('#settings-open', {timeout: 5000});
  await page.waitForSelector('#pin[open]');
  await enterPin(page, '1111');
  await until(page, () => /Wrong PIN/.test(document.querySelector('#pin-message').textContent));
  assert.equal(await mode(page), 'visit');
  await enterPin(page, '4321');
  await until(page, () => document.body.dataset.mode === 'settings');
  assert.ok(await page.isVisible('#apps [data-id="techlog"]'));
  await page.click('#settings-close');
  await settle(page);
  await until(page, () => document.body.dataset.mode === 'attract');
  await assert.rejects(page.evaluate(() => window.wilco.context('ops', 'en', [])), /Locked/);
});

test('without a configured PIN the keypad says how to enable Settings and opens nothing', async t => {
  const {page} = await launch(t, {env: {WILCO_SETTINGS_PIN: ''}});
  await page.click('#settings-open', {timeout: 5000});
  await until(page, () => /WILCO_SETTINGS_PIN/.test(document.querySelector('#pin-message').textContent));
  await enterPin(page, '4321');
  await until(page, () => /WILCO_SETTINGS_PIN/.test(document.querySelector('#pin-message').textContent));
  assert.equal(await mode(page), 'attract');
});

test('the Settings button on the attract screen opens the keypad without starting a visit', async t => {
  const {page} = await launch(t);
  await page.click('#settings-open', {timeout: 5000});
  await page.waitForSelector('#pin[open]');
  assert.equal(await mode(page), 'attract');
  await enterPin(page, '4321');
  await until(page, () => document.body.dataset.mode === 'settings');
});

test('five wrong PINs lock the keypad for a minute', async t => {
  const {page} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await page.click('#settings-open', {timeout: 5000});
  await page.waitForSelector('#pin[open]');
  for (let attempt = 0; attempt < 5; attempt++) await enterPin(page, '0000');
  await enterPin(page, '4321');
  await until(page, () => /Too many attempts/.test(document.querySelector('#pin-message').textContent));
  assert.equal(await mode(page), 'visit');
});

test('Settings show what Wilco knows about each product', async t => {
  const {page} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await openSettings(page);
  assert.match(await page.textContent('#apps [data-id="ops"]'), /24 sections/);
  await page.click('#apps [data-id="ops"]');
  await openGroups(page);
  assert.match(await page.inputValue('[data-key="ops/facts.en"] textarea'), /^NGFT OPS handles helicopter operations/);
  assert.match(await page.inputValue('[data-key="ops/notes"] textarea'), /Scheduled and Engaged are distinct states/);
  assert.match(await page.inputValue('[data-key="ops/guide.T2.body"] textarea'), /UNASSIGNED JOBS/);
  await page.click('#lang [data-lang="fr"]');
  await page.waitForSelector('[data-key="ops/facts.fr"]', {state: 'attached'});
  await openGroups(page);
  assert.match(await page.inputValue('[data-key="ops/facts.fr"] textarea'), /^NGFT OPS gère/);
});

test('the question test in Settings lists the guide sections Wilco would use', async t => {
  const {page} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await openSettings(page);
  await page.click('#apps [data-id="ops"]');
  await page.fill('#probe-question', 'Come avviso la crew?');
  await page.click('#probe-run');
  await until(page, () => /^T4 /m.test(document.querySelector('#probe-result').innerText));
  await page.fill('#probe-question', 'zeppelin');
  await page.click('#probe-run');
  await until(page, () => /No guide section/.test(document.querySelector('#probe-result').innerText));
});

test('a text changed in Settings reaches Wilco, survives a restart and can be restored', async t => {
  const first = await launch(t);
  let {page} = first;
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await openSettings(page);
  await page.click('#apps [data-id="ops"]');
  await edit(page, 'ops/guide.T1.title', 'How do I record a zeppelin request?');
  await edit(page, 'ops/facts.en', 'Stand text for OPS. Second sentence.');
  const saved = JSON.parse(fs.readFileSync(path.join(first.settings, 'overrides.json'), 'utf8'));
  assert.equal(saved['ops/guide.T1.title'], 'How do I record a zeppelin request?');
  await page.click('#settings-close');
  await settle(page);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  assert.equal(await page.textContent('#grid .card .goal'), 'Stand text for OPS.');
  await page.click('#grid .card');
  await until(page, () => document.querySelector('#transcript .msg.wilco'));
  await page.fill('#question', 'zeppelin');
  await page.press('#question', 'Enter');
  await until(page, () => /to: zeppelin/.test(document.querySelector('#transcript .msg.wilco.latest p').textContent));
  assert.equal((await first.calls()).lastChapters[0], 'T1 How do I record a zeppelin request?', 'the model receives the section under its new title');
  await first.close();

  const second = await launch(t, {settings: first.settings});
  page = second.page;
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  assert.equal(await page.textContent('#grid .card .goal'), 'Stand text for OPS.');
  await openSettings(page);
  await page.click('#apps [data-id="ops"]');
  await openGroups(page);
  assert.equal(await page.inputValue('[data-key="ops/guide.T1.title"] textarea'), 'How do I record a zeppelin request?');
  await tapTwice(page, '[data-key="ops/guide.T1.title"] .restore');
  await until(page, () => document.querySelector('[data-key="ops/guide.T1.title"] textarea')?.value === 'How do I record a customer request with one or more flights?');
  assert.equal(JSON.parse(fs.readFileSync(path.join(first.settings, 'overrides.json'), 'utf8'))['ops/guide.T1.title'], undefined);
});

test('the app tour plays without sound during the overview, and a question takes its place', async t => {
  const {page} = await launch(t);
  await until(page, () => document.querySelector('#teaser-question').textContent.trim().length > 0);
  await page.click('#teaser'); // The attract question opens OPS (catalog.json "attract" and "intro").
  await until(page, () => !document.querySelector('#film').hidden && /\/media\/intro\/ops\.mp4$/.test(document.querySelector('#film').src));
  assert.ok(await page.$eval('#film', video => video.muted));
  await until(page, () => document.querySelector('#film').currentTime > 2, null, 8000); // It plays, not just its first frame.
  await until(page, () => !document.querySelector('#topics').hidden);
  await page.click('#topics .topic:first-child'); // Questions with a clip come first.
  await until(page, () => /\/media\/stories\/01-new-mission-silent\.mp4$/.test(document.querySelector('#film').src));
  await page.click('#topics .topic:last-child'); // No clip: the film goes away.
  await until(page, () => document.querySelector('#film').hidden);
});

test('prepared answers play at once and keep working with the network down', async t => {
  const {page, calls, mock, settings} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await openSettings(page);
  await page.click('#apps [data-id="ops"]');
  await tapTwice(page, '#prepare-product');
  await until(page, () => /^Done/.test(document.querySelector('#prepare-status').textContent), null, 60000);
  const prepared = await calls();
  assert.equal(prepared.chat, opsAnswers, 'introduction and suggested questions in four languages');
  assert.ok(prepared.speech >= opsAnswers);
  assert.equal(Object.keys(JSON.parse(fs.readFileSync(path.join(settings, 'cache', 'answers.json'), 'utf8'))).length, opsAnswers);
  await page.click('#settings-close');
  await settle(page);
  await mock({down: true});
  await visit(page, 'it');
  await until(page, () => document.body.dataset.mode === 'visit');
  await page.click('#grid .card');
  await until(page, () => /Mock answer \d+ to: Presentami OPS Dispatch/.test(document.querySelector('#transcript .msg.wilco.latest p')?.textContent || ''));
  await until(page, () => document.body.dataset.state === 'speaking');
  // The network is down: only the kept file can give the ElevenLabs voice of this answer.
  const heard = await latest(page);
  assert.equal(await page.evaluate(text => window.wilco.speak(text, 'it', true).then(audio => audio.source), heard), 'ElevenLabs');
  await until(page, () => !document.querySelector('#topics').hidden);
  await page.click('#topics .topic');
  await until(page, () => /to: Come pianifico una nuova missione\?/.test(document.querySelector('#transcript .msg.wilco.latest p').textContent));
  assert.doesNotMatch(await page.textContent('#status'), /indisponibile/);
  assert.equal((await calls()).chat, opsAnswers, 'no call left the kiosk');
});

test('a prepared answer rewritten by the stand team is what visitors hear', async t => {
  const {page, calls} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await openSettings(page);
  await page.click('#apps [data-id="ops"]');
  await tapTwice(page, '#prepare-product');
  await until(page, () => /^Done/.test(document.querySelector('#prepare-status').textContent), null, 60000);
  const before = (await calls()).speech;
  await openGroups(page);
  const key = await page.evaluate(() => document.querySelector('[data-key^="answer:en|ops|How do I notify"]').dataset.key);
  await edit(page, key, 'Use Engage jobs of aircraft.');
  assert.equal((await calls()).speech, before + 1, 'the new text gets its voice when it is saved');
  await page.click('#settings-close');
  await settle(page);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await page.click('#grid .card');
  await until(page, () => !document.querySelector('#topics').hidden);
  await page.locator('#topics .topic', {hasText: 'How do I notify'}).click(); // Questions with a clip come first.
  await until(page, () => /^Use Engage jobs of aircraft\./.test(document.querySelector('#transcript .msg.wilco.latest p').textContent));
});

test('changing a product marks its prepared answers as older than the text', async t => {
  const {page} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await openSettings(page);
  await page.click('#apps [data-id="ops"]');
  await tapTwice(page, '#prepare-product');
  await until(page, () => /^Done/.test(document.querySelector('#prepare-status').textContent), null, 60000);
  assert.equal(await page.locator('#context .stale').count(), 0);
  await page.waitForTimeout(20);
  await edit(page, 'ops/notes', 'A new note from the stand.');
  await until(page, () => document.querySelectorAll('#context .stale').length > 0);
});

test('Settings refuse texts that are not part of a product', async t => {
  const {page, settings} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await openSettings(page);
  for (const key of ['../demo.json', 'ops/@changed', 'unknown/facts.en', 'ops/../x']) {
    await assert.rejects(page.evaluate(k => window.wilco.save(k, 'x'), key), /Unknown text/, key);
  }
  await assert.rejects(page.evaluate(() => window.wilco.save('ops/notes', 'x'.repeat(30001))), /Text too long/);
  assert.ok(!fs.existsSync(path.join(settings, 'overrides.json')), 'nothing was written');
});

test('a damaged overrides file is set aside and the kiosk still starts', async t => {
  const settings = fs.mkdtempSync(path.join(os.tmpdir(), 'wilco-e2e-'));
  fs.writeFileSync(path.join(settings, 'overrides.json'), '{"ops/facts.en": "Half a fi');
  const {page} = await launch(t, {settings});
  assert.equal(await mode(page), 'attract');
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  assert.match(await page.textContent('#grid .card .goal'), /^NGFT OPS handles helicopter operations/);
  const aside = fs.readdirSync(settings).filter(name => name.startsWith('overrides.json.unreadable'));
  assert.equal(aside.length, 1);
  assert.equal(fs.readFileSync(path.join(settings, aside[0]), 'utf8'), '{"ops/facts.en": "Half a fi');
  await openSettings(page);
  assert.match(await page.textContent('#settings-message'), /overrides\.json could not be read/);
});

test('with no microphone the message stays after the button is released', async t => {
  const {page} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await until(page, () => document.body.dataset.state === 'standby');
  await page.evaluate(() => { navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('No device', 'NotFoundError')); });
  await hold(page, '#mic', 700);
  assert.equal(await page.textContent('#status'), 'Microphone unavailable. Type your question.');
});

test('a recording that reached its time limit is still sent when the button is released', async t => {
  const {page, mock} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await until(page, () => document.body.dataset.state === 'standby');
  await mock({delay: 800});
  const box = await page.locator('#mic').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await until(page, () => document.body.dataset.state === 'listening');
  await page.waitForTimeout(500); // Longer than a tap.
  await page.evaluate(() => recorder.stop()); // What the 20 second limit does.
  await until(page, () => document.body.dataset.state === 'thinking');
  await page.mouse.up();
  await until(page, () => document.querySelector('#transcript .msg.visitor'));
});

test('a free question leaves no audio file behind', async t => {
  const {page, settings} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await until(page, () => document.body.dataset.state === 'speaking');
  await page.fill('#question', 'What is the weather in Lyon?');
  await page.press('#question', 'Enter');
  await until(page, () => /to: What is the weather/.test(document.querySelector('#transcript .msg.wilco.latest p').textContent));
  await until(page, () => document.body.dataset.state === 'speaking');
  assert.equal(fs.readdirSync(path.join(settings, 'cache', 'tts')).length, 1, 'only the welcome is kept');
});

test('a press without a click starts the visit, as a long touch does', async t => {
  const {page} = await launch(t);
  await page.dispatchEvent('#begin', 'pointerup', {button: 0, bubbles: true});
  await until(page, () => document.body.dataset.mode === 'visit');
});

test('a second tap on End visit does not start a new visit', async t => {
  const {page} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await until(page, () => document.body.dataset.mode === 'visit');
  await page.dblclick('#reset');
  await page.waitForTimeout(300);
  assert.equal(await mode(page), 'attract');
});

test('text typed in one field survives the saving of another and a change of product', async t => {
  const {page} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await openSettings(page);
  await page.click('#apps [data-id="ops"]');
  await openGroups(page);
  await page.fill('[data-key="ops/guide.T2.body"] textarea', 'Draft text, not saved yet.');
  await edit(page, 'ops/guide.T2.title', 'How do I plan a zeppelin?');
  assert.equal(await page.inputValue('[data-key="ops/guide.T2.body"] textarea'), 'Draft text, not saved yet.');
  assert.ok(await page.isEnabled('[data-key="ops/guide.T2.body"] .save'));
  await page.click('#apps [data-id="sms"]');
  await page.waitForSelector('[data-key="sms/notes"]', {state: 'attached'});
  await page.click('#apps [data-id="ops"]');
  await page.waitForSelector('[data-key="ops/guide.T2.body"]', {state: 'attached'});
  assert.equal(await page.inputValue('[data-key="ops/guide.T2.body"] textarea'), 'Draft text, not saved yet.');
});

test('one tap on Rewrite or Restore changes nothing', async t => {
  const {page, calls} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await openSettings(page);
  await page.click('#apps [data-id="ops"]');
  await page.click('#prepare-product');
  await page.waitForTimeout(400);
  assert.equal((await calls()).chat, 0);
  assert.match(await page.textContent('#prepare-product'), /again/i);
  await edit(page, 'ops/facts.en', 'Stand text for OPS.');
  await page.click('[data-key="ops/facts.en"] .restore');
  await page.waitForTimeout(400);
  assert.equal(await page.inputValue('[data-key="ops/facts.en"] textarea'), 'Stand text for OPS.');
});

test('preparing says how many answers have no voice, and a second run gives them one', async t => {
  const {page, mock, settings} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await openSettings(page);
  await page.click('#apps [data-id="ops"]');
  await mock({speechDown: true});
  await tapTwice(page, '#prepare-product');
  await until(page, () => /^Done/.test(document.querySelector('#prepare-status').textContent), null, 60000);
  assert.match(await page.textContent('#prepare-status'), new RegExp(`${opsAnswers} without voice`));
  await mock({speechDown: false});
  await page.click('#prepare-missing');
  await until(page, mute => /^Done/.test(document.querySelector('#prepare-status').textContent) && !document.querySelector('#prepare-status').textContent.includes(mute), `${opsAnswers} without voice`, 180000);
  assert.doesNotMatch(await page.textContent('#prepare-status'), /without voice/);
  // At least an introduction and four questions in four languages for every product on show.
  assert.ok(fs.readdirSync(path.join(settings, 'cache', 'tts')).length >= visible.length * 20, 'every prepared answer has its voice on disk');
});

test('a settings file saved by Windows with a byte-order mark is read', async t => {
  const settings = fs.mkdtempSync(path.join(os.tmpdir(), 'wilco-e2e-'));
  fs.writeFileSync(path.join(settings, 'overrides.json'), '\uFEFF' + JSON.stringify({'ops/facts.en': 'Stand text for OPS. More.'}));
  const {page} = await launch(t, {settings});
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  assert.equal(await page.textContent('#grid .card .goal'), 'Stand text for OPS.');
});

test('with the idle reset switched off, an open Settings panel still locks by itself', async t => {
  const {page} = await launch(t, {files: {'demo.json': {urls: {}, loginOrigins: [], idleSeconds: 0}}});
  assert.equal(await mode(page), 'visit');
  await openSettings(page);
  await page.clock.install();
  await page.click('#probe-question'); // A touch arms the lock on the controlled clock.
  await page.clock.fastForward(5 * 60 * 1000 + 2000);
  await until(page, () => document.body.dataset.mode !== 'settings');
  await assert.rejects(page.evaluate(() => window.wilco.context('ops', 'en', [])), /Locked/);
});

test('the start button begins in the language of its label', async t => {
  const {page} = await launch(t);
  await until(page, () => document.querySelector('#begin').lang === 'fr', null, 12000);
  assert.equal(await page.textContent('#begin-label'), 'Touchez pour commencer');
  await page.click('#begin');
  await until(page, () => document.body.dataset.mode === 'visit');
  assert.equal(await page.evaluate(() => document.documentElement.lang), 'fr');
  assert.match(await latest(page), /Bonjour/);
});

// The products the kiosk offers: the names on the cards. The stand team's choice: a key in overrides.json.
const cards = page => page.$$eval('#grid .card b', names => names.map(name => name.textContent));
async function saved(page, settings, key, value) {
  const read = () => { try { return JSON.parse(fs.readFileSync(path.join(settings, 'overrides.json'), 'utf8'))[key]; } catch { return undefined; } };
  for (let tries = 0; tries < 50 && read() !== value; tries++) await page.waitForTimeout(100);
  assert.equal(read(), value);
}

test('a product hidden in the catalog stays off for visitors until the stand team switches it on', async t => {
  if (visible.length === catalog.length) return t.skip('No product is hidden.');
  const hidden = catalog.find(product => product.hidden);
  const {page, settings} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  assert.deepEqual(await cards(page), visible.map(product => product.name));
  await openSettings(page);
  assert.deepEqual(await page.$$eval('#apps [data-id]', buttons => buttons.map(button => button.dataset.id)), catalog.map(product => product.id), 'Settings list every product');
  assert.equal(await page.isChecked(`#apps [data-show="${hidden.id}"]`), false);
  await page.click(`#apps [data-show="${hidden.id}"]`);
  await saved(page, settings, hidden.id + '/@shown', 'yes');
  await page.click('#settings-close');
  await settle(page);
  await visit(page, 'en');
  assert.ok((await cards(page)).includes(hidden.name));
});

test('a product switched off in Settings leaves the kiosk and the catalog sent to the model', async t => {
  const {page, calls, settings} = await launch(t);
  await openSettings(page);
  await page.click('#apps [data-show="techlog"]');
  await saved(page, settings, 'techlog/@shown', 'no');
  await page.click('#settings-close');
  await settle(page);
  await visit(page, 'en');
  assert.ok(!(await cards(page)).includes('TechLog'));
  await page.fill('#question', 'Which products do you have?');
  await page.press('#question', 'Enter');
  await until(page, () => document.querySelectorAll('#transcript .msg.wilco').length > 1);
  const offered = (await calls()).lastProducts;
  assert.ok(offered.includes('ops') && !offered.includes('techlog'), offered.join(' '));
});

test('the last product in the kiosk cannot be switched off', async t => {
  const {page} = await launch(t);
  await openSettings(page);
  await page.evaluate(async ids => { for (const id of ids) await window.wilco.show(id, false); }, visible.slice(1).map(product => product.id));
  await page.click(`#apps [data-show="${visible[0].id}"]`);
  await until(page, () => /must stay/.test(document.querySelector('#settings-message').textContent));
  await until(page, id => document.querySelector(`#apps [data-show="${id}"]`)?.checked, visible[0].id);
});

// Two faults seen in answers of the real model on 25 November 2026.
test('line breaks that the model wrote as backslash-n are shown as line breaks', async t => {
  const {page, mock} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await mock({reply: 'Open the Calendar.\\n\\n- **Role:** dispatcher.'});
  await page.fill('#question', 'How do I assign a pilot?');
  await page.press('#question', 'Enter');
  await until(page, () => document.querySelectorAll('#transcript .msg.wilco').length > 1);
  const answer = await latest(page);
  assert.doesNotMatch(answer, /\\/);
  assert.match(answer, /^Open the Calendar\.\n\n• Role: dispatcher\./);
});

test('an answer with letters of another alphabet is not shown to the visitor', async t => {
  const {page, mock} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await mock({reply: 'Assign the aircraft and the экипаж.'});
  await page.fill('#question', 'How do I assign a pilot?');
  await page.press('#question', 'Enter');
  await until(page, () => document.querySelectorAll('#transcript .msg.wilco').length > 1);
  assert.doesNotMatch(await page.textContent('#transcript'), /\p{Script=Cyrillic}/u);
  assert.match(await page.textContent('#status'), /Service unavailable/);
});

// A kiosk may use one model as primary and as fallback (OPENAI_MODEL equal to OPENAI_FALLBACK_MODEL).
const oneModel = {OPENAI_MODEL: 'gpt-5.4-mini', OPENAI_FALLBACK_MODEL: 'gpt-5.4-mini'};
test('a model that answers badly once is asked again, also when it is its own fallback', async t => {
  const {page, mock, calls} = await launch(t, {env: oneModel});
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await mock({badOnce: true});
  await page.fill('#question', 'How do I assign a pilot?');
  await page.press('#question', 'Enter');
  await until(page, () => document.querySelectorAll('#transcript .msg.wilco').length > 1);
  assert.match(await latest(page), /^Mock answer 2 to: How do I assign a pilot\?/);
  assert.equal((await calls()).asked, 2);
});

test('a model that does not answer is not asked twice when it is its own fallback', async t => {
  const {page, mock, calls} = await launch(t, {env: oneModel});
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await mock({down: true});
  await page.fill('#question', 'How do I assign a pilot?');
  await page.press('#question', 'Enter');
  await until(page, () => /Service unavailable/.test(document.querySelector('#status').textContent));
  assert.equal((await calls()).asked, 1);
});

test('the header shows the logo of European Rotors', async t => {
  const {page} = await launch(t);
  const logo = await page.evaluate(() => {
    const image = document.querySelector('header img.event');
    return image && {alt: image.alt, loaded: image.complete && image.naturalWidth > 0};
  });
  assert.deepEqual(logo, {alt: 'European Rotors', loaded: true});
});

test('the voice test is in Settings, away from the visitor, and nobody changes the speed of the voice', async t => {
  const {page} = await launch(t);
  assert.equal(await page.locator('aside #testvoice, #voice-rate').count(), 0);
  await openSettings(page);
  assert.ok(await page.isVisible('#voice-rows [data-lang="en"] button'));
});

test('the visitor screen does not say who gives the voice, also when ElevenLabs refuses', async t => {
  const {page, mock} = await launch(t);
  await visit(page, 'en'); // Start in English, whatever the question on screen.
  await until(page, () => document.body.dataset.state === 'speaking');
  assert.equal(await page.textContent('#status'), '');
  await mock({speechDown: true});
  await page.fill('#question', 'How do I assign a pilot?');
  await page.press('#question', 'Enter');
  await until(page, () => document.querySelectorAll('#transcript .msg.wilco').length > 1 && document.body.dataset.state === 'speaking', null, 30000);
  assert.equal(await page.textContent('#status'), '');
});

test('Wilco speaks each language with the ElevenLabs voice chosen for it in Settings', async t => {
  const {page, calls} = await launch(t, {env: {ELEVENLABS_VOICE_ID: 'voiceStandard'}});
  await openSettings(page);
  await page.selectOption('#voice-fr', 'voiceB');
  await until(page, () => /French/.test(document.querySelector('#voice-status').textContent));
  await page.click('#settings-close');
  await settle(page);
  await visit(page, 'fr'); // The welcome in French.
  for (let tries = 0; tries < 40 && (await calls()).lastVoice !== 'voiceB'; tries++) await page.waitForTimeout(100);
  assert.equal((await calls()).lastVoice, 'voiceB');
  await page.click('#lang [data-lang="en"]'); // The other languages keep the voice of .env.
  await page.fill('#question', 'How do I assign a pilot?');
  await page.press('#question', 'Enter');
  await until(page, () => document.querySelectorAll('#transcript .msg.wilco').length > 1 && document.body.dataset.state === 'speaking');
  assert.equal((await calls()).lastVoice, 'voiceStandard');
});

test('the voices chosen for each language are read again when the kiosk starts', async t => {
  const {page, calls} = await launch(t, {files: {'voice.json': {de: 'voiceB'}}});
  await visit(page, 'de');
  await until(page, () => document.body.dataset.state === 'speaking');
  assert.equal((await calls()).lastVoice, 'voiceB');
});

test('the voice test in Settings plays the language and says what answered', async t => {
  const {page, mock, calls} = await launch(t);
  await openSettings(page);
  await page.click('#voice-rows [data-lang="it"] button');
  await until(page, () => /Italian: ElevenLabs/.test(document.querySelector('#voice-status').textContent));
  assert.equal((await calls()).speech, 1);
  await mock({speechDown: true});
  await page.click('#voice-rows [data-lang="it"] button');
  await until(page, () => /Italian: .*401/.test(document.querySelector('#voice-status').textContent), null, 30000);
});

// The products that catalog.json marks for the attract screen ("attract": true).
const marked = visible.filter(product => product.attract);
// The question of each product and its suggested questions in every language, as catalog.json has them.
const hooks = list => list.flatMap(product => ['en', 'fr', 'de', 'it'].flatMap(code => {
  const local = {...product, ...product.locales?.[code]};
  return [local.prompt, ...local.questions].map(text => [product.id, code, text].join(' | '));
}));
// What the attract screen asks, as a visitor reads it: `steps` questions in a row (it changes every five seconds).
const attractQuestions = (page, steps) => page.evaluate(count => Array.from({length: count}, () => {
  teaser();
  return [teased.id, document.querySelector('#teaser').lang, document.querySelector('#teaser-question').textContent].join(' | ');
}), steps);
const attractReady = page => until(page, () => document.querySelector('#teaser-question').textContent.trim().length > 0);

test('the attract screen asks only about the product marked in the catalog: its questions, each in every language', async t => {
  assert.ok(marked.length, 'catalog.json marks a product for the attract screen');
  const {page} = await launch(t);
  await attractReady(page);
  const expected = hooks(marked);
  assert.deepEqual((await attractQuestions(page, expected.length)).sort(), expected.sort());
});

test('with the marked product switched off, the attract screen asks about the other products', async t => {
  const {page} = await launch(t, {files: {'overrides.json': Object.fromEntries(marked.map(product => [product.id + '/@shown', 'no']))}});
  await attractReady(page);
  const expected = hooks(visible.filter(product => !product.attract));
  assert.deepEqual((await attractQuestions(page, expected.length)).sort(), expected.sort());
});

test('a language with fewer suggested questions still shows a question at every step of the attract screen', async t => {
  const [product] = marked;
  assert.ok(product, 'catalog.json marks a product for the attract screen');
  const {page} = await launch(t, {files: {'overrides.json': {[product.id + '/questions.fr']: 'Une seule question ?'}}});
  await attractReady(page);
  const french = (await attractQuestions(page, hooks(marked).length)).filter(line => line.includes(' | fr | ')).map(line => line.split(' | ')[2]);
  assert.ok(french.length && french.every(text => [product.locales.fr.prompt, 'Une seule question ?'].includes(text)), french.join(' / '));
});
