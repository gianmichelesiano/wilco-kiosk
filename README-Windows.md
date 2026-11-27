# Wilco su Windows

Versione pronta: non serve installare niente, né Node.js né altri programmi.

## Requisiti

- Windows 10 o 11 a 64 bit.
- Connessione Internet per la voce (OpenAI, ElevenLabs) e per le demo live. Le schede, i filmati e le risposte già preparate funzionano anche offline.
- Un microfono, se si usa la voce.
- Circa 600 MB liberi.

## Installazione

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

## Uso

- Wilco parte a schermo intero. **Alt+F4** lo chiude.
- Pulsante rosso: tenere premuto, parlare, rilasciare. Un tocco breve ascolta fino al tocco successivo o per 20 secondi.
- «Settings» in alto a sinistra apre il tastierino del PIN.
- Dopo una modifica a `.env`, chiudere e riaprire Wilco.

## File accanto a Wilco.exe

| File | Contenuto |
|---|---|
| `.env` | Chiavi e PIN. Non condividerlo. |
| `overrides.json` | Testi modificati e prodotti accesi o spenti nelle Impostazioni. |
| `voice.json` | Voce scelta per ogni lingua. |
| `cache\` | Risposte e voci già preparate. Wilco le riproduce subito, anche offline. |

Per passare a una versione nuova: estrarre il nuovo ZIP in un'altra cartella e copiarci questi file dalla cartella vecchia.

## Stand pubblico

Usare un account Windows dedicato con le restrizioni kiosk impostate dall'IT. Limitare l'accesso alla cartella di Wilco, perché contiene le chiavi.
