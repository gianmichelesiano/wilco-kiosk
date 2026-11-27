# Webcam presence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wilco si accorge di chi si ferma davanti al kiosk (webcam, MediaPipe locale), lo invita, tiene aperta la visita finché c'è e la chiude quando se ne va.

**Architecture:** Un nuovo script classico `presence.js` nel renderer tiene la webcam a 320×240 e passa a MediaPipe un fotogramma ogni 200 ms; esce solo un numero per fotogramma (larghezza e centro del volto più grande). Una funzione pura `presenceStep` trasforma questi numeri in `near` / non `near` con i tempi. `ui.js` usa lo stato per il risveglio e per la fine della visita; `settings.js` aggiunge il riquadro «Camera»; le impostazioni stanno in `camera.json` accanto a `.env`.

**Tech Stack:** Electron 42.11.18, JS classico senza bundler, `@mediapipe/tasks-vision` 1.2.3 (Apache-2.0) vendorizzato, modello BlazeFace short range float16, `node:test` + Playwright Electron per i test.

**Spec:** `docs/superpowers/specs/2026-11-27-presence-camera-design.md`

## Global Constraints

- **Nessuna immagine salvata o inviata.** I fotogrammi esistono solo nel `<video>` e dentro MediaPipe, in memoria. `presence.js` non usa `toDataURL`, `toBlob`, `getImageData`, `MediaRecorder`, `captureStream`, `fetch`, `XMLHttpRequest`, `localStorage`, `indexedDB`, `api.`/`window.wilco`. Nessun canvas con il video. Nessun `console.log` di dati della webcam.
- Offline: tutti i file da `vendor/mediapipe/`, caricati da `file://`. Unica modifica alla CSP: `'wasm-unsafe-eval'` in `script-src`.
- Permesso video solo per la finestra principale (`wc===win.webContents && wc.getURL()===start`); la demo live resta senza permessi.
- Delegate `GPU` (con CPU lo spike non ha trovato volti).
- Valori: rilevazione ogni 200 ms; `near` dopo 1000 ms continui con larghezza ≥ soglia; fine `near` dopo 3000 ms senza; visita chiusa dopo 20000 ms senza volto vicino, con Wilco in silenzio; soglia iniziale 0.10, cursore 0.05–0.30 passo 0.01; saluto a voce spento all'inizio, al massimo uno ogni 60000 ms; camera accesa all'inizio.
- Senza webcam, permesso negato, modello non caricato: kiosk a tocco come oggi, stato visibile nelle Impostazioni.
- Interfaccia delle Impostazioni in inglese, come il resto del pannello; testi per i visitatori in en/fr/de/it in `strings.js`.
- Lavorare nel worktree `../wilco-kiosk-presence` (ramo `presence-camera`): un'altra sessione modifica gli stessi file in `wilco-kiosk/`.

## Review Focus

1. Webcam staccata a metà giornata (track `ended`): stato «No camera», niente errori, tocco come prima; riprova ogni 10 s. Test in Task 2.
2. Permesso negato (privacy di Windows): stato «No permission», kiosk a tocco. Test in Task 2.
3. Più persone davanti: conta solo il volto più grande. Test in Task 1.
4. Impostazioni aperte: la presenza non sveglia e non chiude niente (l'anteprima sì). Test in Task 3.
5. GPU assente che restituisce 0 volti senza errore: non rilevabile dal codice; l'anteprima nelle Impostazioni lo mostra. Annotato nel README (Task 5).

---

### Task 0: Worktree

- [ ] **Step 1:** Usare superpowers:using-git-worktrees. Da `wilco-kiosk/`: `GIT_LFS_SKIP_SMUDGE=1 git worktree add ../wilco-kiosk-presence -b presence-camera` (il runtime `windows/` non serve per sviluppare), poi `ln -s ../wilco-kiosk/node_modules ../wilco-kiosk-presence/node_modules`.
- [ ] **Step 2:** In `../wilco-kiosk-presence`: `npm test` → `pass 132`, `fail 0`.

### Task 1: `presenceStep` e garanzia «nessuna immagine»

**Files:**
- Create: `presence.js`
- Test: `test/check.cjs`

**Interfaces:**
- Produces: `presenceStep(state, faces, now, threshold) -> state`, con `state = {near:boolean, since:number|null, lastNearAt:number}` (stato iniziale `{near:false, since:null, lastNearAt:-Infinity}`), `faces = [{width:number, x:number}]` in frazioni dell'inquadratura (0–1). Restituisce un oggetto nuovo con in più `face: {width,x}|null` (il volto più grande sopra soglia). Esportata con `if(typeof module!=='undefined')module.exports={presenceStep};` in fondo al file, globale nel browser.

- [ ] **Step 1: Test che falliscono** in `test/check.cjs`:

```js
const {presenceStep} = require('../presence.js');
const run = (frames, threshold = 0.10) => frames.reduce((s, [t, faces]) => presenceStep(s, faces, t, threshold), {near: false, since: null, lastNearAt: -Infinity});
test('presence: a face over the threshold for 1 s turns near, a shorter one does not', () => {
  const face = [{width: 0.2, x: 0.5}];
  assert.equal(run([[0, face], [800, face]]).near, false);
  assert.equal(run([[0, face], [600, face], [1000, face]]).near, true);
  assert.equal(run([[0, face], [600, []], [1000, face]]).near, false); // interrotto: riparte
});
test('presence: near ends 3 s after the last near face', () => {
  const face = [{width: 0.2, x: 0.5}], on = [[0, face], [1000, face]];
  assert.equal(run([...on, [3900, []]]).near, true);
  assert.equal(run([...on, [4100, []]]).near, false);
  assert.equal(run([...on, [3000, face], [5500, []]]).near, true); // il volto rivisto rinnova
});
test('presence: faces under the threshold never count; the biggest face is the one followed', () => {
  assert.equal(run([[0, [{width: 0.09, x: 0.5}]], [2000, [{width: 0.09, x: 0.5}]]]).near, false);
  const s = run([[0, [{width: 0.12, x: 0.2}, {width: 0.3, x: 0.8}]], [1000, [{width: 0.12, x: 0.2}, {width: 0.3, x: 0.8}]]]);
  assert.deepEqual(s.face, {width: 0.3, x: 0.8});
  assert.equal(s.lastNearAt, 1000);
});
test('presence.js never keeps, sends or stores an image', () => {
  const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '../presence.js'), 'utf8');
  for (const word of ['toDataURL', 'toBlob', 'getImageData', 'MediaRecorder', 'captureStream', 'fetch(', 'XMLHttpRequest', 'localStorage', 'indexedDB', 'window.wilco', 'api.', 'console.'])
    assert.ok(!source.includes(word), `presence.js uses ${word}`);
});
```

- [ ] **Step 2:** `npm test` → FAIL: `Cannot find module '../presence.js'`.
- [ ] **Step 3:** Implementare `presenceStep` in `presence.js` (in alto, commento sullo scopo e sul vincolo privacy). `lastNearAt` = ultimo `now` con un volto ≥ soglia; `since` = inizio della serie continua ≥ soglia (null se interrotta); `near` diventa vero quando `now - since >= 1000`, torna falso quando `now - lastNearAt > 3000`.
- [ ] **Step 4:** `npm test` → `fail 0`.
- [ ] **Step 5:** Commit `Add presenceStep: near/away from face sizes, no images`.

### Task 2: Webcam e MediaPipe nel renderer

**Files:**
- Create: `vendor/mediapipe/vision_bundle.js`, `vendor/mediapipe/wasm/vision_wasm_internal.js`, `vendor/mediapipe/wasm/vision_wasm_internal.wasm`, `vendor/mediapipe/face.tflite`, `vendor/mediapipe/README.md` (una riga: versione 1.2.3, licenza Apache-2.0, URL del modello)
- Modify: `presence.js`, `index.html` (CSP; `<script src="vendor/mediapipe/vision_bundle.js">` e `<script src="presence.js">` prima di `ui.js`), `main.cjs:212` (permesso), `Build-Wilco-Mac.command` e `Build-Wilco-Windows.command` (copiare `presence.js` e `vendor/`)
- Test: `test/e2e.mjs`

**Interfaces:**
- Consumes: `presenceStep` (Task 1).
- Produces: globale `Presence` con `start(): Promise<void>`, `stop(): void`, `feed(faces, now=performance.now()): void` (passa da `presenceStep`; usato dal ciclo della webcam e dai test e2e), `threshold: number`, `state` (ultimo stato), `status: 'off'|'starting'|'working'|'no-camera'|'no-permission'|'unavailable'`, `stream: MediaStream|null` (per l'anteprima), `onchange: (state, status) => void`.

- [ ] **Step 1: Vendor.** `npm pack @mediapipe/tasks-vision@1.2.3` in una cartella temporanea; copiare i tre file indicati. Modello: `curl -fL https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite -o vendor/mediapipe/face.tflite` (229746 byte).
- [ ] **Step 2: Test che falliscono** in `test/e2e.mjs`:

```js
test('the camera runs with the fake device, and nothing but camera.json is written', async t => {
  const {page, settings} = await launch(t);
  await until(page, () => window.Presence?.status === 'working', null, 15000);
  await page.waitForTimeout(1500);
  const written = fs.readdirSync(settings, {recursive: true}).filter(name => !String(name).startsWith('profile'));
  assert.ok(!written.some(name => /\.(png|jpe?g|webp|bmp|gif|webm|mp4|y4m|raw)$/i.test(name)), written.join(', '));
});
test('no camera or no permission: status says so and touch still starts a visit', async t => {
  const {page} = await launch(t);
  for (const [error, status] of [['NotFoundError', 'no-camera'], ['NotAllowedError', 'no-permission']]) {
    await page.evaluate(name => { Presence.stop(); navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('x', name)); return Presence.start(); }, error);
    assert.equal(await page.evaluate(() => Presence.status), status);
  }
  await visit(page, 'en');
  assert.equal(await mode(page), 'visit');
});
```

- [ ] **Step 3:** `node --test --test-concurrency=1 --test-name-pattern='camera' test/e2e.mjs` → FAIL (`Presence` non definito).
- [ ] **Step 4: Permesso** in `main.cjs:212`: accettare `p==='media'` con `details.mediaTypes` tutti in `['audio','video']`, stesse condizioni sulla finestra.
- [ ] **Step 5: CSP** in `index.html`: `script-src 'self' 'wasm-unsafe-eval'`.
- [ ] **Step 6: Implementare `Presence`** in `presence.js`: `start()` crea una volta `Vision.FaceDetector.createFromOptions(await Vision.FilesetResolver.forVisionTasks(new URL('vendor/mediapipe/wasm', location.href).href), {baseOptions: {modelAssetPath: new URL('vendor/mediapipe/face.tflite', location.href).href, delegate: 'GPU'}, runningMode: 'VIDEO', minDetectionConfidence: 0.5})` (errore → `unavailable`); `getUserMedia({video: {width: 320, height: 240}})` (`NotAllowedError`/`SecurityError` → `no-permission`, altro → `no-camera`) su un `<video muted playsinline>` non inserito nel DOM; ogni 200 ms `detectForVideo` → `faces` in frazioni (`width = boundingBox.width / videoWidth`, `x` = centro / `videoWidth`) → `feed`. Track `ended` o `no-camera` → nuovo tentativo dopo 10000 ms finché non c'è `stop()`. `stop()` ferma timer e track, `status='off'`, `stream=null`. `onchange` chiamato solo quando cambiano `near` o `status`.
- [ ] **Step 7:** Aggiungere `presence.js` e `vendor` agli elenchi di copia dei due script di build (`cp ... presence.js`, `ditto vendor "$app/vendor"`).
- [ ] **Step 8:** Test della Step 3 → PASS; `npm test` → `fail 0`.
- [ ] **Step 9:** Commit `Run MediaPipe face detection on the kiosk webcam (offline)`.

### Task 3: Risveglio e visita guidata dalla presenza

**Files:**
- Modify: `ui.js` (avvio di `Presence` dopo il caricamento della config, `setMode`, `touch`/`quiet`), `index.html` (elemento `#wake` nella sezione `#attract`), `style.css` (`body[data-presence="near"]`: anello acceso, avatar inclinato secondo `--face-x`; niente inclinazione con `prefers-reduced-motion`), `strings.js` (`added.<lang>.wake`)
- Test: `test/e2e.mjs`

**Interfaces:**
- Consumes: `Presence` (Task 2); `config.camera = {on:boolean, near:number, greet:boolean}` (fornito da Task 4; fino ad allora `ui.js` usa `{on:true, near:0.10, greet:false}` se manca).
- Produces: `document.body.dataset.presence = 'near'` (assente quando nessuno), CSS var `--face-x` (-1…1) su `body`.

- [ ] **Step 1: Test che falliscono** in `test/e2e.mjs`. Helper: `const near = page => page.evaluate(() => { Presence.stop(); window.__feed = setInterval(() => Presence.feed([{width: 0.3, x: 0.3}]), 200); }); const away = page => page.evaluate(() => { clearInterval(window.__feed); window.__feed = setInterval(() => Presence.feed([]), 200); });`

```js
test('a visitor who stops wakes Wilco, who sleeps again when they leave', async t => {
  const {page} = await launch(t);
  await near(page);
  await until(page, () => document.body.dataset.presence === 'near', null, 3000);
  assert.equal(await mode(page), 'attract');
  assert.ok(await page.isVisible('#wake'));
  await away(page);
  await until(page, () => !document.body.dataset.presence, null, 5000);
});
test('someone in front keeps the visit open; nobody for 20 s ends it', async t => {
  const {page} = await launch(t, {files: {'demo.json': {idleSeconds: 3}}});
  await visit(page, 'en');
  await near(page);
  await page.waitForTimeout(8000);
  assert.equal(await mode(page), 'visit');
  await away(page);
  await until(page, () => document.body.dataset.mode === 'attract', null, 26000);
});
test('presence does nothing while Settings are open', async t => {
  const {page} = await launch(t);
  await openSettings(page);
  await near(page);
  await page.waitForTimeout(1500);
  assert.equal(await mode(page), 'settings');
  assert.ok(!(await page.evaluate(() => document.body.dataset.presence)));
});
test('spoken greeting: never by default, at most once a minute when switched on', async t => {
  // greet off: due avvicinamenti → nessuna chiamata speak; greet on (camera.json {greet:true}): due avvicinamenti in 60 s → una sola
});
```

  L'ultimo test usa `calls()` del mock per contare le richieste di sintesi vocale come fanno i test esistenti sulla voce; con `files: {'camera.json': {greet: true}}` per il caso acceso.
- [ ] **Step 2:** Eseguire i 4 test → FAIL.
- [ ] **Step 3: Implementare.** In `ui.js`: dopo `api.config()`, se `config.camera.on` → `Presence.threshold = config.camera.near; Presence.onchange = presenceChanged; Presence.start()`. `presenceChanged(state)`: in `attract`, `body.dataset.presence` e `--face-x = (0.5 - state.face.x) * 2` (specchio: la webcam vede il visitatore rovesciato); testo `#wake` = `messages[teased?.lang || 'en'].wake`; se `config.camera.greet` e sono passati 60000 ms dall'ultimo saluto → `speak(messages[code].wake, code, seq, null, true)`. In `visit`: un timer ogni 1000 ms chiama `touched()` se `Presence.state.near` (`onchange` scatta solo ai cambi, non basta); `quiet()` resta com'è; lo stesso timer controlla: `config.camera.on && Presence.status==='working' && performance.now() - Presence.state.lastNearAt > 20000 && quiet()` → `endVisit()` (ma solo se nella visita è stato visto almeno un volto vicino, altrimenti valgono le regole di oggi). In `settings`: nessun effetto. Uscendo da `attract` togliere `data-presence`.
- [ ] **Step 4:** Testi `wake`: en `Hi! Tap to talk to me`, fr `Bonjour ! Touchez pour me parler`, de `Hallo! Tippen Sie, um mit mir zu sprechen`, it `Ciao! Tocca per parlare con me`.
- [ ] **Step 5:** I 4 test → PASS; `npm run e2e` → `fail 0`.
- [ ] **Step 6:** Commit `Wake Wilco when a visitor stops; keep or end the visit by presence`.

### Task 4: Riquadro «Camera» nelle Impostazioni

**Files:**
- Modify: `main.cjs` (lettura `camera.json` con `readMap`; `config.camera` nella risposta di `handle('config')`; `handle('camera', staff(next => …))`), `preload.cjs` (`'camera'`), `index.html` (`<div id="camera">` sotto `#voice`), `settings.js` (`showCamera()` chiamata da `openSettings`), `style.css`, `.gitignore` (`camera.json`)
- Test: `test/e2e.mjs`

**Interfaces:**
- Consumes: `Presence` (Task 2), `presenceChanged` (Task 3).
- Produces: `config.camera = {on:boolean, near:number, greet:boolean}`; `api.camera(next) -> {on, near, greet}` (salva e restituisce i valori validati: `on`/`greet` booleani, `near` numero arrotondato a 0.01 tra 0.05 e 0.30; altrimenti `Error('Unknown camera setting')`).

- [ ] **Step 1: Test che fallisce:**

```js
test('Settings camera: staff only, validated, saved in camera.json', async t => {
  const {page, settings} = await launch(t);
  await assert.rejects(page.evaluate(() => window.wilco.camera({on: false, near: 0.2, greet: true})), /Locked/);
  await openSettings(page);
  await page.fill('#camera-near', '0.2'); await page.dispatchEvent('#camera-near', 'change');
  await page.check('#camera-greet');
  await until(page, () => /saved/i.test(document.querySelector('#camera-status').textContent));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(settings, 'camera.json'), 'utf8')), {on: true, near: 0.2, greet: true});
  await assert.rejects(page.evaluate(() => window.wilco.camera({on: true, near: 5, greet: false})), /Unknown camera setting/);
  assert.ok(await page.isVisible('#camera-preview'));
});
```

- [ ] **Step 2:** Eseguirlo → FAIL.
- [ ] **Step 3: Implementare.** Riquadro: titolo «Camera: Wilco notices visitors who stop», testo «Frames stay in memory on this computer: nothing is stored or sent.», casella `#camera-on` «Camera on», cursore `#camera-near` (0.05–0.30, passo 0.01) «Distance: smaller = from further away», casella `#camera-greet` «Say hello aloud (at most once a minute)», anteprima `#camera-preview` (un `<video muted playsinline>` con `srcObject = Presence.stream`, specchiata, più un `<div>` per il riquadro del volto e il valore attuale della larghezza), `#camera-status` («Camera working», «No camera», «No permission: Windows Settings > Privacy & security > Camera», «Detection unavailable», «Camera off»). Ogni modifica → `api.camera(...)`, poi aggiorna `config.camera` e `Presence.threshold`, e avvia o ferma `Presence`. L'anteprima si stacca (`srcObject=null`) alla chiusura delle Impostazioni.
- [ ] **Step 4:** Test → PASS; `npm run e2e` → `fail 0`.
- [ ] **Step 5:** Commit `Settings: camera on/off, distance, spoken hello and live preview`.

### Task 5: Documentazione, unione, verifica

**Files:**
- Modify: `README.md` (sezione «Webcam»: cosa fa, privacy, cartello per lo stand in fr/en dal design, taratura con l'anteprima, permesso di Windows, GPU), `README-Windows.md` (permesso fotocamera accanto a quello del microfono)

- [ ] **Step 1:** Scrivere le due sezioni. Commit `Docs: webcam presence, privacy and calibration`.
- [ ] **Step 2:** Prova manuale sul Mac **solo con l'ok dell'utente** (apre la webcam vera e la richiesta di permesso di macOS): `WILCO_DEV=1 npm start` nel worktree, Impostazioni > Camera: il riquadro segue il volto, il risveglio arriva a circa 1 m.
- [ ] **Step 3:** Unione: quando l'altra sessione ha committato in `wilco-kiosk/`, `git merge presence-camera` su `main`; conflitti attesi in `preload.cjs` (elenco dei nomi: tenere entrambi), `index.html`, `settings.js`, `main.cjs`, `test/e2e.mjs`. Dopo l'unione `npm test` e `npm run e2e` → `fail 0`. Push solo con l'ok dell'utente.
