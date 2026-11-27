# Wilco per Windows touch e macOS

## Prova su macOS

Estrarre lo ZIP in una cartella scrivibile sul Mac. Installare Node.js 24 LTS con npm e aprire Start-Wilco.command. Il primo avvio scarica Electron per il Mac. Se si preferisce il Terminale, entrare nella cartella estratta ed eseguire `zsh -l ./Start-Wilco.command`. Cmd+Q chiude il prototipo. Per la voce, autorizzare il microfono quando macOS lo richiede e configurare .env come indicato sotto. Le schede e la navigazione touch o con il mouse sono disponibili anche senza chiavi.

## Prima prova interna su Windows

1. Installazione passo passo in README-Windows.md: `git clone` del repository oppure `Wilco-windows.zip` dalle Releases. Node.js non serve: `windows/` contiene Electron per Windows (Git LFS) e Start-Wilco.cmd lo avvia sulla cartella. Dopo un aggiornamento di Electron in package.json, eseguire Build-Wilco-Windows.command sul Mac e committare `windows/`. Alt+F4 chiude il prototipo.
2. Toccare OPS Dispatch, quindi Open live demo. Accedere con l'account dedicato alla sola azienda dimostrativa. La fascia Wilco rimane sul lato sinistro. All products riporta alle schede. Ripetere con SMS. La sessione di login è condivisa fra le demo e persiste al riavvio.
3. Il login di OPS e SMS staging passa da Keycloak (`https://sso.staging.ngft.com`), già consentito in demo.example.json. Per un altro identity provider, copiare demo.example.json in demo.json e aggiungere l'origine HTTPS esatta in loginOrigins. I popup sono bloccati. Questo prototipo supporta il login tramite navigazione nella stessa finestra.
4. Le demo live preimpostate in catalog.json sono su staging: OPS, SMS, TechLog, CrewOverview (`co.staging`), DocGen (`docgen2.staging`) e Audit (`audit2.staging`). FRAT non ha demo live. Per cambiare un indirizzo senza toccare il catalogo, usare `urls` in demo.json con l'identificativo del prodotto. Verificare i permessi del tenant e preparare dati ripristinabili. End visit cancella conversazione e vista corrente. Le modifiche fatte dall'utente restano salvate nell'app. Il ripristino dei dati è manuale.
5. Copiare .env.example in .env e compilare localmente i valori. Il modello deve supportare Chat Completions e JSON mode. Riavviare. Le chiamate ai provider partono dal processo principale del PC. Limitare l'accesso Windows alla cartella .env. Il pulsante rosso funziona come una radio: tieni premuto, parla, rilascia. Un tocco breve avvia l'ascolto fino al tocco successivo o per 20 secondi. La domanda audio va a OpenAI, il testo della risposta a ElevenLabs quando configurato. Con la chiave ElevenLabs, un Voice ID vuoto usa Darian. Puoi sostituirlo con una voce disponibile nel tuo account. In Impostazioni ogni lingua può avere la sua voce. Il testo funziona anche senza sintesi vocale.
6. Filmati delle domande: in `catalog.json` la lista `clips` di un prodotto dà un filmato per ogni domanda suggerita, nello stesso ordine (`null` = nessun filmato). Quando il visitatore tocca la domanda, il filmato parte muto sopra la risposta mentre Wilco parla. Un file che manca non mostra niente. Oggi OPS ha le clip mute 1, 2 e 19 e SMS la 9 (sulla domanda della matrice del Risk Register), da `ngft-tutorials/eur-2026/`, copiate in `media/stories/`. I tagli narrati non servono: parla Wilco. Per un'altra app: copiare la clip muta in `media/stories/` e aggiungere `clips` alla sua scheda. Lo ZIP contiene il catalogo e l'avatar. Tour dell'app: `"intro"` nella scheda (oggi OPS: `media/intro/ops.mp4`, 86 s, TechLog: `media/intro/techlog.mp4`, 84 s, Audit: `media/intro/audit.mp4`, 90 s, SMS: `media/intro/sms.mp4`, 88 s, CrewOverview: `media/intro/crew.mp4`, 75 s, e DocGen: `media/intro/docgen.mp4`, 74 s, da `ngft-tutorials/out/intro-<id>.mp4` senza traccia audio) parte muto quando il visitatore apre la scheda, mentre Wilco legge la panoramica. Una domanda toccata dopo lo sostituisce con la sua clip o lo nasconde. Per un'altra app: `ffmpeg -i <video>.mp4 -c copy -an media/intro/<id>.mp4` e `"intro": "media/intro/<id>.mp4"` nella sua scheda.
   Presentazione fissa e immagini (oggi CrewOverview): `"overview"` e `"overviewFollowUp"` nella scheda e in ogni lingua di `locales` sostituiscono la panoramica scritta dal modello (nessuna chiamata, voce tenuta su disco). `"images"` è la lista delle immagini con `caption` nelle quattro lingue: compaiono come miniature sotto il riassunto, un tocco le apre a schermo intero con la didascalia, un secondo tocco le chiude. Un «sì» alla domanda finale della presentazione apre le immagini con `"followUp": true`. Un file che manca non compare. Le immagini di CrewOverview vanno in `media/crew/`.
7. Prima dello stand provare il pulsante rosso tenuto premuto con il dito, il ritorno alla schermata di richiamo dopo 90 secondi senza tocchi, il pulsante «Settings» in alto a sinistra che apre il tastierino del PIN, il microfono nel rumore, un cambio prodotto a voce, un login scaduto, una modifica seguita dal ripristino, una visita successiva e una disconnessione. Le schede e il video importato funzionano offline. Il selettore English, Français, Deutsch, Italiano cambia schede, interfaccia, trascrizione, risposta e sintesi vocale. End visit ripristina English e torna alla schermata di richiamo.

## Contenuti e perimetro

Il catalogo iniziale contiene undici schede. Una scheda con `"hidden": true` in `catalog.json` parte spenta: il kiosk e il modello non la conoscono. Oggi partono spente Training, RegVault, EFB e NGFT AI, perché manca il materiale. In Impostazioni il team dello stand accende o spegne ogni prodotto, e la sua scelta vince sul catalogo. Il logo in alto a destra è `er-logo.png`. Ampliare facts con risposte validate per prodotto e tenant. La conversazione ha accesso a queste schede e al nome del prodotto selezionato. Il visitatore gestisce direttamente le pagine live. Wilco può proporre una scheda durante il dialogo, il visitatore sceglie se aprire la demo. Con un prodotto aperto Wilco passa a un altro prodotto solo se il visitatore lo vuole. Se il visitatore lo chiede, Wilco dice che lo accompagna, apre l'altro prodotto (dalla demo live passa alla demo live dell'altro, se c'è) e chiede che cosa vuole sapere. Se il visitatore lo nomina soltanto, Wilco resta dove è e può proporre il passaggio: un «sì» lo fa subito, senza chiamare il modello. Dopo l'ultima domanda suggerita di un prodotto Wilco propone il prodotto successivo del catalogo. Quando il visitatore dice di aver finito, Wilco propone un altro prodotto. La lettura dello stato live, i tour guidati passo passo e il reset dei record del tenant richiedono ulteriori integrazioni. Sul pannello pubblico usare Windows con account dedicato e restrizioni kiosk gestite dal personale IT.

## Configurazione della conversazione

I valori iniziali sono in .env.example. Il precedente valore gpt-4o-mini viene aggiornato a gpt-5.4 durante l’avvio. Se il modello primario supera 6,5 secondi o restituisce una risposta inutilizzabile, Wilco prova il modello di riserva. Una risposta vuota, troncata o con lettere di un altro alfabeto è inutilizzabile. Se primario e riserva sono lo stesso modello, Wilco lo interroga una seconda volta solo dopo una risposta inutilizzabile, non dopo un mancato collegamento. Se entrambi falliscono, resta disponibile il catalogo nella lingua selezionata. Su Mac Wilco.app usa ~/Library/Application Support/NGFT Wilco/.env. Per i valori che lì mancano legge il file .env nella cartella che contiene Wilco.app. Riavviare dopo le modifiche.

## Schermata di richiamo e fine visita automatica

Quando nessuno usa il kiosk, Wilco mostra una domanda in grande che cambia ogni 5 secondi. Le domande vengono dai prodotti con `"attract": true` in `catalog.json` (oggi solo OPS Dispatch): la domanda della scheda e le sue domande suggerite, ognuna nelle quattro lingue. I testi sono quelli della scheda, quindi il team dello stand li cambia in Impostazioni. Se nessun prodotto marcato è acceso, le domande vengono da tutti i prodotti accesi. Il tocco sulla domanda apre quel prodotto in quella lingua. Sotto la domanda scorrono i filmati muti presenti in `media/attract/` (mp4 o webm, in ordine alfabetico). Senza filmati resta la sola domanda.

- Un tocco qualsiasi avvia la visita in inglese e Wilco dà il benvenuto. Il benvenuto ha cinque varianti per lingua in `strings.js`: Wilco ne sceglie una a caso, mai la stessa due volte di fila.
- Un tocco sul pulsante rosso avvia la visita nella lingua della scritta sotto il pulsante.
- Un tocco su un pulsante lingua (EN, FR, DE, IT) cambia solo la lingua della schermata iniziale: la domanda resta in quella lingua e nulla parte. Il tocco successivo avvia la visita in quella lingua. A fine visita la schermata torna alle quattro lingue a rotazione. Regola delle lingue: il pulsante acceso è la lingua di Wilco. Durante la rotazione nessun pulsante è acceso. Il visitatore la cambia con i pulsanti, senza avviare né fermare nulla. Se parla o scrive in un'altra lingua del kiosk, Wilco risponde in quella lingua e schermo e pulsante la seguono.
- Un tocco sulla domanda apre quel prodotto nella lingua della domanda.

`idleSeconds` in `demo.json` (valore iniziale 90) è il tempo senza tocchi dopo il quale la visita termina. Dieci secondi prima Wilco chiede al visitatore di toccare lo schermo. Mentre Wilco parla o un filmato del prodotto è in riproduzione il tempo non scorre. I tocchi dentro la demo live contano come attività. Con `idleSeconds` a 0 la schermata di richiamo e la fine automatica sono disattivate. Le Impostazioni si chiudono comunque da sole dopo 5 minuti senza tocchi. Per mezzo secondo dopo l'inizio o la fine di una visita i tocchi sono ignorati: così il secondo tocco di un doppio tocco non fa danni.

## Impostazioni per il team allo stand

Le Impostazioni mostrano che cosa Wilco sa di ogni prodotto e permettono di correggerlo senza toccare i file.

1. Scrivere un PIN di sole cifre in `.env` alla voce `WILCO_SETTINGS_PIN` e riavviare. Senza PIN le Impostazioni restano chiuse.
2. Toccare «Settings» in alto a sinistra, poi digitare il PIN. Dopo cinque PIN errati il tastierino resta bloccato per un minuto.
3. A sinistra ci sono tutti i prodotti del catalogo. La casella «In the kiosk» sotto ogni prodotto decide se i visitatori lo vedono. La scelta vale subito e almeno un prodotto resta acceso.
4. «ElevenLabs voices», la fascia in cima, assegna a ogni lingua una voce ElevenLabs tra quelle dell'account. La scelta vale per tutti i prodotti. «Standard voice» è la voce di `.env`. «Test» fa sentire la lingua e dice se ha risposto ElevenLabs: lo schermo dei visitatori non lo dice mai. Una lingua senza scelta usa la voce di `.env`. La voce parla alla sua velocità naturale. Dopo un cambio di voce le risposte pronte di quella lingua prendono la voce nuova al primo ascolto, oppure tutte insieme con «Write what is missing, all products».
5. Scegliere il prodotto a sinistra. A destra ci sono quattro gruppi:
   - **Card**: domanda della scheda, riassunto e domande suggerite, nella lingua selezionata in alto a sinistra.
   - **Notes**: note inviate al modello con ogni domanda.
   - **Guide**: le sezioni della guida con titolo, testo e parole chiave di ricerca.
   - **Prepared answers**: le risposte pronte, vedi sotto.
6. «Test a question» elenca le sezioni della guida che Wilco userebbe per una domanda. In alto compare l'ultima domanda del visitatore con le sezioni usate.
7. «Save» applica subito la modifica. «Restore original» torna al testo di partenza e chiede un secondo tocco di conferma. «Close and lock» chiude e torna alla schermata di richiamo. «Quit Wilco» chiude l'app dopo un secondo tocco di conferma: serve sullo schermo touch senza tastiera. «Update Wilco», dopo un secondo tocco, esegue Update-Wilco.cmd: chiude Wilco, esegue `git pull`, mostra per 10 secondi le novità oppure «already up to date» e riapre Wilco da solo. Funziona solo sul PC Windows installato con `git clone`. Accanto al pulsante le Impostazioni mostrano la data della versione in uso e, se GitHub ne ha una più nuova, l'avviso in rosso. Un testo scritto e non ancora salvato resta nel campo, con la dicitura «not saved», anche dopo un cambio di prodotto o la chiusura automatica.
8. Le Impostazioni si chiudono da sole dopo cinque volte `idleSeconds` senza tocchi. Dieci secondi prima compare un avviso in alto.

Le modifiche e i prodotti accesi o spenti sono salvati in `overrides.json` accanto a `.env`: nella cartella dell'app su Windows, in ~/Library/Application Support/NGFT Wilco su Mac. Le voci scelte per le lingue sono in `voice.json`, nella stessa cartella. `catalog.json` e i file in `knowledge/` restano invariati, quindi le modifiche sopravvivono a una nuova build. Per portarle su un altro PC copiare `overrides.json` e `voice.json`. Se all'avvio il file non è leggibile, Wilco lo mette da parte come `overrides.json.unreadable-<numero>`, parte con i testi originali e lo segnala nelle Impostazioni.

## Risposte pronte

Per la presentazione di ogni prodotto e per le quattro domande suggerite Wilco può usare una risposta preparata prima: testo e voce ElevenLabs sono già sul disco, quindi la risposta parte subito e funziona senza connessione. Le altre domande seguono il percorso normale.

- In Impostazioni «Write what is missing, all products» scrive le risposte che mancano: l'introduzione più una per domanda suggerita, per ogni lingua: 148 con i sette prodotti in mostra (OPS ha sei domande, gli altri quattro). Prepara anche la voce del benvenuto e dei riassunti usati senza connessione.
- «Rewrite this product, 4 languages» riscrive tutte le risposte del prodotto selezionato (28 per OPS, 20 per gli altri), comprese quelle corrette a mano. Chiede un secondo tocco di conferma. Una risposta corretta a mano mentre la riscrittura è in corso viene conservata.
- Alla fine compare il riepilogo, per esempio «Done: 20 answers written, 3 without voice». «Without voice» significa che ElevenLabs non ha dato l'audio: quelle risposte userebbero la voce di sistema. Premere di nuovo «Write what is missing» quando chiavi e credito sono a posto: il testo resta, viene recuperata solo la voce.
- Generare le risposte dopo l'ultima modifica ai file in `knowledge/` e a `catalog.json`. Solo le modifiche fatte dalle Impostazioni segnano le risposte come più vecchie del testo.
- Ogni risposta usa una chiamata a OpenAI e una a ElevenLabs sul conto delle chiavi in `.env`. Le risposte sono scritte una alla volta.
- Rileggere le risposte nel gruppo «Prepared answers». Si possono correggere a mano: al salvataggio la voce viene rigenerata. Una risposta vuota torna al percorso normale.
- Dopo una modifica a note, riassunto o guida, le risposte del prodotto portano la dicitura «older than the product text». Restano in uso finché non vengono riscritte.

Le risposte sono in `cache/answers.json` e le voci in `cache/tts/`, accanto a `.env`. Per portarle sul PC dello stand copiare la cartella `cache`. Se cambiano voce o modello ElevenLabs le voci vengono rigenerate al primo uso.

## Test

- `npm test` controlla i contenuti: ogni domanda suggerita deve trovare la sua sezione di guida, in tutte le lingue, e le modifiche delle Impostazioni devono arrivare a Wilco. Non servono rete né chiavi.
- `npm run e2e` avvia il kiosk vero con sostituti di OpenAI ed ElevenLabs (`test/mock.cjs`), a costo zero, e prova richiamo, pulsante rosso, Impostazioni e risposte pronte. Il kiosk di prova è disegnato fuori schermo: non apre finestre, non prende la tastiera e su Mac non compare nel Dock. Usa `playwright-core` di `../test-auth`.
- `WILCO_DEV=1 npm start` apre Wilco in una finestra normale invece che a schermo intero. Vale solo il valore 1.

## Tutorial CrewOverview

Wilco include i 23 capitoli e le tre appendici del tutorial CrewOverview in `knowledge/crew`. La funzione in `knowledge.cjs` cerca nella copia locale e passa a OpenAI fino a cinque estratti pertinenti per domanda. I termini usati per cercare in quattro lingue sono in `knowledge/crew-topics.json`. Per aggiornare il contenuto, copia le nuove versioni dei capitoli da `crew-overview/NGFT-Crew-Tutorial-for-dev/source` e ricostruisci l’app.

Per provare, seleziona **CrewOverview** e chiedi «Come esporto in Excel il report con i filtri applicati?». Wilco dovrebbe citare **Export to Excel** e spiegare quali filtri e colonne vengono conservati. Poi chiedi «Cosa significa il punto arancione?». Il capitolo 13 descrive la **Buffer Zone**. Per queste domande serve la connessione a OpenAI.

## Guida e-TechLog

Wilco consulta 19 procedure, la matrice dei ruoli e tre scenari di demo tratti da `techlog/WILCO_PRODUCT_GUIDE.md`. La copia consultabile è in `knowledge/techlog.md`, con le parole chiave per le quattro lingue in `knowledge/techlog-topics.json`. Contiene le procedure documentate e le indicazioni di verifica. Gli appunti riservati al team e i controlli ancora da fare restano nella guida sorgente.

Per provare, seleziona **TechLog** e chiedi «Come collego un difetto a un ordine di lavoro?». La risposta dovrebbe indicare **Maintenance → Defects → Maintenance action → Assign** e spiegare che **Work Order #** è un campo dell’azione di manutenzione. Poi chiedi «Quando si chiude il difetto?». La risposta dovrebbe indicare il completamento e la firma dell’azione collegata.

## Guida NGFT Safety (SMS)

Wilco consulta 23 procedure, la mappa dei ruoli e tre scenari di demo tratti da `sms/WILCO_PRODUCT_GUIDE.md`. La copia consultabile è in `knowledge/sms.md`, con parole chiave per quattro lingue in `knowledge/sms-topics.json`. Gli estratti conservano il livello di verifica. Il documento sorgente contiene gli appunti interni e le verifiche ancora aperte.

Per provare, seleziona **SMS** e chiedi «Come preparo la matrice dei rischi per una riunione?». Poi chiedi «E se mi serve un PDF?». Wilco dovrebbe distinguere **Risk Register → Matrix → Export** per Excel da **Safety Cockpit → Export** per il riepilogo PDF. Per il triage, prova «Come smista una segnalazione il Safety Manager?».

## Guida NGFT Audit

Wilco consulta 22 procedure, la mappa dei ruoli e tre scenari di demo tratti da `audit-ngft-new/WILCO_PRODUCT_GUIDE.md`. La copia consultabile è in `knowledge/audit.md`, con parole chiave per quattro lingue in `knowledge/audit-topics.json`. Le procedure indicano cosa è stato visto su staging e cosa deriva dai sorgenti.

Per provare, seleziona **Audit** e chiedi «Come trovo i requisiti EASA che non ho ancora verificato?». Wilco dovrebbe indirizzarti ad **Audit Planning → Gap Analysis**. Poi chiedi «Chi può approvare RCA e CAP su un finding?». La guida distingue l’auditee che prepara l’analisi dai ruoli che possono approvarla nello step **Findings** dell’audit.

## Guida OPS Dispatch

Wilco consulta 18 procedure, i ruoli e tre scenari demo tratti da `ops/ngft-ops-frontend/WILCO_PRODUCT_GUIDE.md`. La copia consultabile è in `knowledge/ops.md` e le parole chiave per le quattro lingue sono in `knowledge/ops-topics.json`.

Per provare, seleziona **OPS Dispatch** e chiedi «Dove inserisco una nuova missione nel calendario?». Poi chiedi «Come avviso la crew?». Wilco dovrebbe distinguere un volo **Scheduled** da un volo **Engaged** e indicare **Engage jobs of aircraft**. Per le funzioni commerciali, prova «Che cosa succede quando un’offerta passa ad Accepted?».

## NGFT DocGen guide

Wilco uses the English NGFT DocGen 2 guide in `knowledge/docgen.md`. It includes 26 procedures, roles, revision states and three demo scenarios. The full guide and references are in `docgen-new/WILCO_PRODUCT_GUIDE.md`. The guide is based on source code and documentation. Its staging workflows are pending verification.

To try it, select **DocGen** and ask “How do I compare two revisions?”. Wilco should point to **File → Difference document**, explain **Compared with** and describe the Crew, Compliance and Authority editions.
