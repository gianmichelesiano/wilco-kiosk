const {app, BrowserWindow, WebContentsView, ipcMain, session, shell} = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {pathToFileURL} = require('node:url');
const run = require('node:util').promisify(require('node:child_process').execFile);
const catalog = require('./catalog.json');
const knowledge = require('./knowledge.cjs');
const strings = require('./strings.js'); // The overview question the screen asks when a product opens.
const file = name => path.join(__dirname, name);
// Wilco.app keeps the Electron executable name, so app.isPackaged is false there: check where the code runs from.
const bundled = __dirname.startsWith(process.resourcesPath);
// Keys, demo.json, the stand team's edits and the prepared answers live here, outside the app.
const settingsDir = process.env.WILCO_SETTINGS_DIR
  || (!bundled ? __dirname
    : process.platform === 'darwin' ? path.join(app.getPath('appData'), 'NGFT Wilco')
    : path.dirname(process.execPath)); // Windows portable: next to Wilco.exe.
// The git clone this copy came from. On the Mac, Build-Wilco-Mac.command builds Wilco.app inside it.
const clone = bundled && process.platform==='darwin' ? path.resolve(__dirname, '../../../..') : __dirname;
// The stand: Start-Wilco.cmd runs the clone on Windows, Wilco.app runs on the Mac. Never a development run
// (npm start, tests): the update would replace the code under it.
const updater = !fs.existsSync(path.join(clone, '.git')) ? null
  : process.platform==='win32' && !bundled ? path.join(clone, 'Update-Wilco.cmd')
  : process.platform==='darwin' && bundled ? path.join(clone, 'Update-Wilco.command') : null;
const envFiles = [path.join(settingsDir, '.env')];
// Development copy: the .env beside Wilco.app fills in what the installed file lacks.
if(bundled && process.platform==='darwin') envFiles.push(path.resolve(__dirname, '../../../../.env'), path.resolve(__dirname, '../../../../wilco-kiosk/.env'));
for(const filename of [...new Set(envFiles)]){
  if(!fs.existsSync(filename))continue;
  const values=require('node:util').parseEnv(fs.readFileSync(filename,'utf8'));
  for(const key of ['OPENAI_API_KEY','OPENAI_MODEL','OPENAI_FALLBACK_MODEL','OPENAI_TRANSCRIBE_MODEL','ELEVENLABS_API_KEY','ELEVENLABS_VOICE_ID','ELEVENLABS_MODEL_ID','WILCO_SETTINGS_PIN']){
    if(!process.env[key]?.trim() && values[key]?.trim())process.env[key]=values[key].trim();
  }
}
const configPath = path.join(settingsDir, 'demo.json');
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : require('./demo.example.json');
const start = pathToFileURL(file('index.html')).href;
const urls = new Map(catalog.map(p => [p.id, config.urls?.[p.id] ?? p.url]).filter(([,v]) => v));
function origin(v) {
  const u = new URL(v);
  if (u.protocol !== 'https:' || u.username || u.password) throw Error('HTTPS demo URL required');
  return u.origin;
}
const origins = new Set([...urls.values(), ...(config.loginOrigins || [])].map(origin));

// Small JSON files beside the keys. A file that cannot be read is set aside under a new name, never
// overwritten, and Settings tell the stand team: the next save starts a fresh file.
const setAside = [];
function readMap(name) {
  const target = path.join(settingsDir, name);
  if (!fs.existsSync(target)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(target, 'utf8').replace(/^\uFEFF/, '')); // Windows editors add a byte-order mark.
    if (data && typeof data === 'object' && !Array.isArray(data)) return data;
  } catch { /* Set aside below. */ }
  fs.copyFileSync(target, `${target}.unreadable-${Date.now()}`);
  setAside.push(name);
  return {};
}
function writeMap(name, data) {
  const target = path.join(settingsDir, name);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target + '.tmp', JSON.stringify(data, null, 1), {flush: true});
  fs.renameSync(target + '.tmp', target); // A crash or a power cut never leaves half a file.
}
let overrides = readMap('overrides.json');   // Texts changed in Settings: see knowledge.cjs items().
let answers = readMap('cache/answers.json'); // Prepared answers: "language|product|question" -> answer.
let voiceChoice = readMap('voice.json');     // ElevenLabs voice chosen in Settings for a language: {"fr": "<voice id>"}.
let cameraChoice = readMap('camera.json');   // Webcam presence set in Settings: {"on": true, "near": 0.1, "greet": false}.
// near: the smallest face width, as a share of the frame, that counts as someone in front of the kiosk.
const cameraSettings = () => ({
  on: cameraChoice.on !== false,
  near: Number.isFinite(cameraChoice.near) && cameraChoice.near >= 0.05 && cameraChoice.near <= 0.30 ? cameraChoice.near : 0.10,
  greet: cameraChoice.greet === true
});
// A language without a choice, or with one that is no voice id, uses the voice of .env.
const chosenVoice = lang => /^[A-Za-z0-9]{1,64}$/.test(String(voiceChoice[lang] || '')) ? String(voiceChoice[lang]) : '';
knowledge.load(overrides);
// The file is written first: a change that could not be saved is not applied either.
function saveOverrides(next) { writeMap('overrides.json', next); overrides = next; knowledge.load(overrides); }
// The products visitors and the model get: "hidden" in catalog.json, unless the stand team chose otherwise in Settings.
const onShow = () => knowledge.products(catalog).filter(product => product.shown);
function saveAnswers(next) { writeMap('cache/answers.json', next); answers = next; }

let win, view, sideWidth = 400; // Sidebar width in style.css: 400 px, 96 px when the visitor makes Wilco small.
let generation = 0, turn = 0, history = [], greeted = false, lastContext = null;
function closeView() {
  if (!view) return;
  win.contentView.removeChildView(view);
  view.webContents.close();
  view = null;
}
function bounds() {
  if (!view) return;
  const [w,h] = win.getContentSize();
  const x = sideWidth;
  view.setBounds({x,y:0,width:Math.max(1,w-x),height:h});
}
function handle(name, fn) {
  ipcMain.handle(name,(event,...args) => {
    if(event.sender !== win.webContents || event.senderFrame?.url !== start) throw Error('Unknown caller');
    return fn(...args);
  });
}
function live(id) {
  closeView();
  if(!urls.has(id)) return false;
  view = new WebContentsView({webPreferences:{partition:'persist:wilco-demo',sandbox:true,nodeIntegration:false,contextIsolation:true}});
  const current = view;
  const wc = view.webContents;
  function allowed(v) { try { return origins.has(origin(v)); } catch { return false; } }
  function fail() {
    if(current !== view) return;
    closeView();
    win.webContents.send('demo-error');
  }
  for(const event of ['will-navigate','will-redirect']) wc.on(event,(e,url)=>{
    if(!allowed(url)){e.preventDefault();setImmediate(fail);}
  });
  wc.setWindowOpenHandler(()=>({action:'deny'}));
  wc.on('did-fail-load',(_e,code,_d,_url,main)=>{if(main && code!==-3) setImmediate(fail);});
  // A visitor working in the demo is present: tell the kiosk, at most once a second.
  let seen = 0;
  wc.on('input-event',()=>{
    if(Date.now()-seen<1000) return;
    seen = Date.now();
    win.webContents.send('activity');
  });
  win.contentView.addChildView(view);
  bounds();
  wc.loadURL(urls.get(id)).catch(fail);
  return true;
}
async function api(url, options, timeout=12000) {
  const response = await fetch(url,{...options,signal:AbortSignal.timeout(timeout)});
  if(!response.ok) throw Object.assign(Error('Provider unavailable'),{status:response.status});
  return response;
}
const supportedLanguages=['en','fr','de','it'];
const language = code => supportedLanguages.includes(code) ? code : 'en';
const greetings = {en: 'Hello!', fr: 'Bonjour !', de: 'Hallo!', it: 'Ciao!'};
const openingGreeting = /^(?:hallo|hello|hi|ciao|salve|bonjour|salut|guten (?:tag|morgen|abend)|good (?:morning|afternoon|evening)|buongiorno|buonasera|bonsoir)(?:[ \t]*(?:[,!]\s*(?:ich bin wilco|i[’']m wilco|sono wilco|je suis wilco)))?\s*[,!.–—:]\s*/iu;
const defaultFollowUps = {
  en: 'Would you like me to walk you through the next step?',
  fr: 'Voulez-vous que je vous explique la prochaine étape ?',
  de: 'Möchten Sie, dass ich Ihnen den nächsten Schritt erkläre?',
  it: 'Vuoi che ti spieghi il prossimo passaggio?'
};
const followUpOpening = {en: 'would you like', fr: 'voulez-vous', de: 'möchten sie', it: 'vuoi che'};
// After the last suggested question of a product, Wilco offers the next product in the kiosk.
const nextProductOffer = {
  en: 'Would you like to discover another system, for example {name}?',
  fr: 'Voulez-vous découvrir un autre système, par exemple {name} ?',
  de: 'Möchten Sie ein weiteres System entdecken, zum Beispiel {name}?',
  it: 'Vuoi che ti mostri un altro sistema, per esempio {name}?'
};
const affirmation = /^(?:s[iì](?: grazie| certo| volentieri)?|certo|volentieri|yes(?: please)?|sure|oui(?: merci| volontiers)?|volontiers|ja(?: bitte| gerne)?|gerne)[.!?]*$/iu;
// The four kiosk languages use the Latin alphabet. Now and then a model slips in letters of another one:
// such an answer is unusable, like an empty one.
const latin = /^[\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]*$/u;
const auth = () => ({Authorization:'Bearer '+process.env.OPENAI_API_KEY});
const now = () => new Date().toISOString();

const answerKey = (q,id,lang) => [lang,id||'',String(q).trim()].join('|');
// What the visitor reads and hears: the answer, then the question that offers the next step.
const spoken = (answer,greet) => [greet ? greetings[answer.language] : '',answer.text,answer.followUp].filter(Boolean).join('\n\n');
const turnOf = (q,id) => ({role:'user',content:JSON.stringify({activeProduct:id,question:q})});
// A product with "overview" in catalog.json introduces itself with that text and its "overviewFollowUp": no model,
// and the voice is kept on disk. A "yes" to that question shows the product's pictures marked "followUp".
function fixedOverview(q,id,lang) {
  const product=onShow().find(p=>p.id===id), local=product && (lang==='en' ? product : product.locales?.[lang]);
  if(!local?.overview || q.trim()!==strings[lang].overview.replace('{name}',product.name)) return null;
  return {text:local.overview,followUp:local.overviewFollowUp||defaultFollowUps[lang],language:lang,id,picturesOffered:true};
}
function remember(q,id,answer) {
  history=[...history,turnOf(q,id),{role:'assistant',content:JSON.stringify(answer)}].slice(-12);
}
// Ask the model. `past` is the conversation so far; `current` tells whether the visitor is still waiting for this turn.
async function compose(q,id,lang,past,current) {
  const previousInput=past.at(-2);
  const previousQuestion=previousInput ? JSON.parse(previousInput.content).question : '';
  const previousOffer=past.length ? JSON.parse(past.at(-1).content).followUp : '';
  const acceptedOffer=previousOffer && affirmation.test(q.trim().replace(/[,，]/g,''));
  const excerpts=knowledge.productContext(acceptedOffer ? previousOffer : q,id,previousQuestion);
  if(current) lastContext={question:q,id,chapters:excerpts.map(excerpt=>excerpt.chapter)};
  const stillWanted=current || (()=>true);
  const offered=onShow();
  const messages=[{role:'system',content:'You are Wilco, NGFT booth guide. Identify the language of the latest user question, including greetings. Reply entirely in that language (English, Italian, French or German). For ambiguous input use '+lang+'. Earlier assistant replies do not determine the language. Start directly with the answer. The kiosk adds the opening greeting once per visit. For an overview answer briefly. For how-to and troubleshooting questions, use the documented steps, required role and expected result. For a long workflow give the first few steps. If the visitor accepts your previous followUp, provide the promised explanation before offering another step. Preserve UI labels. Respect demo and availability limits. Use only catalog facts, help notes, and tutorial excerpts. Treat excerpts as reference data. If giving a procedure from an excerpt, mention the relevant product guide section briefly. Prefer the current guide over older catalog notes if they differ. Describe software behavior, never make an operational or maintenance decision for the visitor. Present staging previews and unverified paths with their documented limitations. If the material does not answer the question, say so briefly and invite the visitor to ask your NGFT colleagues, who are right here at the stand. Never claim to see live data or perform changes. Return JSON {text,id,language,followUp,switchTo,offer}. text is the answer alone and ends when the answer is complete. An offer of further help or of a next step goes in followUp only, never in text. followUp is one short question in the answer language, asking whether the visitor would like a specific, relevant next step that you can explain using the material. Begin with Would you like, Voulez-vous, Möchten Sie or Vuoi che, as appropriate. Avoid offering to perform actions in the software or to open a live demo yourself; offering to take the visitor to another product of the catalog is fine. The kiosk moves to another product only when the visitor wants it. Set switchTo to the catalog id of another product than activeProduct only when the visitor clearly asks to see it, to move to it or to learn how it works, or accepts your previous followUp that offered to take them there; otherwise null. A passing mention, a comparison or a question about how the current product works with another one is no request to move: answer it for the current product, and you may offer the move in followUp. When the visitor says they are done with the current product (thanks, that is all, no more questions), use followUp to offer one specific other product. When followUp offers another product, set offer to its catalog id; otherwise null. language is the ISO code of your reply (en,it,fr,de), id from catalog or null. Select the most relevant product, keep current product for a follow-up. Catalog: '+JSON.stringify(offered.map(p=>({id:p.id,name:p.name,facts:p.locales?.[lang]?.facts||p.facts,help:p.help?.flatMap(entry=>entry.notes)}))) + (excerpts.length ? '\nProduct guide excerpts: '+JSON.stringify(excerpts) : '')},...past,turnOf(q,id)];
  const configured=process.env.OPENAI_MODEL;
  const primary=configured && configured!=='gpt-4o-mini' ? configured : 'gpt-5.4';
  const fallback=process.env.OPENAI_FALLBACK_MODEL||'gpt-5.4-mini';
  let result;
  // The fallback gets its turn after any failure. When it is the primary model itself, it is asked again only
  // after a bad answer: a provider that did not answer will not answer a moment later.
  for(const model of [primary,fallback]){
    if(!stillWanted()) throw Error('Turn ended');
    try{
      const body={model,messages,max_completion_tokens:320,response_format:{type:'json_object'}};
      if(/^gpt-5\.4(?:-|$)/.test(model)) body.reasoning_effort='none';
      const r=await api('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{...auth(),'Content-Type':'application/json'},body:JSON.stringify(body)},6500);
      const msg=(await r.json()).choices[0].message;
      result=JSON.parse(msg.content);
      if(!supportedLanguages.includes(result?.language)||typeof result?.text!=='string'||!result.text.trim()||!latin.test(result.text)) throw Error('Unusable answer');
      break;
    }catch(error){
      result=null;
      const badAnswer=error instanceof SyntaxError || error.message==='Unusable answer';
      if(error.status===401 || (fallback===primary && !badAnswer)) break;
    }
  }
  if(!stillWanted()) throw Error('Turn ended');
  if(!result) return null;
  const proposedFollowUp=typeof result.followUp==='string' ? result.followUp.trim() : '';
  const followUp=proposedFollowUp.length<=180
    && proposedFollowUp.toLowerCase().startsWith(followUpOpening[result.language])
    && /^[^?\r\n]+\?$/.test(proposedFollowUp)
    && latin.test(proposedFollowUp)
    ? proposedFollowUp
    : defaultFollowUps[result.language];
  // A model sometimes writes a line break as the two characters backslash and n.
  const text=result.text.replace(/\\n/g,'\n').trim().replace(openingGreeting,'');
  // Moving and offering need a product open: from the product grid the answer's id opens its product, as before.
  const other=candidate=>id && candidate!==id && offered.some(p=>p.id===candidate) ? candidate : null;
  return {
    text,followUp,language:result.language,id:offered.some(p=>p.id===result.id)?result.id:null,
    switchTo:other(result.switchTo),
    offer:followUp===proposedFollowUp ? other(result.offer) : null // The default question offers no product.
  };
}
// ponytail: catalog order. Skip the products seen in this visit if visitors complain about an offer they already saw.
function offerNext(id,lang){
  const shown=onShow(), next=shown[(shown.findIndex(p=>p.id===id)+1)%shown.length];
  return next && next.id!==id ? {followUp:nextProductOffer[lang].replace('{name}',next.name),offer:next.id} : {};
}

// Settings are for the stand team: they open with WILCO_SETTINGS_PIN and close with the visit.
const pin = () => (process.env.WILCO_SETTINGS_PIN||'').trim();
let unlocked = false, wrongPins = 0, pinBlockedUntil = 0;
const staff = fn => (...args) => {
  if(!unlocked) throw Error('Locked');
  return fn(...args);
};

app.whenReady().then(()=>{
  const demo = session.fromPartition('persist:wilco-demo');
  demo.setPermissionRequestHandler((_wc,_p,cb)=>cb(false));
  demo.setPermissionCheckHandler(()=>false);
  demo.on('will-download',e=>e.preventDefault());
  // WILCO_DEV=1 opens a normal window instead of taking over the screen.
  win = new BrowserWindow({width:1440,height:900,minWidth:900,kiosk:process.env.WILCO_DEV!=='1',autoHideMenuBar:true,webPreferences:{autoplayPolicy:'no-user-gesture-required',preload:file('preload.cjs'),sandbox:true,contextIsolation:true,nodeIntegration:false}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',e=>e.preventDefault());
  // Microphone for talking, camera for noticing visitors (presence.js): only the kiosk page, never the live demo.
  session.defaultSession.setPermissionRequestHandler((wc,p,cb,details)=>cb(wc===win.webContents && wc.getURL()===start && p==='media' && details.mediaTypes?.every(t=>t==='audio'||t==='video')));
  // The kiosk page works from local files only; OpenAI and ElevenLabs are called from this process.
  // Second wall after the page CSP: MediaPipe's usage log (and anything else) never leaves the PC.
  session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*','ws://*/*','wss://*/*']},(_details,cb)=>cb({cancel:true}));
  handle('catalog',()=>onShow().map(p=>({...p,live:urls.has(p.id)})));
  handle('config',()=>{
    const folder=file('media/attract');
    return {
      // Seconds without a touch before the visit ends and the attract screen returns. 0 switches both off.
      idleSeconds:Number.isFinite(config.idleSeconds) ? Math.max(0,config.idleSeconds) : 90,
      clips:fs.existsSync(folder) ? fs.readdirSync(folder).filter(name=>/^[^.].*\.(?:mp4|webm)$/i.test(name)).sort().map(name=>'media/attract/'+name) : [],
      settings:!!pin(),
      camera:cameraSettings(),
      unreadable:setAside
    };
  });
  handle('live',live);
  handle('close',closeView);
  handle('side',small=>{sideWidth=small ? 96 : 400;bounds();});
  handle('reset',()=>{generation++;turn++;history=[];greeted=false;unlocked=false;closeView();});
  // The welcome on the attract screen replaces the greeting in the first answer.
  handle('greeted',()=>{greeted=true;});
  // `last`: the visitor has now asked every suggested question of the product, so Wilco offers another one.
  handle('ask',async(q,id,lang,last)=>{
    if(typeof q!=='string'||!q.trim()||q.length>1500) throw Error('Question too long');
    lang=language(lang);
    const seq=++turn;
    // "Yes" to "Would you like me to show you TechLog?": the kiosk moves at once, with no provider.
    const previous=history.length ? JSON.parse(history.at(-1).content) : {};
    const yes=affirmation.test(q.trim().replace(/[,，]/g,''));
    if(previous.offer && previous.offer!==id && yes && onShow().some(p=>p.id===previous.offer)){
      const answer={text:'',followUp:'',language:previous.language,id:previous.offer,switchTo:previous.offer};
      lastContext={question:q,id,switchTo:previous.offer};
      remember(q,id,answer);
      return answer;
    }
    // "Yes" to the closing question of a fixed overview: the screen shows the pictures while Wilco explains.
    const pictures=!!previous.picturesOffered && yes;
    const ready=fixedOverview(q,id,lang)||answers[answerKey(q,id,lang)];
    let answer, greet=false;
    if(ready){
      // Prepared in Settings or fixed in the catalog: no provider, no waiting.
      answer={text:ready.text,followUp:ready.followUp,language:ready.language,id:ready.id,...(ready.picturesOffered ? {picturesOffered:true} : {})};
      lastContext={question:q,id,prepared:true};
    }else{
      if(!process.env.OPENAI_API_KEY) return {text:null,id,offline:true,pictures};
      greet=history.length===0 && !greeted;
      answer=await compose(q,id,lang,history,()=>seq===turn);
      if(!answer) return {text:null,id,offline:true,pictures};
    }
    // Moving: the kiosk says its own words, so the model's answer is never heard and stays out of the history.
    if(answer.switchTo) Object.assign(answer,{text:'',followUp:''});
    else if(last===true) Object.assign(answer,offerNext(id,answer.language));
    remember(q,id,answer);
    return {...answer,text:spoken(answer,greet),ready:!!ready,pictures};
  });
  handle('listen',async(bytes,lang)=>{
    if(!process.env.OPENAI_API_KEY || !(bytes instanceof Uint8Array) || bytes.length>5e6) throw Error('Microphone service unavailable');
    const fd=new FormData();fd.set('model',process.env.OPENAI_TRANSCRIBE_MODEL||'gpt-4o-transcribe');fd.set('file',new Blob([bytes],{type:'audio/webm'}),'visitor.webm');
    const r=await api('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:auth(),body:fd});
    return (await r.json()).text;
  });
  // `keep` stores the ElevenLabs audio: the welcome and the prepared answers then play at once, also offline.
  // Answers to free questions are not kept, so the folder cannot grow with every visitor.
  handle('speak',async(text,lang,keep)=>{
    lang=language(lang);
    // The voice chosen in Settings for this language, else the one in .env, else Darian.
    const key=process.env.ELEVENLABS_API_KEY, voice=chosenVoice(lang)||process.env.ELEVENLABS_VOICE_ID||'gOupLcAkjEnguROwi4oS';
    const model=process.env.ELEVENLABS_MODEL_ID||'eleven_flash_v2_5';
    const phrase=String(text).slice(0,2200);
    const kept=path.join(settingsDir,'cache','tts',crypto.createHash('sha1').update(JSON.stringify([voice,model,lang,phrase])).digest('hex')+'.mp3');
    try{
      const bytes=new Uint8Array(await fs.promises.readFile(kept));
      if(bytes.length) return {bytes,type:'audio/mpeg',source:'ElevenLabs'};
    }catch{/* Not kept yet. */}
    let reason='no-key';
    if(key){
      try{
        const r=await api('https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(voice),{method:'POST',headers:{'xi-api-key':key,'Content-Type':'application/json',Accept:'audio/mpeg'},body:JSON.stringify({text:phrase,model_id:model,language_code:lang})},6500);
        const bytes=new Uint8Array(await r.arrayBuffer());
        if(bytes.length && r.headers.get('content-type')?.startsWith('audio/')){
          if(keep){
            try{
              await fs.promises.mkdir(path.dirname(kept),{recursive:true});
              await fs.promises.writeFile(kept+'.tmp',bytes);
              await fs.promises.rename(kept+'.tmp',kept);
            }catch{/* The answer still plays; it is fetched again next time. */}
          }
          return {bytes,type:'audio/mpeg',source:'ElevenLabs'};
        }
        reason='invalid-audio';
      }catch(error){reason=String(error.status||'connection');}
    }
    // On macOS use the installed voice even when the booth loses connectivity.
    if(process.platform==='darwin'){
      const os=require('node:os');
      const dir=await fs.promises.mkdtemp(path.join(os.tmpdir(),'wilco-voice-'));
      try{
        const output=path.join(dir,'voice.wav');
        const voiceName={en:'Samantha',it:'Alice',fr:'Thomas',de:'Anna'}[lang];
        await run('/usr/bin/say',['-v',voiceName,'-o',output,'--file-format=WAVE','--data-format=LEI16@22050','--',phrase],{timeout:15000});
        const bytes=await fs.promises.readFile(output);
        let hasSamples=false;
        for(let pos=12;pos+8<=bytes.length;){
          const size=bytes.readUInt32LE(pos+4);
          if(bytes.toString('ascii',pos,pos+4)==='data'){hasSamples=size>0 && pos+8+size<=bytes.length;break;}
          pos+=8+size+(size%2);
        }
        if(hasSamples)return {bytes:new Uint8Array(bytes),type:'audio/wav',source:'macOS',reason};
      }catch{/* The renderer also supports speech synthesis on the device. */}
      finally{await fs.promises.rm(dir,{recursive:true,force:true});}
    }
    return {source:'system',reason};
  });

  handle('unlock',code=>{
    if(!pin()) return 'unset';
    if(Date.now()<pinBlockedUntil) return 'wait';
    unlocked=String(code)===pin();
    wrongPins=unlocked ? 0 : wrongPins+1;
    if(wrongPins>=5){wrongPins=0;pinBlockedUntil=Date.now()+60000;}
    return unlocked ? 'ok' : 'wrong';
  });
  // Every product, in the kiosk or not: the stand team decides in Settings which ones visitors get.
  handle('apps',staff(()=>knowledge.products(catalog)));
  handle('quit',staff(()=>app.quit())); // The touch screen has no keyboard for Alt+F4.
  // Update-Wilco.cmd (Windows) and Update-Wilco.command (Mac) run git pull and start Wilco again.
  handle('update',staff(async()=>{
    if(!updater) throw Error('Update works only in a git clone: Start-Wilco.cmd on Windows, or Wilco.app built inside the clone on the Mac.');
    const error=await shell.openPath(updater); // In its own window: the stand team sees git's answer.
    if(error) throw Error(error);
    app.quit();
  }));
  // Settings shows which version runs and whether GitHub has a newer one. Only a git clone knows.
  handle('version',staff(async()=>{
    if(!fs.existsSync(path.join(clone,'.git'))) return null;
    const git=(...args)=>run('git',args,{cwd:clone,timeout:15000}).then(result=>result.stdout.trim());
    const date=await git('log','-1','--format=%cd','--date=format:%d %b %Y %H:%M');
    // Only the stand asks GitHub: the tests and development runs stay offline and compare with the last fetch.
    const fetched=updater ? git('fetch','--quiet') : Promise.resolve();
    const behind=await fetched.then(()=>git('rev-list','--count','HEAD..@{u}')).then(Number,()=>null); // Offline: unknown.
    return {date,behind};
  }));
  handle('show',staff((id,on)=>{
    if(!catalog.some(p=>p.id===id)) throw Error('Unknown product');
    if(!on && onShow().every(p=>p.id===id)) throw Error('One product must stay in the kiosk.');
    saveOverrides({...overrides,[id+'/@shown']:on ? 'yes' : 'no'});
  }));
  // The voices of the ElevenLabs account, to choose one for each language. Reading the list uses no credit.
  handle('voices',staff(async()=>{
    const list=[];
    let reason='';
    try{
      if(!process.env.ELEVENLABS_API_KEY) throw Object.assign(Error('No key'),{status:'no-key'});
      // ponytail: three pages of 100 voices. Follow more pages if an account ever has more.
      for(let page=0,next='';page<3;page++){
        const r=await api('https://api.elevenlabs.io/v2/voices?page_size=100'+(next ? '&next_page_token='+encodeURIComponent(next) : ''),{headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY}});
        const data=await r.json();
        for(const voice of data.voices||[]) list.push({
          id:String(voice.voice_id),
          name:String(voice.name||voice.voice_id),
          detail:[voice.labels?.gender,voice.labels?.accent,voice.labels?.description].filter(Boolean).join(', '),
          languages:(voice.verified_languages||[]).map(entry=>entry.language)
        });
        next=data.has_more ? data.next_page_token : '';
        if(!next) break;
      }
    }catch(error){reason=String(error.status||'connection');}
    list.sort((a,b)=>a.name.localeCompare(b.name));
    return {list,reason,chosen:Object.fromEntries(supportedLanguages.map(code=>[code,chosenVoice(code)]))};
  }));
  // An empty id gives the language back the voice of .env.
  handle('voice',staff((lang,id)=>{
    if(!supportedLanguages.includes(lang) || typeof id!=='string' || !/^[A-Za-z0-9]{0,64}$/.test(id)) throw Error('Unknown voice');
    const next={...voiceChoice};
    if(id) next[lang]=id; else delete next[lang];
    writeMap('voice.json',next);
    voiceChoice=next;
  }));
  // Webcam presence from Settings: camera on or off, the distance that counts as in front, the spoken hello.
  handle('camera',staff(next=>{
    const near=Number(next?.near);
    if(typeof next?.on!=='boolean' || typeof next?.greet!=='boolean' || !(near>=0.05 && near<=0.30)) throw Error('Unknown camera setting');
    cameraChoice={on:next.on,near:Math.round(near*100)/100,greet:next.greet};
    writeMap('camera.json',cameraChoice);
    return cameraSettings();
  }));
  // Everything Wilco knows about one product, plus the prepared answers to the questions the kiosk suggests.
  handle('context',staff((id,lang,questions)=>{
    lang=language(lang);
    const changedAt=overrides[id+'/@changed']||'';
    const prepared=(Array.isArray(questions) ? questions : []).slice(0,12).flatMap((q,index)=>{
      const key=answerKey(q,id,lang), answer=answers[key];
      // `spoken` and `language` let the panel fetch a voice that is still missing.
      const item=(kind,label,rows,text)=>({key:kind+':'+key,group:'Prepared answers',section:index ? String(q) : 'Introduction',label,rows,text,original:text,modified:false,stale:!!answer && answer.at<changedAt,spoken:answer ? spoken(answer) : '',language:answer?.language});
      return [item('answer','Answer. Empty: Wilco answers live.',5,answer?.text||''),item('followUp','Closing question',1,answer?.followUp||'')];
    });
    return {items:[...knowledge.items(catalog,id,lang),...prepared],last:lastContext};
  }));
  handle('probe',staff((q,id)=>knowledge.productContext(String(q).slice(0,1500),id).map(excerpt=>({product:excerpt.product,chapter:excerpt.chapter,excerpt:excerpt.excerpt.slice(0,220)}))));
  handle('save',staff((key,text)=>{
    key=String(key);
    if(text!==null && (typeof text!=='string' || text.length>30000)) throw Error('Text too long');
    const [kind,answer]=key.split(/:(.*)/s);
    if(kind==='answer' || kind==='followUp'){
      const [lang,id]=answer.split('|');
      const next={language:language(lang),id:catalog.some(p=>p.id===id) ? id : null,text:'',followUp:'',...answers[answer],[kind==='answer' ? 'text' : 'followUp']:(text||'').trim(),at:now()};
      const all={...answers};
      if(next.text) all[answer]=next; else delete all[answer];
      saveAnswers(all);
      // The panel gives the new text its voice.
      return next.text ? {text:spoken(next),language:next.language} : null;
    }
    const product=key.split('/')[0];
    if(!/^[a-z]+\/[A-Za-z0-9._-]+$/.test(key) || !catalog.some(p=>p.id===product)) throw Error('Unknown text');
    const all={...overrides};
    if(text===null) delete all[key]; else all[key]=text;
    // Prepared answers were written from the earlier notes, summary and guide: Settings marks them.
    if(!/\/(?:prompt|questions)\./.test(key)) all[product+'/@changed']=now();
    saveOverrides(all);
    return null;
  }));
  // Write one prepared answer with the model. No history: the answer must stand alone.
  // `since` is the start of the run: an answer written or corrected by hand after it is kept.
  handle('bake',staff(async(q,id,lang,since)=>{
    if(typeof q!=='string'||!q.trim()||q.length>1500) throw Error('Question too long');
    lang=language(lang);
    const key=answerKey(q,id,lang);
    const newer=()=>typeof since==='string' && answers[key]?.at>since ? {text:spoken(answers[key]),language:answers[key].language} : null;
    if(newer()) return newer();
    const answer=await compose(q,id,lang,[]);
    if(!answer) return null;
    if(newer()) return newer(); // Corrected while the model was writing.
    // The answer belongs to the product it was prepared for: a visitor who taps its question stays there.
    saveAnswers({...answers,[key]:{...answer,id:catalog.some(p=>p.id===id) ? id : answer.id,at:now()}});
    return {text:spoken(answer),language:answer.language};
  }));
  win.on('resize',bounds);
  win.on('close',closeView);
  win.loadURL(start);
});
app.on('window-all-closed',()=>app.quit());
