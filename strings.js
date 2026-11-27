const labels = {
 en: ['Your guide to NGFT','All products','What would you like to explore?','Tap to speak','Type your question','Ask','End visit','Explore by interest','Open live demo','Watch demo','Thinking…','Service unavailable. You can explore the catalog.','Demo unavailable. Please ask the stand team.','Transcribing…','Voice unavailable. Type your question.','Listening… tap to stop','Listening…','Microphone unavailable. Type your question.','Audio unavailable. You can read the answer above.','Catalog information','Language','Pick a question to hear how it works in the NGFT suite, or ask Wilco directly.','Standby','Listening','Speaking','Visitor','Introduce {name}: what is it for and what are its main tasks? Answer in two or three sentences.','I can’t answer that right now. My NGFT colleagues are right here at the stand: feel free to ask them.'],
 fr: ['Votre guide NGFT','Tous les produits','Que souhaitez-vous découvrir ?','Appuyez pour parler','Saisissez votre question','Envoyer','Terminer la visite','Que souhaitez-vous découvrir ?','Ouvrir la démo','Voir la vidéo','Un instant…','Service indisponible. Le catalogue reste accessible.','Démo indisponible. Adressez-vous à notre équipe.','Transcription…','Voix indisponible. Saisissez votre question.','J’écoute… touchez pour arrêter','À votre écoute…','Microphone indisponible. Saisissez votre question.','Audio indisponible. La réponse est affichée ci-dessus.','Fiche du catalogue','Langue','Choisissez une question pour découvrir son fonctionnement dans la suite NGFT, ou interrogez directement Wilco.','En veille','À l’écoute','Parle','Visiteur','Présente-moi {name} : à quoi sert-il et quelles sont ses principales fonctions ? Réponds en deux ou trois phrases.','Je ne peux pas répondre pour le moment. Mes collègues NGFT sont juste ici, sur le stand : n’hésitez pas à leur demander.'],
 de: ['Ihr Wegweiser durch NGFT','Alle Produkte','Was möchten Sie entdecken?','Zum Sprechen tippen','Ihre Frage eingeben','Fragen','Besuch beenden','Thema auswählen','Live-Demo öffnen','Video ansehen','Einen Moment…','Dienst nicht verfügbar. Der Katalog steht bereit.','Demo nicht verfügbar. Bitte fragen Sie unser Team.','Wird transkribiert…','Spracheingabe nicht verfügbar. Bitte tippen Sie Ihre Frage.','Ich höre zu… zum Beenden tippen','Ich höre zu…','Mikrofon nicht verfügbar. Bitte tippen Sie Ihre Frage.','Audio nicht verfügbar. Die Antwort steht oben.','Aus dem Katalog','Sprache','Wählen Sie eine Frage, um zu erfahren, wie es in der NGFT-Suite funktioniert, oder fragen Sie Wilco direkt.','Bereit','Hört zu','Spricht','Besucher','Stell mir {name} vor: Wofür ist es da und was sind seine wichtigsten Aufgaben? Antworte in zwei oder drei Sätzen.','Das kann ich gerade nicht beantworten. Meine NGFT-Kollegen sind direkt hier am Stand. Fragen Sie sie gern.'],
 it: ['La tua guida NGFT','Tutti i prodotti','Cosa vorresti scoprire?','Tocca per parlare','Scrivi la tua domanda','Invia','Termina visita','Scegli un argomento','Apri la demo live','Guarda il video','Un momento…','Servizio indisponibile. Puoi esplorare il catalogo.','Demo indisponibile. Chiedi al team allo stand.','Trascrizione…','Voce indisponibile. Scrivi la tua domanda.','In ascolto… tocca per fermare','In ascolto…','Microfono indisponibile. Scrivi la tua domanda.','Audio indisponibile. Puoi leggere la risposta qui sopra.','Scheda del catalogo','Lingua','Scegli una domanda per scoprire come funziona nella suite NGFT, oppure chiedi direttamente a Wilco.','In attesa','In ascolto','Sta parlando','Visitatore','Presentami {name}: a cosa serve e quali sono i suoi compiti principali? Rispondi in due o tre frasi.','Ora non riesco a rispondere. I miei colleghi NGFT sono qui allo stand: chiedi pure a loro.']
};
const keys = 'guide home welcome mic input ask end browse live clip thinking offline demo transcribing voice finish listening microphone audio catalog language intro standby hearing speaking visitor overview colleagues'.split(' ');
const messages = Object.fromEntries(Object.entries(labels).map(([lang,values])=>[lang,Object.fromEntries(keys.map((key,i)=>[key,values[i]]))]));
// Attract screen, push-to-talk and the warning before an unattended visit ends.
// hello: the welcome variants, one picked at random for each visit.
const added = {
  en: {hold: 'Hold to talk', release: 'Release to send', start: 'Touch to start', idle: 'Still there? Touch the screen to continue.',
    hello: ['Hello, I’m Wilco. Welcome to NGFT!','Hi, I’m Wilco, your guide to NGFT. Great to see you!','Welcome to the NGFT stand! I’m Wilco, and I’m here to help.','Hello and welcome! I’m Wilco. Let’s explore NGFT together.','Good to see you! I’m Wilco, your NGFT guide for today.']},
  fr: {hold: 'Maintenez pour parler', release: 'Relâchez pour envoyer', start: 'Touchez pour commencer', idle: 'Toujours là ? Touchez l’écran pour continuer.',
    hello: ['Bonjour, je suis Wilco. Bienvenue chez NGFT !','Bonjour, je suis Wilco, votre guide NGFT. Ravi de vous voir !','Bienvenue sur le stand NGFT ! Je suis Wilco, je suis là pour vous aider.','Bonjour et bienvenue ! Je suis Wilco. Découvrons NGFT ensemble.','Ravi de vous voir ! Je suis Wilco, votre guide NGFT aujourd’hui.']},
  de: {hold: 'Zum Sprechen gedrückt halten', release: 'Zum Senden loslassen', start: 'Zum Starten berühren', idle: 'Noch da? Berühren Sie den Bildschirm, um fortzufahren.',
    hello: ['Hallo, ich bin Wilco. Willkommen bei NGFT!','Hallo, ich bin Wilco, Ihr Guide für NGFT. Schön, Sie zu sehen!','Willkommen am NGFT-Stand! Ich bin Wilco und helfe Ihnen gern.','Hallo und willkommen! Ich bin Wilco. Entdecken wir NGFT gemeinsam.','Schön, dass Sie da sind! Ich bin Wilco, Ihr NGFT-Guide für heute.']},
  it: {hold: 'Tieni premuto per parlare', release: 'Rilascia per inviare', start: 'Tocca per iniziare', idle: 'Ci sei ancora? Tocca lo schermo per continuare.',
    hello: ['Ciao, sono Wilco. Benvenuti da NGFT!','Ciao, sono Wilco, la tua guida NGFT. Piacere di vederti!','Benvenuti allo stand NGFT! Sono Wilco e sono qui per aiutarti.','Ciao e benvenuti! Sono Wilco. Scopriamo NGFT insieme.','Che piacere vederti! Sono Wilco, la tua guida NGFT di oggi.']}
};
for (const [lang, values] of Object.entries(added)) Object.assign(messages[lang], values);
const topicLabels = {
  en: 'Suggested questions',
  fr: 'Questions suggérées',
  de: 'Vorgeschlagene Fragen',
  it: 'Domande suggerite'
};

// What Wilco says in the voice test of Settings.
const voiceTest={
 en:'Hello, I’m Wilco. Can you hear me?',
 it:'Ciao, sono Wilco. Mi senti?',
 fr:'Bonjour, je suis Wilco. Vous m’entendez ?',
 de:'Hallo, ich bin Wilco. Können Sie mich hören?'
};
