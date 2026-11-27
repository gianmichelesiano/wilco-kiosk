// Stand-ins for OpenAI and ElevenLabs, loaded into the kiosk by test/e2e.mjs.
// They count calls, so a test can prove that an answer needed no network.
// down: no provider answers. speechDown: only ElevenLabs refuses. delay: milliseconds before every answer.
// reply: the answer text the model gives, to try the faults a real model shows now and then.
// badOnce: the next model answer is cut off. asked: requests to the model, answered or not.
// The tests run the real kiosk on a computer that someone may be using. Here its window never comes on
// screen: the page is drawn off screen, so nothing opens, nothing takes the keyboard and, on a Mac, no icon
// appears in the Dock. The person's typing and clicks stay theirs and cannot disturb a test.
const Module = require('node:module');
const load = Module._load;
Module._load = function (request, ...rest) {
  const loaded = load.call(this, request, ...rest);
  if (request !== 'electron' || !loaded.BrowserWindow) return loaded;
  loaded.app.dock?.hide();
  class UnseenWindow extends loaded.BrowserWindow {
    constructor(options) {
      super({...options, show: false, webPreferences: {...options.webPreferences, offscreen: true}});
    }
  }
  return new Proxy(loaded, {get: (target, key) => key === 'BrowserWindow' ? UnseenWindow : target[key]});
};

const calls = globalThis.wilcoMock = {chat: 0, speech: 0, transcription: 0, down: false, speechDown: false, delay: 0, reply: '', badOnce: false, asked: 0};
const opening = {en: 'Would you like', fr: 'Voulez-vous', de: 'Möchten Sie', it: 'Vuoi che'};
// One silent MPEG-1 Layer III frame (128 kbit/s, 44.1 kHz), repeated for about one second.
const frame = Buffer.concat([Buffer.from([0xFF, 0xFB, 0x90, 0x64]), Buffer.alloc(413)]);
const silence = Buffer.concat(Array(40).fill(frame));
const json = body => new Response(JSON.stringify(body), {headers: {'Content-Type': 'application/json'}});

globalThis.fetch = async (url, options = {}) => {
  url = String(url);
  if (url.includes('/chat/completions')) calls.asked++;
  if (calls.down) throw new TypeError('fetch failed');
  if (calls.delay) await new Promise(resolve => setTimeout(resolve, calls.delay));
  if (url.includes('/chat/completions')) {
    calls.chat++;
    if (calls.badOnce) { calls.badOnce = false; return json({choices: [{message: {content: '{"text": "An answer cut off in the mid'}}]}); }
    const {messages} = JSON.parse(options.body);
    const {activeProduct, question} = JSON.parse(messages.at(-1).content);
    const lang = /For ambiguous input use (\w\w)/.exec(messages[0].content)[1];
    const chapters = [...messages[0].content.matchAll(/"chapter":"([^"]+)"/g)].map(match => match[1]);
    calls.lastChapters = chapters;
    calls.lastProducts = [...messages[0].content.matchAll(/\{"id":"([a-z]+)"/g)].map(match => match[1]); // The catalog the model received.
    return json({choices: [{message: {content: JSON.stringify({
      text: calls.reply || `Mock answer ${calls.chat} to: ${question}`,
      id: activeProduct,
      language: lang,
      followUp: `${opening[lang]} more?`
    })}}]});
  }
  if (url.includes('/v2/voices')) {
    if (calls.speechDown) return new Response('quota exceeded', {status: 401});
    return json({has_more: false, voices: [
      {voice_id: 'voiceA', name: 'Aria', labels: {gender: 'female', accent: 'american'}, verified_languages: [{language: 'en'}]},
      {voice_id: 'voiceB', name: 'Bruno', labels: {gender: 'male'}, verified_languages: [{language: 'fr'}, {language: 'it'}]}
    ]});
  }
  if (url.includes('/text-to-speech/')) {
    if (calls.speechDown) return new Response('quota exceeded', {status: 401});
    calls.speech++;
    calls.lastVoice = decodeURIComponent(url.split('/text-to-speech/')[1]); // The voice the kiosk asked for.
    return new Response(silence, {headers: {'Content-Type': 'audio/mpeg'}});
  }
  if (url.includes('/audio/transcriptions')) {
    calls.transcription++;
    return json({text: 'How do I notify the crew?'});
  }
  throw new TypeError('Unexpected request in a test: ' + url);
};
