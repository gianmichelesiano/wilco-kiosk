const fs = require('node:fs');
const path = require('node:path');

const stopWords = new Set('the and for can how what where does with from show find devo che come dove cosa posso sono per gli del della nel nella una dei delle dans des les une est pour puis est-ce die der das den dem und ich wie kann ist mit für'.split(' '));
function terms(text) {
  return (text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').match(/[\p{L}\p{N}]+/gu) || [])
    .filter(word => word.length > 2 && !stopWords.has(word));
}

// Texts changed by the stand team in Settings: key -> text. See items() for the keys.
let overrides = {};
const changed = key => typeof overrides[key] === 'string';
const ov = (key, original) => changed(key) ? overrides[key] : original;

const crewDir = path.join(__dirname, 'knowledge', 'crew');
const crewTopics = JSON.parse(fs.readFileSync(path.join(__dirname, 'knowledge', 'crew-topics.json'), 'utf8'));
const crewFiles = fs.readdirSync(crewDir).filter(name => name.endsWith('.md')).sort().map(name => ({
  name,
  body: fs.readFileSync(path.join(crewDir, name), 'utf8'),
  topics: crewTopics[name] || ''
}));
const chapterTitle = markdown => markdown.split('\n')[0].replace(/^#\s*/, '').trim();
function chapter(file) {
  const key = `crew/guide.${file.name}.`;
  const markdown = ov(key + 'body', file.body);
  const sections = markdown
    .replace(/^\[←.*$/gm, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .trim()
    .split(/(?=^#{2,4}\s)/m)
    .map(section => ({text: section.trim(), words: new Set(terms(section))}));
  return {title: chapterTitle(markdown), sections, keywords: new Set(terms(ov(key + 'topics', file.topics)))};
}
let chapters = [];

function crewContext(question, activeProduct, previousQuestion = '') {
  const words = [...new Set(terms(question))];
  const explicit = /crew[\s-]*overview|ngft[\s-]+crew/i.test(question);
  if (activeProduct !== 'crew' && !explicit) {
    const matches = chapters.some(chapter => words.filter(word => chapter.keywords.has(word)).length >= 2);
    if (!matches) return [];
  }
  const recent = new Set(terms(previousQuestion));
  const ranked = chapters.flatMap(chapter => chapter.sections.map(section => {
    const local = words.filter(word => section.words.has(word)).length;
    const topic = words.filter(word => chapter.keywords.has(word)).length;
    const followUp = [...recent].filter(word => section.words.has(word)).length;
    return {title: chapter.title, text: section.text, score: local * 3 + topic + Math.min(followUp, 4) * 0.25};
  }));
  return ranked.filter(section => section.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0, 5)
    .map(({title,text}) => ({chapter: title, excerpt: text.slice(0, 2100)}));
}

// One guide file: every "### <number> <title>" heading starts a section.
function readGuide(id) {
  const topics = require(`./knowledge/${id}-topics.json`);
  const markdown = fs.readFileSync(path.join(__dirname, 'knowledge', `${id}.md`), 'utf8');
  return markdown.split(/^### /m).slice(1).map(section => {
    const newline = section.indexOf('\n');
    const [number, ...heading] = section.slice(0, newline).split(' ');
    return {number, title: heading.join(' '), body: section.slice(newline + 1).trim(), topics: topics[number] || ''};
  });
}
function entry(id, section) {
  const key = `${id}/guide.${section.number}.`;
  const title = ov(key + 'title', section.title);
  const body = ov(key + 'body', section.body).trim();
  const verification = body.match(/^\*\*(?:Verification|Verifica)\.\*\* .+$/m)?.[0];
  const excerpt = verification ? body.replace(verification, '').trim() : body;
  return {
    number: section.number,
    title,
    excerpt,
    verification,
    topicWords: new Set(terms(title + ' ' + ov(key + 'topics', section.topics).replaceAll('-', ' '))),
    bodyWords: new Set(terms(excerpt))
  };
}

const crewName = /crew[\s-]*overview|ngft[\s-]+crew/i;
const demoQuery = /\b(demo|dimostrazion\w*|d[eé]monstration|vorf[uü]hrung)\b/i;
const guides = [
  {
    id: 'techlog',
    product: 'TechLog',
    name: /\b(?:e[\s-]*)?tech[\s-]*log\b/i,
    distinctive: /\b(?:hil|unserviceable)\b/i,
    ignored: new Set(['techlog', 'admin']),
    sections: readGuide('techlog'),
    preview: {
      number: '3.18',
      query: /\b(npca|preview|anteprima|staging|corregger\w*|correzion\w*|korrigier\w*|correct\w*|r[uü]ckwirkend|backdat\w*)\b/i
    }
  },
  {
    id: 'sms',
    product: 'NGFT Safety (SMS)',
    name: /\b(?:sms|ngft safety|safety management system)\b/i,
    distinctive: /\b(?:risk register|registro dei rischi|registre des risques|risikoregister|safety cockpit|rca\s*(?:&|and|e|et|und)\s*cap|bow[\s-]*tie)\b/i,
    ignored: new Set(['sms']),
    sections: readGuide('sms')
  },
  {
    id: 'audit',
    product: 'NGFT Audit',
    name: /\b(?:ngft audit|audit tool|audit planning|audit cockpit|audit templates|in audit|su audit|im audit)\b/i,
    distinctive: /\b(?:audit[s]?|finding[s]?)\b/i,
    ignored: new Set(['ngft']),
    sections: readGuide('audit')
  },
  {
    id: 'ops',
    product: 'OPS Dispatch',
    name: /\bops\b/i,
    distinctive: /\b(?:unassigned jobs|daily plan pdf|weekly planner|management cockpit)\b/i,
    ignored: new Set(['ops', 'ngft', 'dispatch']),
    sections: readGuide('ops'),
    preview: {
      number: 'T15',
      query: /\b(?:agent|assistant|assistente|intelligenza artificiale|ai|ki)\b/i
    }
  },
  {
    id: 'docgen',
    product: 'NGFT DocGen',
    name: /\bdoc[\s-]*gen\b/i,
    distinctive: /\b(?:difference document|start next revision|hand over to compliance review|confirm inherited law tags)\b/i,
    ignored: new Set(['docgen', 'ngft']),
    sections: readGuide('docgen'),
    preview: {
      number: '3.26',
      query: /\b(?:ai|assistant|assistente|intelligenza artificiale|intelligence artificielle|ki|vorschau)\b/i
    }
  },
  {
    id: 'frat',
    product: 'NGFT FRAT',
    name: /\bfrat\b|\bflight risk assessment\b/i,
    distinctive: /\b(?:go[\s/-]*no[\s-]*go|mitigation (?:pdf|report)|permission to fly)\b/i,
    ignored: new Set(['frat', 'ngft']),
    sections: readGuide('frat')
  }
];

function guideContext(guide, question, previousQuestion, count) {
  const query = [...new Set(terms(question))].filter(word => !guide.ignored.has(word));
  const recent = new Set(terms(previousQuestion));
  const ranked = guide.entries
    .filter(entry => entry.number !== guide.preview?.number || guide.preview.query.test(question))
    .filter(entry => !entry.number.startsWith('5.') || demoQuery.test(question))
    .map(entry => {
      const topicMatches = query.filter(word => entry.topicWords.has(word)).length;
      const bodyMatches = query.filter(word => entry.bodyWords.has(word)).length;
      const followUpMatches = [...recent].filter(word => entry.topicWords.has(word)).length;
      const demoBoost = entry.number.startsWith('5.') ? 2 : 0;
      return {entry, score: topicMatches * 4 + bodyMatches + Math.min(followUpMatches, 3) * 0.5 + demoBoost};
    });
  return ranked.filter(match => match.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0, count)
    .map(({entry}) => ({
      product: guide.product,
      chapter: `${entry.number} ${entry.title}`,
      excerpt: [limitExcerpt(entry.excerpt), entry.verification].filter(Boolean).join('\n\n')
    }));
}

function limitExcerpt(excerpt) {
  const limit = 3400;
  if (excerpt.length <= limit) return excerpt;
  const end = excerpt.lastIndexOf('\n\n', limit);
  return excerpt.slice(0, end > 0 ? end : limit);
}

function productContext(question, activeProduct, previousQuestion = '') {
  const explicitCrew = crewName.test(question);
  const explicitGuides = guides.filter(guide => guide.name.test(question));
  const explicitlyNamed = explicitCrew || explicitGuides.length > 0;
  const activeGuide = guides.find(guide => guide.id === activeProduct);
  const matchingGuides = explicitlyNamed ? explicitGuides
    : activeGuide ? [activeGuide]
    : activeProduct === 'crew' ? []
    : guides.filter(guide => guide.distinctive.test(question));
  const useCrew = explicitCrew || (!explicitlyNamed && !activeGuide && !matchingGuides.length);
  const crew = useCrew ? crewContext(question, activeProduct, previousQuestion) : [];
  const limit = matchingGuides.length > 1 || crew.length ? 2 : 3;
  return [
    ...crew.slice(0, matchingGuides.length ? 2 : 5).map(excerpt => ({product: 'CrewOverview', ...excerpt})),
    ...matchingGuides.flatMap(guide => guideContext(guide, question, previousQuestion, limit))
  ];
}

// Apply the stand team's texts. Call again after every change.
function load(next = {}) {
  overrides = next;
  for (const guide of guides) guide.entries = guide.sections.map(section => entry(guide.id, section));
  chapters = crewFiles.map(chapter);
}
load();

const lines = text => text.split('\n').map(line => line.trim()).filter(Boolean);
const paragraphs = text => text.split(/\n\s*\n/).map(note => note.trim()).filter(Boolean);
const localized = (product, lang) => (lang === 'en' ? product : product.locales?.[lang]) || {};
function card(product, lang) {
  const base = localized(product, lang), key = field => `${product.id}/${field}.${lang}`;
  return {
    prompt: ov(key('prompt'), base.prompt),
    facts: ov(key('facts'), base.facts),
    questions: changed(key('questions')) ? lines(overrides[key('questions')]) : base.questions
  };
}
// In the kiosk unless the catalog hides it ("hidden": true). The stand team's choice in Settings wins.
const shown = product => changed(`${product.id}/@shown`) ? overrides[`${product.id}/@shown`] === 'yes' : !product.hidden;
// Every product with the texts of the stand team. `shown` tells which ones the kiosk and the model get.
// The catalog itself stays untouched.
function products(catalog) {
  return catalog.map(product => {
    const notes = `${product.id}/notes`;
    return {
      ...product,
      shown: shown(product),
      // "clips": one per suggested question, in the same order. A missing file counts as no clip.
      ...(product.clips ? {clips: product.clips.map(clip => clip && fs.existsSync(path.join(__dirname, clip)) ? clip : null)} : {}),
      // "intro": the app's feature tour, played muted when its card opens. A missing file counts as none.
      ...(product.intro ? {intro: fs.existsSync(path.join(__dirname, product.intro)) ? product.intro : null} : {}),
      ...card(product, 'en'),
      locales: Object.fromEntries(Object.entries(product.locales || {}).map(([lang, values]) => [lang, {...values, ...card(product, lang)}])),
      ...(changed(notes) ? {help: [{source: 'Stand team', notes: paragraphs(overrides[notes])}]} : {})
    };
  });
}

// Everything Wilco knows about one product, as editable texts for Settings.
function items(catalog, id, lang) {
  const product = catalog.find(candidate => candidate.id === id);
  if (!product) return [];
  const base = localized(product, lang);
  const item = (key, group, label, original, rows, section) =>
    ({key, group, section, label, rows, original, text: ov(key, original), modified: changed(key)});
  const list = [
    item(`${id}/prompt.${lang}`, 'Card', 'Question on the card', base.prompt || '', 1),
    item(`${id}/facts.${lang}`, 'Card', 'Summary', base.facts || '', 3),
    item(`${id}/questions.${lang}`, 'Card', 'Suggested questions, one per line', (base.questions || []).join('\n'), 4),
    item(`${id}/notes`, 'Notes', 'Sent to Wilco with every question. Separate notes with an empty line.', (product.help || []).flatMap(help => help.notes).join('\n\n'), 6)
  ];
  for (const section of guides.find(guide => guide.id === id)?.sections || []) {
    const key = `${id}/guide.${section.number}.`, name = `${section.number} ${ov(key + 'title', section.title)}`;
    list.push(
      item(key + 'title', 'Guide', 'Title', section.title, 1, name),
      item(key + 'body', 'Guide', 'Text', section.body, 12, name),
      item(key + 'topics', 'Guide', 'Search keywords, any language', section.topics, 2, name)
    );
  }
  if (id === 'crew') for (const file of crewFiles) {
    const key = `crew/guide.${file.name}.`, name = chapterTitle(ov(key + 'body', file.body));
    list.push(
      item(key + 'body', 'Guide', 'Text', file.body, 12, name),
      item(key + 'topics', 'Guide', 'Search keywords, any language', file.topics, 2, name)
    );
  }
  return list;
}

module.exports = {crewContext, productContext, load, products, items};
