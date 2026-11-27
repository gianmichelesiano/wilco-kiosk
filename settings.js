// Stand team panel: what Wilco knows about each product, as texts to read, test and change.
// It opens with the Settings button and the PIN in WILCO_SETTINGS_PIN. Labels are in English.
// It uses $, el, api, plain, products, lang, mode, busy, seq, interrupt, speak, closeLive, setMode and endVisit from ui.js.
// apps: every product of the catalog, in the kiosk or not. `products` of ui.js holds the ones in the kiosk.
let selected=null, typed='', apps=[];
const contexts={};
const pinDialog=$('#pin');
const pinMessages={
  wrong:'Wrong PIN.',
  wait:'Too many attempts. Try again in a minute.',
  unset:'Settings are off. Set WILCO_SETTINGS_PIN in .env and restart Wilco.'
};
// The text of a refusal from the main process, without the wrapping that Electron adds.
const reasonOf=error=>String(error.message||error).replace(/^Error invoking remote method '\w+': (?:Error: )?/,'');

for(const key of ['1','2','3','4','5','6','7','8','9','back','0','ok']){
  const button=el('button','',{back:'Del',ok:'OK'}[key]||key);
  button.type='button';button.dataset.key=key;
  $('#keys').append(button);
}
async function pressKey(key){
  if(key!=='ok'){
    typed=key==='back' ? typed.slice(0,-1) : (typed+key).slice(0,12);
    $('#pin-message').textContent='';
  }else{
    const result=await api.unlock(typed);
    typed='';
    if(result==='ok'){pinDialog.close();openSettings();}
    else $('#pin-message').textContent=pinMessages[result];
  }
  $('#pin-dots').textContent='•'.repeat(typed.length);
}
$('#keys').onclick=event=>{const key=event.target.closest('[data-key]')?.dataset.key;if(key)pressKey(key);};
pinDialog.onkeydown=event=>{
  const key=/^\d$/.test(event.key) ? event.key : {Enter:'ok',Backspace:'back'}[event.key];
  if(key){event.preventDefault();pressKey(key);}
};
let pinTimer;
function askPin(){
  if(pinDialog.open||mode==='settings')return;
  typed='';$('#pin-dots').textContent='';
  // Without a PIN in .env there is nothing to open: the keypad says how to switch Settings on.
  $('#pin-message').textContent=config.settings ? '' : pinMessages.unset;
  pinDialog.showModal();
  keepPinOpen();
}
// A keypad left alone closes after half a minute and forgets the digits.
function keepPinOpen(){
  clearTimeout(pinTimer);
  pinTimer=setTimeout(()=>{typed='';if(pinDialog.open)pinDialog.close();},30000);
}
pinDialog.addEventListener('pointerdown',keepPinOpen);
pinDialog.addEventListener('keydown',keepPinOpen);

// The questions the kiosk itself asks for a product: its introduction, then the suggested questions.
function questionsOf(product,code){
  const p={...product,...product.locales?.[code]};
  return [messages[code].overview.replace('{name}',p.name),...(p.questions||[])];
}
async function loadContext(id,code=lang){
  const product=apps.find(p=>p.id===id);
  return contexts[id]=await api.context(id,code,questionsOf(product,code));
}
async function openSettings(){
  interrupt();await closeLive();
  setMode('settings');
  $('#probe-result').replaceChildren();
  $('#settings-message').textContent=config.unreadable?.length ? config.unreadable.join(' and ')+' could not be read when Wilco started and was set aside beside the keys. Wilco runs without it; the next save starts a new file.' : '';
  showVersion().catch(()=>{}); // git asks GitHub: the panel does not wait for it.
  showVoices().catch(()=>{}); // The list comes from ElevenLabs: the panel does not wait for it. Closed meanwhile: nothing to show.
  showCamera();
  await showContext();
}
// Webcam presence: the stand team switches it, sets the distance with the live preview, allows the spoken hello.
// The preview shows the live camera and the size of the biggest face; it records nothing.
const cameraStates={off:'Camera off.',starting:'Starting the camera…',working:'Camera working.',
  'no-camera':'No camera available: not connected, used by another app, or blocked in Windows Settings > Privacy & security > Camera. Wilco tries again every 10 seconds and works by touch meanwhile.',
  'no-permission':'No permission for the camera: Windows Settings > Privacy & security > Camera > Let desktop apps access your camera, then restart Wilco.',
  unavailable:'Face detection unavailable on this computer: Wilco works by touch.'};
let cameraWatch;
function showCamera(){
  $('#camera-on').checked=config.camera.on;
  $('#camera-near').value=config.camera.near;
  $('#camera-greet').checked=config.camera.welcomeAloud;
  showWelcomes();
  $('#camera-status').textContent='';
  clearInterval(cameraWatch);
  const preview=$('#camera-preview');
  const watch=()=>{
    if(mode!=='settings'){clearInterval(cameraWatch);preview.srcObject=null;return;} // Closed: the preview lets go of the camera.
    if(preview.srcObject!==Presence.stream)preview.srcObject=Presence.stream;
    const face=Presence.last, needed=Number($('#camera-near').value).toFixed(2);
    $('#camera-reading').textContent=face ? 'Biggest face: '+face.width.toFixed(2)+' of the frame, needed '+needed+'. In front: '+(Presence.state.near ? 'yes' : 'not yet')+'.' : 'No face in view. Needed: '+needed+'.';
    $('#camera-state').textContent=cameraStates[Presence.status]||'';
  };
  watch();cameraWatch=setInterval(watch,250);
}
const welcomeInputs=[...document.querySelectorAll('#camera-welcomes input')];
const showWelcomes=()=>welcomeInputs.forEach((input,i)=>{input.value=config.camera.welcomes[i];});
async function saveCamera(){
  const next={on:$('#camera-on').checked,near:Number($('#camera-near').value),welcomeAloud:$('#camera-greet').checked,welcomes:welcomeInputs.map(input=>input.value)};
  try{
    config.camera=await api.camera(next);
    Presence.threshold=config.camera.near;
    if(config.camera.on)Presence.start();else Presence.stop();
    showWelcomes(); // An emptied welcome shows its first text again.
    $('#camera-status').textContent='Saved: camera '+(config.camera.on ? 'on' : 'off')+', distance '+config.camera.near.toFixed(2)+', welcome aloud '+(config.camera.welcomeAloud ? 'on' : 'off')+', four welcomes.';
  }catch(error){$('#camera-status').textContent='Not saved. '+reasonOf(error);}
}
for(const input of [$('#camera-on'),$('#camera-near'),$('#camera-greet'),...welcomeInputs])input.onchange=saveCamera;
async function showVersion(){
  const version=await api.version(), out=$('#version');
  out.textContent=!version ? '' : 'Version of '+version.date+(version.behind ? '. A new version is on GitHub: tap «Update Wilco».' : version.behind===0 ? '. Up to date.' : '.');
  out.classList.toggle('new',!!version?.behind);
}
// ElevenLabs voices: one voice for each language and a test of each language.
const languageNames={en:'English',fr:'French',de:'German',it:'Italian'};
async function showVoices(){
  const status=$('#voice-status');
  const {list,chosen,reason}=await api.voices();
  if(mode!=='settings')return;
  const option=(value,text)=>{const item=el('option','',text);item.value=value;return item;};
  const group=(label,voices)=>{
    const items=document.createElement('optgroup');
    items.label=label;
    items.append(...voices.map(voice=>option(voice.id,voice.name+(voice.detail ? ', '+voice.detail : ''))));
    return items;
  };
  $('#voice-rows').replaceChildren(...Object.entries(languageNames).map(([code,name])=>{
    const row=el('div','voice-row'), label=el('label','',name), select=el('select',''), test=el('button','','Test');
    row.dataset.lang=code;select.id='voice-'+code;label.htmlFor=select.id;test.type='button';
    // ElevenLabs marks the languages it has verified for a voice: those voices come first.
    const verified=list.filter(voice=>voice.languages.includes(code)), others=list.filter(voice=>!voice.languages.includes(code));
    select.append(option('','Standard voice (.env)'));
    if(verified.length)select.append(group('Verified for '+name,verified));
    if(others.length)select.append(group(verified.length ? 'Other voices' : 'Voices of the account',others));
    // A voice chosen earlier stays selectable when the account no longer lists it.
    if(chosen[code] && !list.some(voice=>voice.id===chosen[code]))select.append(option(chosen[code],'Voice '+chosen[code]+', not in the account list'));
    select.value=chosen[code];
    select.onchange=async()=>{
      try{
        await api.voice(code,select.value);
        status.textContent=name+': voice saved. Prepared answers in '+name+' get it the first time they play, or all at once with «Write what is missing, all products».';
      }catch(error){status.textContent=name+': not saved. '+reasonOf(error);}
    };
    test.onclick=async()=>{
      interrupt();
      status.textContent=name+': asking for the voice…';
      const audio=await speak(voiceTest[code],code,seq);
      status.textContent=name+': '+(audio?.source==='ElevenLabs' ? 'ElevenLabs voice.' : 'ElevenLabs gave no voice ('+(audio?.reason||'no answer')+'). You hear the voice of this computer.');
    };
    row.append(label,select,test);
    return row;
  }));
  status.textContent=list.length ? '' : 'ElevenLabs did not list the voices of the account ('+reason+'). The voices chosen before stay in use.';
}
// Load every product again and draw the selected one. Called after each change and when the language changes.
async function showContext(){
  apps=await api.apps();
  selected??=apps[0].id;
  await Promise.all(apps.map(product=>loadContext(product.id)));
  if(mode!=='settings')return;
  $('#apps').replaceChildren(...apps.map(product=>{
    const items=contexts[product.id].items;
    const sections=new Set(items.filter(item=>item.group==='Guide').map(item=>item.section)).size;
    const answers=items.filter(item=>item.key.startsWith('answer:'));
    const button=el('button','app');
    button.type='button';button.dataset.id=product.id;button.setAttribute('aria-pressed',product.id===selected);
    button.append(
      el('b','',product.name),
      el('span','',sections ? sections+' sections in the guide' : 'Notes only, no guide'),
      el('span','',answers.filter(item=>item.text).length+' of '+answers.length+' answers prepared')
    );
    if(items.some(item=>item.modified))button.append(el('span','edited','Changed by the stand team'));
    button.onclick=()=>{selected=product.id;$('#probe-result').replaceChildren();showContext();};
    // Which products visitors get. The choice is saved at once and the kiosk follows when Settings close.
    const row=el('div','app-row'), toggle=el('label','show'), box=document.createElement('input');
    box.type='checkbox';box.checked=product.shown;box.dataset.show=product.id;
    toggle.append(box,'In the kiosk');
    box.onchange=async()=>{
      $('#settings-message').textContent='';
      try{await api.show(product.id,box.checked);}
      catch(error){$('#settings-message').textContent=reasonOf(error);}
      products=await api.catalog();
      await showContext();
    };
    row.append(button,toggle);
    return row;
  }));
  const {items,last}=contexts[selected];
  const lastProduct=apps.find(product=>product.id===last?.id)?.name||'no product open';
  $('#last').textContent=!last ? 'No visitor question yet.' : 'Last visitor question ('+lastProduct+'): “'+last.question+'”. Wilco used '+(last.prepared ? 'a prepared answer' : last.chapters.length ? 'guide sections '+last.chapters.map(chapter=>chapter.split(' ')[0]).join(', ') : 'no guide section')+'.';
  $('#shown-language').textContent='Card and prepared answers are shown in '+languageNames[lang]+'. The language buttons at the top left switch to another language. Notes and guide have one text for all languages.';
  const box=$('#context'), scroller=$('#workbench'), top=scroller.scrollTop;
  const open=new Set([...box.querySelectorAll('details[open]')].map(details=>details.dataset.name));
  const groups=['Card','Notes','Guide','Prepared answers'].map(name=>{
    const list=items.filter(item=>item.group===name);
    if(!list.length)return null;
    const group=fold(name,name+(name==='Guide' ? ', '+new Set(list.map(item=>item.section)).size+' sections' : ''),list,open);
    const parts=new Map();
    for(const item of list){
      // A stable name per section, so it stays open when its title changes.
      const id=item.section ? item.key.replace(/\.(?:title|body|topics)$/,'').replace(/^followUp:/,'answer:') : '';
      if(!parts.has(id))parts.set(id,[]);
      parts.get(id).push(item);
    }
    for(const [id,members] of parts){
      const target=id ? fold(id,members[0].section,members,open) : group;
      target.append(...members.map(field));
      if(id)group.append(target);
    }
    return group;
  }).filter(Boolean);
  box.replaceChildren(...groups);
  scroller.scrollTop=top;
}
function fold(name,title,members,open){
  const details=el('details','');
  details.dataset.name=name;details.open=open.has(name);
  const summary=el('summary','',title);
  if(members.some(item=>item.modified))summary.append(el('span','edited','changed'));
  if(members.some(item=>item.stale))summary.append(el('span','stale','older than the product text'));
  if(members.some(item=>item.key in drafts))summary.append(el('span','stale','not saved'));
  details.append(summary);
  return details;
}
// Text typed but not saved yet, by key. It survives a redraw, a change of product or language and the idle lock,
// so no work is lost without a word. A saved or restored text leaves the list.
const drafts={};
// A second tap within four seconds confirms an action that replaces the stand team's work.
function confirmTap(button,question,action){
  const label=button.textContent;
  let armed;
  button.onclick=()=>{
    clearTimeout(armed);
    if(armed){armed=null;button.textContent=label;action();return;}
    button.textContent=question;
    armed=setTimeout(()=>{armed=null;button.textContent=label;},4000);
  };
}
function field(item){
  const wrap=el('div','field'), label=el('label','',item.label), area=el('textarea',''), note=el('small','note');
  wrap.dataset.key=item.key;
  area.rows=item.rows;area.value=drafts[item.key]??item.text;area.spellcheck=false;
  const save=el('button','save','Save');
  save.type='button';save.disabled=area.value===item.text;
  area.oninput=()=>{
    if(area.value===item.text)delete drafts[item.key];else drafts[item.key]=area.value;
    save.disabled=area.value===item.text;
  };
  save.onclick=()=>store(item.key,area.value,note);
  label.append(area);
  const row=el('div','row');
  row.append(save);
  if(item.modified){
    const restore=el('button','restore','Restore original');
    restore.type='button';
    confirmTap(restore,'Tap again to discard the change',()=>store(item.key,null,note));
    row.append(restore);
  }
  wrap.append(label,row,note);
  return wrap;
}
async function store(key,text,note){
  note.textContent='';$('#settings-message').textContent='';
  let voiced;
  try{voiced=await api.save(key,text);}
  catch(error){
    // Nothing was changed. Say it beside the field, where the editor is looking.
    note.textContent='Not saved. '+reasonOf(error);
    return;
  }
  delete drafts[key];
  try{
    // A prepared answer changed: give the new text its voice now, so visitors do not wait for it.
    if(voiced && (await api.speak(plain(voiced.text),voiced.language,true)).source!=='ElevenLabs')
      $('#settings-message').textContent='Saved, but ElevenLabs gave no voice. Press «Write what is missing» when the connection is back.';
    products=await api.catalog();
  }finally{await showContext();}
}

$('#probe').onsubmit=async event=>{
  event.preventDefault();
  const question=$('#probe-question').value.trim();
  if(!question)return;
  const found=await api.probe(question,selected);
  $('#probe-result').replaceChildren(...(found.length ? found.map(hit=>{
    const row=el('li','');
    row.append(el('b','',hit.chapter),el('span','',' '+plain(hit.excerpt).replace(/\s+/g,' ')+'…'));
    return row;
  }) : [el('li','none','No guide section matches. Wilco would answer from the card and the notes only.')]));
};

// Write prepared answers with the model and keep their voice. One at a time: slow, but within every provider limit.
// ponytail: sequential, about 7 s per answer. Run a few in parallel if a full rewrite before the show takes too long.
async function prepare(list,rewrite){
  if(busy)return;
  busy=true;
  const status=$('#prepare-status'), since=new Date().toISOString(), jobs=[];
  let written=0, failed=0, mute=0;
  // ElevenLabs can refuse without an error: the answer then plays with the system voice. Count it.
  const voice=async(text,code)=>{if((await api.speak(plain(text),code,true)).source!=='ElevenLabs')mute++;};
  try{
    status.textContent='Checking what is already prepared…';
    for(const product of list)for(const code of ['en','fr','de','it']){
      const {items}=await api.context(product.id,code,questionsOf(product,code));
      questionsOf(product,code).forEach((question,index)=>{
        const ready=items.find(item=>item.key.startsWith('answer:') && item.section===(index ? question : 'Introduction'));
        jobs.push({product,code,question,ready:!rewrite && ready?.text ? ready : null});
      });
    }
    for(const [index,job] of jobs.entries()){
      if(!busy||mode!=='settings')return; // The panel was closed.
      status.textContent=job.product.name+', '+job.code.toUpperCase()+': answer '+(index+1)+' of '+jobs.length;
      try{
        // An answer that exists keeps its text: only a voice that is missing is fetched.
        const answer=job.ready ? {text:job.ready.spoken,language:job.ready.language} : await api.bake(job.question,job.product.id,job.code,since);
        if(!answer)throw Error('No answer');
        await voice(answer.text,answer.language);
        if(!job.ready)written++;
      }catch{failed++;}
    }
    // The welcome and the summaries that Wilco reads when the connection is down get their voice too.
    if(!rewrite)for(const code of ['en','fr','de','it']){
      if(!busy||mode!=='settings')return;
      status.textContent='Voices for the welcome and the offline summaries, '+code.toUpperCase();
      for(const hello of messages[code].hello)await voice(hello,code);
      for(const product of list)await voice({...product,...product.locales?.[code]}.facts,code);
    }
    status.textContent='Done: '+written+' answers written'+(failed ? ', '+failed+' failed' : '')+(mute ? ', '+mute+' without voice' : '')+'.'
      +(failed||mute ? ' Check the connection, the keys and the ElevenLabs credit, then press «Write what is missing».' : '');
    await showContext();
  }finally{busy=false;touch();} // Whatever happened, the kiosk is no longer busy and the idle clock starts.
}
confirmTap($('#prepare-product'),'Tap again to rewrite all its answers',()=>prepare([apps.find(p=>p.id===selected)],true));
$('#prepare-missing').onclick=()=>prepare(products,false);
$('#settings-close').onclick=async()=>{products=await api.catalog();endVisit();};
confirmTap($('#settings-quit'),'Tap again to quit Wilco',()=>api.quit());
confirmTap($('#settings-update'),'Tap again to update Wilco',()=>api.update().catch(error=>{$('#settings-message').textContent=reasonOf(error);}));
