# Wilco si accorge di chi si avvicina (webcam)

Data: 2026-11-27. Stand NGFT a European Rotors, Lione, 1–3 dicembre 2026.

## Perché

Oggi Wilco aspetta un tocco: chi si ferma davanti al kiosk vede una domanda che cambia ogni 5 secondi e non sa che può parlare con lui. Con la webcam Wilco si accorge di chi si ferma e lo invita, così il kiosk "stupisce" e attira. La stessa webcam capisce quando il visitatore se ne va e libera il kiosk prima dei 90 secondi.

## Obiettivi

1. **Risveglio.** Sulla schermata di richiamo, un volto vicino e rivolto allo schermo per circa 1 secondo sveglia Wilco: l'anello attorno all'avatar si accende, l'avatar si inclina verso la posizione del volto, compare «Ciao! Tocca per parlare con me» nella lingua mostrata in quel momento. Dopo 3 secondi senza volti vicini torna come prima. La visita parte sempre con un tocco, come oggi.
2. **Saluto a voce** (opzionale): una frase breve, al massimo una al minuto. Interruttore nelle Impostazioni, spento all'inizio.
3. **Durante la visita:** un volto presente conta come attività, quindi la visita non finisce mentre il visitatore legge o ascolta. Nessun volto per 20 secondi, con Wilco in silenzio e nessun filmato: la visita finisce e Wilco torna alla schermata di richiamo. Senza webcam valgono le regole di oggi (`idleSeconds`).
4. **Impostazioni, riquadro «Camera»:** interruttore (acceso all'inizio), cursore «Distanza» (larghezza minima del volto rispetto all'inquadratura, valore iniziale 0,10, circa 1–1,5 m), anteprima piccola dal vivo con il riquadro del volto e il valore attuale, interruttore del saluto a voce, stato («Camera working», «No camera», «No permission», «Detection unavailable»).
5. **Degrado:** webcam assente, permesso negato, modello non caricato o GPU non disponibile → il kiosk funziona a tocco come oggi e lo stato nelle Impostazioni lo dice.

## Non obiettivi

- Nessun riconoscimento della persona, età, sesso o emozioni.
- Nessuna registrazione, nessun fotogramma salvato o inviato (né a OpenAI né altrove).
- Nessun avvio automatico della visita senza tocco.
- Niente statistiche dei passaggi per ora.

## Da evitare (anche se funzionasse)

- Wilco che parla a ogni persona che passa.
- Il kiosk che si blocca o si comporta in modo strano senza webcam.
- Immagini che escono dal PC.

## Vincoli

- Offline: tutti i file della rilevazione sono nel repo e caricati da `file://`.
- Pagina con CSP stretta e renderer in sandbox: serve solo aggiungere `'wasm-unsafe-eval'` a `script-src`.
- Permessi: oggi `main.cjs:212` accetta solo l'audio. Il video va accettato solo per la finestra principale, mai per la demo live.
- Windows: Impostazioni > Privacy e sicurezza > Fotocamera > «Consenti alle app desktop». Mac: `Wilco.app` ha già la descrizione per la fotocamera nell'Info.plist.
- Gli script di build copiano un elenco esplicito di file: `Build-Wilco-Mac.command` e `Build-Wilco-Windows.command` devono copiare anche i file nuovi.
- Privacy (Francia, GDPR, CNIL): cartello visibile allo stand, per esempio «Cette borne détecte la présence d'un visage pour vous saluer. Aucune image n'est enregistrée ni transmise. / This kiosk detects a face to greet you. No image is stored or sent.» Conferma da chi si occupa di privacy in NGFT: a carico del team, non del codice.
- 4 giorni all'expo; la taratura finale si fa allo stand.

## Strade considerate

| Strada | Esito |
|---|---|
| **A. MediaPipe Face Detector (BlazeFace short range), locale** | **Scelta.** Uguale su Windows e Mac, offline, dà larghezza e posizione del volto. |
| B. `FaceDetector` sperimentale di Chromium | Scartata: dietro un flag, comportamento diverso per sistema operativo. |
| C. Differenza tra fotogrammi (movimento) | Scartata: scatta con chiunque passi, non distingue chi si ferma. |
| D. Sensore di prossimità hardware | Scartata: hardware da comprare e montare in 4 giorni. |

## Prova eseguita (spike, 27/11)

Electron 42.11.18, pagina da `file://` con la CSP dell'app più `'wasm-unsafe-eval'`, sandbox e contextIsolation attivi, webcam finta da file:

- `@mediapipe/tasks-vision` 1.2.3 (Apache-2.0, uscita l'11/11) si carica come script classico (`vision_bundle.js` espone `Vision`): 60–75 ms.
- Ritratto reale: 1 volto, affidabilità 0,96, larghezza 0,14 dell'inquadratura, centrato. Fotogramma vuoto: 0 volti.
- Rilevazione su 320×240: circa 6 ms per fotogramma con GPU. Il primo fotogramma richiede 1,8 s (preparazione GPU).
- Con il delegate CPU: 0 volti sullo stesso video. Usare la GPU; sul PC dello stand verificare con l'anteprima delle Impostazioni.
- Il Wilco disegnato (`wilco.png`) non viene riconosciuto come volto: non serve.

## Come (deciso)

- File in `vendor/mediapipe/`: `vision_bundle.js`, `wasm/vision_wasm_internal.js`, `wasm/vision_wasm_internal.wasm`, `face.tflite` (circa 15 MB, in git normale).
- Nuovo `presence.js` nel renderer: webcam a 320×240, circa 5 rilevazioni al secondo, delegate GPU. Tiene il volto più grande e calcola uno stato `near` / `away` con le attese sopra. `ui.js` usa lo stato per il risveglio e per la fine della visita.
- La logica degli stati (volti per fotogramma → near/away con i tempi) è una funzione pura, con un test in `test/check.cjs`.
- Impostazioni della webcam in `camera.json` accanto a `.env`, con `readMap` / `writeMap` come `voice.json`; in `.gitignore`.
- La webcam si ferma mentre le Impostazioni sono chiuse e la camera è spenta; resta accesa solo se l'interruttore è acceso.

## Lasciato a chi costruisce

- Dettagli grafici del risveglio (luce dell'anello, inclinazione dell'avatar).
- Testi del saluto nelle quattro lingue, nello stile di `strings.js`.
- Test e2e: guidare lo stato near/away con un aggancio di test, senza volti veri; la rilevazione vera si controlla a mano con l'anteprima.
