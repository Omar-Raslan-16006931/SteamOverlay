const { parentPort } = require('worker_threads');
const { createWorker } = require('tesseract.js');

let tess = null;
async function ensureTess() {
  if (tess) return tess;
  tess = await createWorker('eng', 1, { logger: () => {} });
  await tess.setParameters({
    tessedit_char_whitelist: '0123456789.,ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz $€£¥₴₽₩฿₺₹₪₫₱﷼%-+',
    preserve_interword_spaces: '1',
  });
  return tess;
}

const CODE_MAP = {
  SR:'SAR', UAH:'UAH', USD:'USD', EUR:'EUR', GBP:'GBP', TRY:'TRY',
  AED:'AED', ARS:'ARS', AUD:'AUD', BRL:'BRL', CAD:'CAD', CHF:'CHF',
  CLP:'CLP', CNY:'CNY', COP:'COP', CZK:'CZK', DKK:'DKK', EGP:'EGP',
  HUF:'HUF', IDR:'IDR', ILS:'ILS', INR:'INR', JPY:'JPY', KRW:'KRW',
  KZT:'KZT', MAD:'MAD', MXN:'MXN', MYR:'MYR', NGN:'NGN', NOK:'NOK',
  NZD:'NZD', PHP:'PHP', PKR:'PKR', PLN:'PLN', QAR:'QAR', RON:'RON',
  RUB:'RUB', SAR:'SAR', SEK:'SEK', SGD:'SGD', THB:'THB', TWD:'TWD',
  VND:'VND', ZAR:'ZAR'
};

const SYMBOL_MAP = {
  '$':'USD','€':'EUR','£':'GBP','¥':'JPY','₴':'UAH',
  '₽':'RUB','₩':'KRW','฿':'THB','₺':'TRY','₹':'INR',
  '₪':'ILS','₫':'VND','₱':'PHP','﷼':'SAR'
};

const SYMBOL_RE = /^[$€£¥₴₽₩฿₺₹₪₫₱﷼]/;

function parseNum(token) {
  const t = token.replace(/^[$€£¥₴₽₩฿₺₹₪₫₱﷼]/, '').replace(',', '');
  const v = parseFloat(t);
  if (isNaN(v) || v < 0.5 || v > 999999) return null;
  if (!t.includes('.') && t.length < 3) return null; // reject bare 1-2 digit ints
  return v;
}

function resolveCode(token) {
  return CODE_MAP[token.toUpperCase()] || null;
}

function sameLine(a, b) { return Math.abs(((a.bbox.y0+a.bbox.y1)/2) - ((b.bbox.y0+b.bbox.y1)/2)) < 14; }
function adjacent(a, b) { return Math.abs(a.bbox.x1 - b.bbox.x0) < 80; }

parentPort.on('message', async ({ imgData, imgW, imgH, logicalW, logicalH, fromCurrency }) => {
  try {
    const w = await ensureTess();
    const { data } = await w.recognize(imgData);
    const rx = logicalW / imgW;
    const ry = logicalH / imgH;

    // Flatten all words
    const words = [];
    for (const block of (data.blocks || []))
      for (const par of (block.paragraphs || []))
        for (const line of (par.lines || []))
          for (const word of (line.words || [])) {
            const text = (word.text||'').trim().replace(/[^0-9A-Za-z$€£¥₴₽₩฿₺₹₪₫₱﷼.,]/g,'');
            if (text.length >= 1) words.push({ text, bbox: word.bbox });
          }

    const found = [];
    const used  = new Set();

    // Pass 1: adjacent word pairs  [NUM CODE] or [CODE NUM]
    for (let i = 0; i < words.length - 1; i++) {
      const a = words[i], b = words[i+1];
      if (!sameLine(a,b) || !adjacent(a,b)) continue;

      let amount = null, code = null;

      const na = parseNum(a.text), cb = resolveCode(b.text);
      if (na !== null && cb) { amount = na; code = cb; }

      if (!amount) {
        const ca = resolveCode(a.text), nb = parseNum(b.text);
        if (ca && nb !== null) { amount = nb; code = ca; }
      }

      if (!amount || used.has(i) || used.has(i+1)) continue;
      used.add(i); used.add(i+1);

      const x = Math.round(((a.bbox.x0 + b.bbox.x1) / 2) * rx);
      const y = Math.round(Math.min(a.bbox.y0, b.bbox.y0) * ry);
      found.push({ x, y, amount, code });
    }

    // Pass 2: standalone SYMBOL+NUMBER  e.g. "$19.99"
    for (let i = 0; i < words.length; i++) {
      if (used.has(i)) continue;
      const a = words[i];
      if (!SYMBOL_RE.test(a.text)) continue;
      const code = SYMBOL_MAP[a.text[0]] || fromCurrency;
      const amount = parseNum(a.text);
      if (!amount) continue;
      used.add(i);
      const x = Math.round(((a.bbox.x0+a.bbox.x1)/2) * rx);
      const y = Math.round(a.bbox.y0 * ry);
      found.push({ x, y, amount, code });
    }

    // Deduplicate within 30px
    const out = [];
    const skip = new Set();
    for (let i = 0; i < found.length; i++) {
      if (skip.has(i)) continue;
      out.push(found[i]);
      for (let j = i+1; j < found.length; j++)
        if (Math.abs(found[i].x-found[j].x)<30 && Math.abs(found[i].y-found[j].y)<30) skip.add(j);
    }

    parentPort.postMessage({ items: out });
  } catch(e) {
    parentPort.postMessage({ items: [], error: String(e) });
  }
});