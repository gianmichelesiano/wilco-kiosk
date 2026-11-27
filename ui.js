const $=s=>document.querySelector(s);
const api=window.wilco;
let products=[], active=null, seq=0, recorder, player, audioUrl, recordingPending=false;
let lang='en', state='standby', stopMeter=null, liveOpen=false;
// attract: nobody is at the kiosk. visit: a visitor is here. settings: the stand team is editing (settings.js).
let mode='attract', config={idleSeconds:0,clips:[],settings:false}, busy=false, holding=false, idleTimer, warnTimer;
// A visit has just started or ended: for half a second touches are ignored, so the second tap of a
// double tap does not act on what has just appeared.
let settledAt=-1000, lastInput=Date.now();
const settling=()=>performance.now()-settledAt<500;
const introduced=new Set();
const t=key=>messages[lang][key];
const stateLabels={standby:'standby',listening:'hearing',thinking:'thinking',speaking:'speaking'};
const areaIcons={'Flight operations':'flight',Maintenance:'build',Safety:'health_and_safety',Crew:'groups',Training:'school',Compliance:'verified',Knowledge:'menu_book'};
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const film=$('#film');
function el(tag,className,text){const e=document.createElement(tag);e.className=className;if(text!=null)e.textContent=text;return e;}
function icon(name,extra=''){const e=el('span',('ms '+extra).trim(),name);e.setAttribute('aria-hidden','true');return e;}
function local(p){return {...p,...p.locales?.[lang]};}

// Waveform: 36 bars with staggered timing for the CSS fallback animation.
$('#wave').append(...Array.from({length:36},(_,i)=>{
  const bar=document.createElement('span');
  bar.style.setProperty('--d',(.45+(i*7%11)/12).toFixed(2)+'s');
  bar.style.setProperty('--delay',(-(i*.37%1)).toFixed(2)+'s');
  return bar;
}));
// The overlaid lip curves follow the original illustration in its own pixel coordinates.
const mouth = $('#speaking-mouth');
const cavity = mouth.querySelector('.mouth-inside');
const teeth = mouth.querySelector('.mouth-teeth');
const tongue = mouth.querySelector('.mouth-tongue');
function poseMouth(amount) {
  mouth.setAttribute('opacity', Math.min(1, amount * 6));
  if (!amount) return;
  const depth = 32 * amount;
  cavity.setAttribute('d', `M86 157 Q141 173 207 150 C190 ${177+depth} 169 ${188+depth} 138 ${189+depth} Q102 ${190+depth} 86 157Z`);
  teeth.setAttribute('d', `M99 162 Q148 170 198 155 Q183 ${180-depth*.5} 151 ${185-depth*.67} Q108 ${189-depth*.65} 99 162Z`);
  tongue.setAttribute('d', `M120 ${183+depth} Q137 ${184+depth*.47} 149 ${183+depth*.56} Q164 ${176+depth*.42} 176 ${180+depth*.82} Q150 ${195+depth} 120 ${183+depth}Z`);
}
// Drive the bars from the real audio level when a stream is available.
function meter(stream){
  if(!stream||reducedMotion.matches)return null;
  let ctx;
  try{
    ctx=new AudioContext();
    const analyser=ctx.createAnalyser();analyser.fftSize=128;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const bins=new Uint8Array(analyser.frequencyBinCount), wave=$('#wave'), bars=[...wave.children];
    const samples=new Float32Array(analyser.fftSize);
    let frame, opening=0, last=performance.now();
    const draw=()=>{
      analyser.getByteFrequencyData(bins);
      if(state==='speaking'){
        analyser.getFloatTimeDomainData(samples);
        let energy=0;
        for(const sample of samples)energy+=sample*sample;
        const target=Math.min(1, Math.max(0, Math.sqrt(energy/samples.length)-.008)*5.8);
        const now=performance.now(), tau=target>opening?25:55;
        opening+=(target-opening)*(1-Math.exp(-(now-last)/tau));
        last=now;
        poseMouth(opening<.01?0:opening);
      }
      // Mirror the voice band around the centre; keep the CSS animation until the context runs.
      wave.classList.toggle('live',ctx.state==='running');
      bars.forEach((bar,i)=>bar.style.transform=`scaleY(${(.15+bins[Math.abs(i-17.5)|0]/255*.85).toFixed(3)})`);
      frame=requestAnimationFrame(draw);
    };
    ctx.resume().catch(()=>{});draw();
    return()=>{cancelAnimationFrame(frame);ctx.close();wave.classList.remove('live');bars.forEach(bar=>bar.style.transform='');};
  }catch{ctx?.close();return null;}
}
function setState(next,stream){
  state=next;document.body.dataset.state=next;
  $('#statetext').textContent=t(stateLabels[next]);
  const listening=next==='listening';
  $('#mic .ms').textContent=listening?'graphic_eq':'mic';
  $('#miclabel').textContent=t(listening?(holding?'release':'finish'):'hold');
  $('#core').setAttribute('aria-pressed',listening);
  stopMeter?.();poseMouth(0);stopMeter=meter(stream);
  if(next==='standby')touch(); // The idle clock starts when Wilco falls silent.
}
// Minimal Markdown for answers (**bold**, *italic*, `code`, bullets, headings), built as DOM nodes, never innerHTML.
function rich(text){
  const p=el('p','');
  const source=text.replace(/^#{1,6}[ \t]*/gm,'').replace(/^[ \t]*[-*][ \t]+/gm,'• ');
  for(const part of source.split(/(\*\*[^*\n]+\*\*|\*[^*\s][^*\n]*\*|`[^`\n]+`)/)){
    if(/^\*\*[\s\S]+\*\*$/.test(part))p.append(el('strong','',part.slice(2,-2)));
    else if(/^\*[\s\S]+\*$/.test(part))p.append(el('em','',part.slice(1,-1)));
    else if(/^`[\s\S]+`$/.test(part))p.append(el('code','',part.slice(1,-1)));
    else if(part)p.append(part);
  }
  return p;
}
// Same text without Markdown markers, for the voice.
const plain=text=>text.replace(/^#{1,6}[ \t]*/gm,'').replace(/^[ \t]*[-*][ \t]+/gm,'').replace(/\*\*|`/g,'').replace(/\*(\S[^*\n]*)\*/g,'$1');
function say(who,text){
  const box=$('#transcript');
  const msg=el('div','msg '+who), label=el('small','',who==='wilco'?'Wilco':t('visitor'));
  if(who==='visitor')label.dataset.t='visitor';
  if(who==='wilco'){box.querySelector('.latest')?.classList.remove('latest');msg.classList.add('latest');}
  msg.append(label,rich(text));box.append(msg);
  showNewest(box);
}
// A long answer is read from its first line: bring the start of the newest message into view.
function showNewest(box){
  const newest=box.lastElementChild;
  box.scrollTop=newest ? newest.offsetTop-16 : 0;
}
// With a product open, the chat uses the wide main area; the live demo covers that area, so then it stays in the sidebar.
function placeChat(){
  const box=$('#transcript');
  if(active && !liveOpen)$('#topics').before(box);else $('#controls').before(box);
  showNewest(box);
}
function revealTopics(){
  const group=$('#topics');
  if(!group.hidden || !active)return;
  const product=products.find(item=>item.id===active);
  // The questions with a clip come first. The clip still follows its question, whatever the position.
  const all=local(product).questions||[], questions=[...all.filter((_,i)=>product.clips?.[i]),...all.filter((_,i)=>!product.clips?.[i])];
  group.setAttribute('aria-label',topicLabels[lang]);
  group.replaceChildren(...questions.map(question=>{
    const button=el('button','topic',question);
    button.type='button';
    if(clipOf(question))button.prepend(icon('play_circle','clip')); // This answer comes with a clip.
    button.onclick=()=>ask(question);
    return button;
  }));
  group.hidden=!questions.length;
  introduced.add(lang+':'+active);
}
function closeLive(){liveOpen=false;return api.close();}
function stopAudio(){
  window.speechSynthesis?.cancel();
  if(player){player.pause();player=null;}
  if(audioUrl){URL.revokeObjectURL(audioUrl);audioUrl=null;}
  film.pause();
}
function interrupt(){
  seq++;stopAudio();recordingPending=false;
  if(recorder?.state==='recording')recorder.stop();
  setState('standby');
  $('#status').textContent='';
}
function show(id){
  const found=products.find(item=>item.id===id);
  const p=found && local(found);
  active=p?.id||null;
  $('#topics').hidden=true;
  $('#browse').hidden=!!p;$('article').hidden=!p;$('#home').hidden=!p;
  showFilm(null);
  if(p){
    $('#area').textContent=p.area;$('#name').textContent=p.name;$('#facts').textContent=p.facts;
    $('#live').hidden=!p.live;
  }
  placeChat();
}
function choose(p,card,beforeOverview){
  for(const b of $('#grid').children)b.setAttribute('aria-pressed',b===card);
  interrupt();closeLive();show(p.id);
  const first=!introduced.has(lang+':'+p.id);
  revealTopics(); // The questions show at once: a visitor can tap one during the welcome or the introduction.
  // The app's tour (catalog.json "intro", no sound) plays while Wilco gives the overview. It starts after ask(),
  // whose first step clears the film. A question tapped later shows its own clip or hides the tour.
  const overview=()=>{if(first)ask(t('overview').replace('{name}',p.name),false);showFilm(p.intro||null);};
  if(beforeOverview)beforeOverview(overview);
  else overview();
}
// A suggested question with a clip (catalog.json "clips", same order as the questions) plays it, muted,
// while Wilco answers. Any other question hides it.
// ponytail: matched by position. If Settings change the number of questions in one language, its clips shift.
function showFilm(src){
  film.hidden=!src;
  if(src){film.src=src;film.play().catch(()=>{});}
  else{film.removeAttribute('src');film.load();}
}
function clipOf(q){
  const product=products.find(p=>p.id===active);
  return product?.clips?.[(local(product).questions||[]).indexOf(q)]||null;
}
async function ask(q,showQuestion=true){
  q=q.trim();if(!q)return;
  interrupt();let token=seq;
  showFilm(clipOf(q));
  if(showQuestion)say('visitor',q);
  setState('thinking');$('#status').textContent=t('thinking');$('#question').value='';
  try{
    const r=await api.ask(q,active,lang);if(seq!==token)return;
    // The visitor spoke another kiosk language: Wilco answers in it and the screen and the buttons follow.
    if(messages[r.language] && r.language!==lang){setLanguage(r.language);token=seq;}
    if(r.id && r.id!==active){await closeLive();if(seq!==token)return;show(r.id);}
    const text=r.text || (active ? local(products.find(p=>p.id===active)).facts : t('welcome'));
    say('wilco',text);$('#status').textContent='';
    if(r.offline)$('#status').textContent=t('offline');
    // Prepared answers and the offline summary are a fixed set: their voice is kept on disk.
    await speak(text,r.language||lang,token,revealTopics,!!(r.ready||r.offline));
  }catch{
    if(seq===token){
      setState('standby');
      $('#status').textContent=t('offline');
      revealTopics();
    }
  }
}
async function speak(text,voiceLang,token,onDone,keep=false){
  text=plain(text);
  const finish=()=>{
    if(seq!==token)return;
    setState('standby');
    onDone?.();
  };
  let audio;
  try{
    audio=await api.speak(text,voiceLang,keep);
    if(seq!==token)return;
    if(audio?.bytes?.length){
      audioUrl=URL.createObjectURL(new Blob([audio.bytes],{type:audio.type}));
      const current=player=new Audio(audioUrl);
      // Only the end of this answer returns to standby; never overrides listening.
      current.onended=finish;
      current.onerror=finish;
      await current.play();
      if(seq===token && !current.ended){
        let stream;
        try{stream=current.captureStream?.();}catch{/* Audio playback can continue without a meter. */}
        setState('speaking',stream);
      }
      return audio; // Who gave the voice: only the voice test in Settings says it, never the visitor screen.
    }
  }catch{/* Try the voice installed on the device. */}
  if(seq!==token)return;
  if(!window.speechSynthesis){$('#status').textContent=t('audio');finish();return audio;}
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang=voiceLang;
  const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith(voiceLang));
  if(voice)utterance.voice=voice;
  utterance.onstart=()=>{if(seq===token)setState('speaking');};
  // Native speech has no output stream. Word boundaries give it a small, approximate lip movement.
  utterance.onboundary=()=>{
    if(seq!==token || state!=='speaking' || reducedMotion.matches)return;
    poseMouth(.58);
    clearTimeout(boundaryTimer);
    boundaryTimer=setTimeout(()=>{if(seq===token && state==='speaking')poseMouth(0);},110);
  };
  let boundaryTimer;
  utterance.onend=()=>{clearTimeout(boundaryTimer);finish();};
  utterance.onerror=()=>{if(seq===token){$('#status').textContent=t('audio');finish();}};
  speechSynthesis.speak(utterance);
  return audio;
}
$('form').onsubmit=e=>{e.preventDefault();ask($('#question').value);};
$('#home').onclick=()=>{interrupt();closeLive();show(null);};
$('#live').onclick=async()=>{interrupt();liveOpen=await api.live(active);placeChat();};
api.onDemoError(()=>{liveOpen=false;placeChat();$('#status').textContent=t('demo');});
film.onended=film.onpause=()=>touch(); // The idle clock starts when the clip stops.

// Push-to-talk, as on a radio: hold, speak, release. A short tap keeps listening until the next tap or 20 seconds.
const mic=$('#mic');
let pressedAt=0, tones;
function blip(frequency){
  try{
    tones??=new AudioContext();
    const oscillator=tones.createOscillator(), gain=tones.createGain(), at=tones.currentTime;
    oscillator.frequency.value=frequency;
    gain.gain.setValueAtTime(.12,at);gain.gain.exponentialRampToValueAtTime(.0001,at+.09);
    oscillator.connect(gain).connect(tones.destination);
    oscillator.start(at);oscillator.stop(at+.1);
  }catch{/* The click is a courtesy; talking works without it. */}
}
async function record(){
  if(recordingPending)return;
  interrupt();const token=seq;recordingPending=true;blip(880);
  let stream;
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
    if(seq!==token){stream.getTracks().forEach(t=>t.stop());return;}
    const rec=new MediaRecorder(stream,{mimeType:'audio/webm'});recorder=rec;
    const chunks=[];rec.ondataavailable=e=>chunks.push(e.data);
    rec.onstop=async()=>{
      clearTimeout(deadline);stream.getTracks().forEach(t=>t.stop());
      if(seq!==token)return;
      blip(660);setState('thinking');$('#status').textContent=t('transcribing');
      try{
        const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());
        const q=await api.listen(bytes,lang);
        if(seq!==token)return;
        $('#status').textContent='';
        if(q.trim())ask(q);else setState('standby');
      }catch{if(seq===token){setState('standby');$('#status').textContent=t('voice');}}
    };
    rec.start();const deadline=setTimeout(()=>{if(rec.state==='recording')rec.stop();},20000);
    setState('listening',stream);$('#status').textContent=t('listening');
  }catch{stream?.getTracks().forEach(t=>t.stop());if(seq===token)$('#status').textContent=t('microphone');}
  finally{if(seq===token)recordingPending=false;}
}
const toggleRecording=()=>recorder?.state==='recording'?recorder.stop():record();
mic.onpointerdown=event=>{
  if(event.button||settling())return;
  mic.setPointerCapture(event.pointerId);
  if(recorder?.state==='recording'){recorder.stop();return;} // The second tap ends a recording started with a tap.
  holding=true;pressedAt=performance.now();record();
};
mic.onpointerup=mic.onpointercancel=()=>{
  if(!holding)return;
  holding=false;
  if(performance.now()-pressedAt<400){ // A tap: keep listening.
    if(state==='listening')$('#miclabel').textContent=t('finish');
    return;
  }
  if(recorder?.state==='recording')recorder.stop();
  // Released before the microphone opened: nothing was recorded. In every other case leave things as they are:
  // a message about the microphone stays, and a recording stopped by the time limit is still sent.
  else if(recordingPending)interrupt();
};
mic.onclick=event=>{if(!event.detail)toggleRecording();}; // Keyboard. Pointers are handled above.
mic.oncontextmenu=event=>event.preventDefault(); // A long touch must not open a menu.
$('#core').onclick=()=>{if(mode==='visit')toggleRecording();};

function setLanguage(value){
  lang=value;interrupt();
  document.documentElement.lang=value;
  for(const b of $('#lang').children)b.setAttribute('aria-pressed',b.dataset.lang===value);
  $('#lang').setAttribute('aria-label',t('language'));
  for(const node of document.querySelectorAll('[data-t]'))node.textContent=t(node.dataset.t);
  $('#core').setAttribute('aria-label',t('hold'));
  $('#question').placeholder=t('input');$('#question').setAttribute('aria-label',t('input'));$('#question').value='';
  $('#grid').replaceChildren();show(active);
  revealTopics();
  for(const product of products){
    const p=local(product), card=el('button','card'), top=el('span','cat');
    top.append(icon(areaIcons[product.area]||'menu_book'),el('span','',p.area),icon('arrow_forward','arrow'));
    // Goal of the app: first sentence of its catalog summary.
    card.append(top,el('b','',p.name),el('span','goal',p.facts.split(/(?<=[.!?])\s/)[0]),el('span','q',p.prompt));
    card.setAttribute('aria-pressed','false');card.onclick=()=>choose(p,card);
    $('#grid').append(card);
  }
  if(mode==='settings')showContext(); // settings.js: the panel follows the language.
}
$('#lang').onclick=e=>{const code=e.target.closest('[data-lang]')?.dataset.lang;if(code && code!==lang){closeLive();setLanguage(code);}};

// ---------- Attract screen and unattended kiosk ----------
// The attract screen asks about the products that catalog.json marks with "attract": true:
// the question of the product and its suggested questions, each in every language.
// When no marked product is in the kiosk, it asks about every product.
const teaserLanguages=['en','fr','de','it'];
const hooks=p=>[p.prompt,...p.questions||[]];
// chosen: the language picked with a button on the attract screen. Until then the question walks through all four.
let teased=null, teaserStep=0, teaserTimer, chosen=null;
function teaser(){
  if(!products.length)return;
  const marked=products.filter(p=>p.attract);
  const lines=(marked.length ? marked : products).flatMap(product=>hooks(product).map((_,line)=>({product,line})));
  // Each full round shifts the languages by one, so every question appears in every language whatever their number.
  const step=teaserStep++, index=step%lines.length, {product,line}=lines[index];
  const code=chosen||teaserLanguages[(index+Math.floor(step/lines.length))%teaserLanguages.length];
  const p={...product,...product.locales?.[code]}, own=hooks(p);
  teased={id:product.id,lang:code};
  const box=$('#teaser');
  box.lang=code;
  // ponytail: the round counts the English questions. A language with fewer repeats its own, one with more never shows the extra ones.
  $('#teaser-question').textContent=own[line%own.length];
  $('#teaser-icon').textContent=areaIcons[product.area]||'menu_book';
  $('#teaser-name').textContent=p.name;
  $('#begin-label').textContent=messages[code].start;$('#begin').lang=code;
  // A button lights up only when the visitor picked it: the rotating question picks nothing.
  for(const b of $('#lang').children)b.setAttribute('aria-pressed',b.dataset.lang===chosen);
  box.classList.remove('arrive');void box.offsetWidth;box.classList.add('arrive'); // Restart the entrance.
}
let clipFailures=0;
function playClip(index){
  const loop=$('#loop'), clips=config.clips;
  loop.hidden=!clips.length||clipFailures>=clips.length; // When no file plays, the question stands alone.
  if(loop.hidden||mode!=='attract')return;
  index%=clips.length;
  loop.src=clips[index];
  loop.onplaying=()=>{clipFailures=0;};
  loop.onended=()=>playClip(index+1);
  loop.onerror=()=>{clipFailures++;playClip(index+1);}; // Skip a file that does not play.
  loop.play().catch(()=>{});
}
function setMode(next){
  mode=next;document.body.dataset.mode=next;
  clearInterval(teaserTimer);
  if(next==='attract'){teaser();teaserTimer=setInterval(teaser,5000);playClip(0);}
  else{
    $('#loop').pause();
    for(const b of $('#lang').children)b.setAttribute('aria-pressed',b.dataset.lang===lang); // The teaser lit its own language.
  }
  touch();
}
let lastHello='';
function startVisit(code,id){
  settledAt=performance.now();
  api.greeted();
  setMode('visit');
  setLanguage(code);
  if(!reducedMotion.matches)$('.portrait').animate([
    {transform:'scale(1)'},{transform:'scale(1.05)',offset:.45},{transform:'scale(1)'}
  ],{duration:500,easing:'ease-out'});
  const welcome=done=>{
    // Never the same welcome twice in a row.
    const others=t('hello').filter(text=>text!==lastHello), hello=lastHello=others[Math.floor(Math.random()*others.length)], token=seq;
    let finished=false;
    const finish=()=>{
      if(finished || seq!==token)return;
      finished=true;done?.();
    };
    say('wilco',hello);
    speak(hello,lang,token,finish,true).catch(finish);
  };
  const product=products.find(p=>p.id===id);
  if(product)choose(local(product),undefined,welcome);
  else welcome();
}
function endVisit(){
  settledAt=performance.now();
  api.reset();busy=false;liveOpen=false;active=null;introduced.clear();$('#transcript').replaceChildren();
  if($('#pin').open)$('#pin').close();
  mode='visit'; // Leave Settings before the language changes, so the locked panel is not drawn again.
  chosen=null; // The next visitor starts from the attract screen with all four languages.
  setSide(false);
  setLanguage('en');
  setMode(config.idleSeconds?'attract':'visit');
}
$('#reset').onclick=endVisit;
// The visitor can fold the sidebar to a narrow strip and open it again. A new visit opens it.
function setSide(small){
  if(small)document.body.dataset.side='small';else delete document.body.dataset.side;
  $('#side-toggle').setAttribute('aria-expanded',!small);
  $('#side-toggle').setAttribute('aria-label',small ? 'Show Wilco' : 'Make Wilco small');
  api.side(small); // The live demo takes the room.
}
$('#side-toggle').onclick=()=>setSide(!document.body.dataset.side);
// On the attract screen every touch starts a visit: a language button in that language, the question with its product.
// The release of the finger starts it, because a long touch sends no click.
function wake(event){
  const target=event.target.closest ? event.target : document.body;
  const picked=target.closest('#teaser') && teased;
  // The visit starts in the language picked on this screen, else in the language of the question on show (question or start button), else in English.
  // A language button only changes the language of the attract screen: nothing starts.
  const button=target.closest('[data-lang]')?.dataset.lang;
  if(button){chosen=button;clearInterval(teaserTimer);teaser();teaserTimer=setInterval(teaser,5000);return;}
  startVisit(chosen||(target.closest('#teaser, #begin') && teased?.lang)||'en',picked?.id);
}
// The Settings button belongs to the stand team: a touch on it never starts a visit.
const staffTouch=event=>!!event.target.closest?.('#settings-open');
for(const type of ['pointerup','pointercancel'])addEventListener(type,event=>{
  if(mode==='attract' && !$('#pin').open && !settling() && !staffTouch(event))wake(event);
},true);
addEventListener('click',event=>{
  if($('#pin').open || staffTouch(event) || (mode!=='attract' && !settling()))return;
  event.stopPropagation();event.preventDefault(); // The release already acted.
  if(mode==='attract' && !settling() && !event.detail)wake(event); // Keyboard.
},true);

// Wilco speaking, a demo clip playing or the stand team preparing answers is not an empty kiosk.
const quiet=()=>state==='standby' && film.paused && !busy;
function touch(){
  clearTimeout(idleTimer);clearTimeout(warnTimer);
  const settings=mode==='settings', notes=[$('#status'),$('#settings-message')];
  for(const note of notes)if(note.textContent===t('idle'))note.textContent='';
  // The stand team reads long texts in Settings: it gets five times longer. Settings lock by themselves
  // even when the visitor reset is switched off.
  const total=(settings ? (config.idleSeconds||60)*5 : config.idleSeconds)*1000;
  if(!total||mode==='attract')return;
  warnTimer=setTimeout(()=>{if(quiet())notes[settings ? 1 : 0].textContent=t('idle');},total-Math.min(10000,total/2));
  // Not quiet: wait once more. After ten idle times without a touch the visit ends whatever is still running.
  idleTimer=setTimeout(()=>quiet()||Date.now()-lastInput>total*10 ? endVisit() : touch(),total);
}
const touched=()=>{lastInput=Date.now();touch();};
for(const type of ['pointerdown','keydown','wheel'])addEventListener(type,touched,{capture:true,passive:true});
api.onActivity(touched); // Touches inside the live demo.

// Stand team: the Settings button asks for the PIN (settings.js).
$('#settings-open').onclick=()=>askPin();

Promise.all([api.catalog(),api.config()]).then(([rows,settings])=>{
  products=rows;config=settings;
  setLanguage(lang);
  setMode(config.idleSeconds?'attract':'visit');
  Presence.start(); // Webcam presence (presence.js): without a camera the kiosk works by touch.
});
