# Wilco su Windows

Non serve Node.js: Electron per Windows è già incluso. Con lo ZIP non serve installare niente. Con `git clone` serve solo Git per Windows.

## Requisiti

- Windows 10 o 11 a 64 bit.
- Connessione Internet per la voce (OpenAI, ElevenLabs) e per le demo live. Le schede, i filmati e le risposte già preparate funzionano anche offline.
- Un microfono, se si usa la voce.
- Una webcam, se si vuole che Wilco si accorga di chi si ferma davanti al kiosk (vedi «Webcam» nel README).
- Circa 600 MB liberi.

## Installazione da GitHub (git clone)

1. Installare [Git per Windows](https://git-scm.com/download/win) con le opzioni predefinite. Include Git LFS, che scarica `Wilco.exe`.
2. Aprire **Prompt dei comandi** e clonare il repository in una cartella dove si può scrivere:
   ```
   cd C:\
   git clone https://github.com/gianmichelesiano/wilco-kiosk.git
   ```
   Usare `git clone`, non «Download ZIP» dalla pagina GitHub: quello ZIP non contiene `Wilco.exe`.
3. Nella cartella `C:\wilco-kiosk` creare il file `.env` come al punto 4 della sezione successiva.
4. Doppio clic su **Start-Wilco.cmd**. Avvia `windows\Wilco.exe` sul codice della cartella.
5. Per aggiornare Wilco a una versione nuova: chiudere Wilco, poi nella cartella `C:\wilco-kiosk` eseguire `git pull`.

Senza `cache\` Wilco prepara le risposte e le voci dal vivo, quindi la prima volta è più lento. Per averle subito, copiare la cartella `cache\` da un'installazione esistente in `C:\wilco-kiosk`.

## Installazione dallo ZIP

1. Scaricare `Wilco-windows.zip` dalla pagina Releases del repository.
2. Clic destro sullo ZIP > **Estrai tutto…**. Scegliere una cartella dove si può scrivere, per esempio `C:\Wilco`. Non usare `C:\Programmi`: Wilco salva nella sua cartella le chiavi, le modifiche e le risposte preparate.
3. Aprire la cartella `Wilco` estratta. Rinominare `.env.example` in `.env`. Se Windows chiede conferma per il cambio di estensione, rispondere Sì.
4. Clic destro su `.env` > **Apri con** > **Blocco note**. Compilare questi valori e salvare:
   - `OPENAI_API_KEY`: chiave OpenAI (trascrizione e risposte).
   - `ELEVENLABS_API_KEY`: chiave ElevenLabs (voce di Wilco).
   - `WILCO_SETTINGS_PIN`: un PIN di sole cifre per aprire le Impostazioni del team dello stand. Senza PIN le Impostazioni restano chiuse.

   Senza chiavi funzionano le schede e il touch, ma Wilco non parla e non ascolta.
5. Doppio clic su **Wilco.exe**.
   - Al primo avvio Windows può mostrare «Windows ha protetto il PC», perché l'app non è firmata. Fare clic su **Ulteriori informazioni** > **Esegui comunque**.
   - Per la voce: in Impostazioni di Windows > Privacy e sicurezza > Microfono, attivare «Consenti alle app desktop di accedere al microfono».
   - Per la webcam: in Impostazioni di Windows > Privacy e sicurezza > Fotocamera, attivare «Consenti alle app desktop di accedere alla fotocamera». Le immagini restano sul PC: niente viene salvato o inviato.

## Uso

- Wilco parte a schermo intero. Per chiuderlo: «Settings» > PIN > **Quit Wilco**, poi toccare di nuovo il pulsante per confermare. Con una tastiera basta **Alt+F4**.
- Pulsante rosso: tenere premuto, parlare, rilasciare. Un tocco breve ascolta fino al tocco successivo o per 20 secondi.
- «Settings» in alto a sinistra apre il tastierino del PIN.
- Dopo una modifica a `.env`, chiudere e riaprire Wilco.

## File di Wilco

Si trovano accanto a `Wilco.exe` (installazione dallo ZIP) o accanto a `Start-Wilco.cmd` (installazione con git).

| File | Contenuto |
|---|---|
| `.env` | Chiavi e PIN. Non condividerlo. |
| `overrides.json` | Testi modificati e prodotti accesi o spenti nelle Impostazioni. |
| `voice.json` | Voce scelta per ogni lingua. |
| `cache\` | Risposte e voci già preparate. Wilco le riproduce subito, anche offline. |

Per passare a una versione nuova: estrarre il nuovo ZIP in un'altra cartella e copiarci questi file dalla cartella vecchia.

## Stand pubblico

Usare un account Windows dedicato con le restrizioni kiosk impostate dall'IT. Limitare l'accesso alla cartella di Wilco, perché contiene le chiavi.
