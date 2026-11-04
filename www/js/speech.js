/* Giọng nói: đọc (TTS), nghe (nhận dạng giọng nói), hiệu ứng âm thanh.
   Trên tablet dùng plugin gốc của Android; khi xem trên trình duyệt thì dùng Web Speech API. */

const Native = (() => {
  const C = window.Capacitor;
  const isNative = !!(C && C.isNativePlatform && C.isNativePlatform());
  const P = (isNative && C.Plugins) || {};
  return { isNative, TTS: P.TextToSpeech, SR: P.SpeechRecognition };
})();

const Voice = {
  viOK: false,
  _webVoices: [],
  async init() {
    if (Native.TTS) {
      try { this.viOK = (await Native.TTS.isLanguageSupported({ lang: 'vi-VN' })).supported; } catch (e) { this.viOK = false; }
    } else if ('speechSynthesis' in window) {
      const load = () => {
        this._webVoices = speechSynthesis.getVoices();
        this.viOK = this._webVoices.some(v => v.lang && v.lang.toLowerCase().startsWith('vi'));
      };
      load();
      speechSynthesis.onvoiceschanged = load;
    }
  },
  /* trả về Promise khi đọc xong */
  speak(text, lang = 'en-US', pitch = 1.2, rate = 0.85, opts = {}) {
    if (!text) return Promise.resolve();
    const vs = (typeof S !== 'undefined' && S.voice) || {};
    const isVi = lang.startsWith('vi');
    if (isVi && !opts.device && FPT.ready()) return FPT.speak(text).catch(e => { console.warn('FPT:', e.message); return this.speak(text, lang, pitch, rate, { device: true }); });
    // Kiểu giọng: nữ / nam / trẻ em (chỉnh cao độ trên giọng của máy)
    if (isVi && !opts.keepRate) rate = (typeof S !== 'undefined' && S.viRate) || 0.8;
    const st = isVi ? vs.viStyle : vs.enStyle;
    if (st === 'female') pitch = 1.15;
    else if (st === 'male') pitch = 0.72;
    else if (st === 'child') { pitch = 1.75; rate *= 1.06; }
    if (opts.pitch) pitch = opts.pitch;
    const want = opts.voiceName != null ? opts.voiceName : (isVi ? vs.viVoice : vs.enVoice);
    if (Native.TTS) {
      const o = { text, lang, rate, pitch, volume: 1.0, category: 'playback' };
      const idx = want ? this._nativeVoices.findIndex(v => v.name === want || v.voiceURI === want) : -1;
      if (idx >= 0) o.voice = idx;
      return Native.TTS.speak(o).catch(() => {});
    }
    if (!('speechSynthesis' in window)) return wait(Math.min(4000, text.length * 70));
    return this._webSpeak(text, lang, pitch, rate, want);
  },
  /* Chờ đến khi máy thật sự đọc xong (Safari có thể còn đọc dù đã báo xong), rồi nghỉ một nhịp */
  async idle(gap = 350) {
    if (!Native.TTS && 'speechSynthesis' in window) {
      for (let i = 0; i < 60 && (speechSynthesis.speaking || speechSynthesis.pending); i++) await wait(100);
    }
    await wait(gap);
  },
  _nativeVoices: [],
  /* Danh sách giọng có trên máy theo ngôn ngữ ('en' / 'vi') */
  async list(prefix) {
    let vs = [];
    if (Native.TTS) {
      try { this._nativeVoices = (await Native.TTS.getSupportedVoices()).voices || []; } catch (e) {}
      vs = this._nativeVoices;
    } else if ('speechSynthesis' in window) {
      for (let i = 0; i < 15 && !speechSynthesis.getVoices().length; i++) await wait(100);
      vs = this._webVoices = speechSynthesis.getVoices();
    }
    return vs.filter(v => (v.lang || '').toLowerCase().replace('_', '-').startsWith(prefix))
      .map(v => ({ name: v.name || v.voiceURI, lang: v.lang, label: Voice.label(v) }));
  },
  /* Đặt tên dễ hiểu cho giọng */
  label(v) {
    const n = (v.name || v.voiceURI || '').replace(/^(Microsoft|Google)\s*/i, '').replace(/Online \(Natural\)\s*-?\s*/i, '');
    const L = (v.lang || '').replace('_', '-');
    const region = { 'en-US': 'Mỹ', 'en-GB': 'Anh', 'en-AU': 'Úc', 'en-IN': 'Ấn Độ', 'en-CA': 'Canada', 'en-IE': 'Ireland', 'en-NZ': 'New Zealand', 'en-ZA': 'Nam Phi', 'en-SG': 'Singapore', 'vi-VN': 'Việt Nam' }[L] || L;
    const g = /female|woman|zira|aria|jenny|hoaimy|samantha|karen|moira|tessa|libby|sonia|natasha|emma|ava|sara/i.test(n) ? ' · nữ'
      : /\bmale\b|\bman\b|david|guy|ryan|namminh|daniel|george|alex|fred|thomas|william|christopher|eric|andrew|brian/i.test(n) ? ' · nam' : '';
    return `${n} (${region}${g})`;
  },
  _keep: [],          // giữ tham chiếu để Chrome không "nuốt" câu đang đọc
  _lastCancel: 0,
  unlocked: false,
  /* Gọi trong lúc người dùng chạm màn hình để trình duyệt cho phép phát tiếng */
  /* Phải gọi NGAY trong sự kiện chạm (không qua await): iPhone/iPad chỉ cho phát tiếng như vậy */
  unlock(firstText, lang = 'en-US') {
    if (Native.TTS || !('speechSynthesis' in window)) return;
    IOSAudio.unlock();
    if (this.unlocked) return;
    this.unlocked = true;
    try {
      const ss = speechSynthesis;
      this._webVoices = ss.getVoices();
      const u = new SpeechSynthesisUtterance(firstText || ' ');
      u.lang = lang; if (!firstText) u.volume = 0;
      const v = this._webVoices.find(v => v.lang === lang);
      if (v) u.voice = v;
      this._keep.push(u);
      ss.speak(u);
    } catch (e) {}
  },
  async _webSpeak(text, lang, pitch, rate, want) {
    const ss = window.speechSynthesis;
    if (!this._webVoices.length) {           // chờ danh sách giọng nạp xong (Android cần vài trăm ms)
      for (let i = 0; i < 10 && !ss.getVoices().length; i++) await wait(100);
      this._webVoices = ss.getVoices();
    }
    if (ss.speaking || ss.pending) { ss.cancel(); this._lastCancel = Date.now(); }
    else if (Date.now() - this._lastCancel > 250) this._lastCancel = 0;
    const since = Date.now() - this._lastCancel;
    if (since < 250) await wait(250 - since);  // lỗi của Chrome: đọc ngay sau khi dừng sẽ bị mất tiếng
    try { ss.resume(); } catch (e) {}
    return new Promise(res => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; u.pitch = Math.min(2, pitch); u.rate = rate; u.volume = 1;
      const v = (want && this._webVoices.find(v => v.name === want || v.voiceURI === want)) ||
        this._webVoices.find(v => v.lang === lang) ||
        this._webVoices.find(v => v.lang && v.lang.replace('_', '-').startsWith(lang.slice(0, 2)));
      if (v) u.voice = v;
      this._keep.push(u); if (this._keep.length > 20) this._keep.shift();
      /* Safari hay báo "đọc xong" quá sớm → chỉ coi là xong khi:
         (1) đã có onend, (2) đã qua thời gian tối thiểu ước theo độ dài câu, (3) máy thật sự không còn đọc */
      const t0 = Date.now(), minMs = Math.min(8000, text.length * 45 / Math.max(.5, rate));
      let done = false, ended = false;
      const finish = () => { if (!done) { done = true; clearInterval(poll); res(); } };
      const check = () => { if (ended && Date.now() - t0 >= minMs && !ss.speaking && !ss.pending) finish(); };
      const poll = setInterval(check, 120);
      u.onend = () => { ended = true; check(); };
      u.onerror = e => { if (e && e.error === 'interrupted' || e && e.error === 'canceled') finish(); else { ended = true; check(); } };
      setTimeout(finish, 4000 + text.length * 160); // phòng khi trình duyệt không bao giờ báo xong
      ss.speak(u);
    });
  },
  stop() {
    FPT.stop();
    if (Native.TTS) Native.TTS.stop().catch(() => {});
    else if ('speechSynthesis' in window) {
      // chỉ hủy khi đang đọc: hủy "suông" rồi chờ sẽ làm Safari mất quyền phát tiếng
      if (speechSynthesis.speaking || speechSynthesis.pending) { speechSynthesis.cancel(); this._lastCancel = Date.now(); }
    }
  }
};

/* iPhone/iPad: phát một đoạn âm thanh im lặng bằng thẻ <audio> trong lúc chạm.
   Việc này chuyển Safari sang chế độ "phát media", giúp có tiếng cả khi gạt nút im lặng (tùy phiên bản iOS). */
const IOSAudio = (() => {
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let el = null;
  const silentWav = () => {
    const n = 800, b = new Uint8Array(44 + n), d = new DataView(b.buffer);
    const w = (o, s) => [...s].forEach((c, i) => b[o + i] = c.charCodeAt(0));
    w(0, 'RIFF'); d.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); d.setUint32(16, 16, true); d.setUint16(20, 1, true);
    d.setUint16(22, 1, true); d.setUint32(24, 8000, true); d.setUint32(28, 8000, true); d.setUint16(32, 1, true);
    d.setUint16(34, 8, true); w(36, 'data'); d.setUint32(40, n, true); b.fill(128, 44);
    let bin = ''; b.forEach(x => bin += String.fromCharCode(x));
    return 'data:audio/wav;base64,' + btoa(bin);
  };
  return {
    isIOS,
    unlock() {
      if (!isIOS) return;
      try {
        if (!el) { el = new Audio(silentWav()); el.setAttribute('playsinline', ''); el.loop = true; el.volume = 0.01; }
        el.play().catch(() => {});
      } catch (e) {}
    }
  };
})();

/* ---------- Giọng tiếng Việt vùng miền qua FPT.AI (cần API key, có Internet) ----------
   API trả về một link mp3 "async": file có sau vài giây nên phải chờ rồi mới phát. */
/* Giọng của model FPT.TTS-pro trên Marketplace (vùng miền chưa được FPT công bố — bấm Nghe thử để chọn) */
const FPT_PRO_VOICES = [
  ['std_banmai', 'Ban Mai (chuẩn)'], ['std_quanganh', 'Quang Anh (chuẩn)'],
  ['fci_phuongan', 'Phương An'], ['fci_vietkhoa', 'Việt Khoa'], ['fci_xuantoan', 'Xuân Toàn']
];
/* Giọng của cổng cũ api.fpt.ai */
const FPT_VOICES = [
  ['banmai', 'Ban Mai · nữ · miền Bắc'], ['thuminh', 'Thu Minh · nữ · miền Bắc'], ['leminh', 'Lê Minh · nam · miền Bắc'],
  ['myan', 'Mỹ An · nữ · miền Trung'], ['giahuy', 'Gia Huy · nam · miền Trung'],
  ['lannhi', 'Lan Nhi · nữ · miền Nam'], ['linhsan', 'Linh San · nữ · miền Nam']
];
const FPT_BASE = 'https://mkp-api.fptcloud.com';
const FPT = (() => {
  const cache = new Map();      // câu → Promise<nguồn âm thanh (link mp3 / data URL / blob URL)>
  let audio = null;
  const vs = () => S.voice;
  const nativeHttp = () => Native.isNative && window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.CapacitorHttp;

  /* Gọi HTTP: trên APK đi đường native (không bị chặn CORS), trên web dùng fetch */
  async function http(url, { method = 'GET', headers = {}, body, binary } = {}) {
    const H = nativeHttp();
    if (H) {
      const r = await H.request({ url, method, headers, data: body, responseType: binary ? 'blob' : 'json', readTimeout: 30000, connectTimeout: 15000 });
      if (r.status >= 400) throw new Error(`HTTP ${r.status}: ${typeof r.data === 'string' ? r.data.slice(0, 160) : JSON.stringify(r.data).slice(0, 160)}`);
      if (binary) return 'data:audio/mpeg;base64,' + r.data;
      return typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
    }
    const r = await fetch(url, { method, headers, body: body && typeof body !== 'string' ? JSON.stringify(body) : body });
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 160)}`);
    return binary ? URL.createObjectURL(await r.blob()) : r.json();
  }

  /* --- Cách mới: FPT AI Marketplace (Token Factory), kiểu OpenAI /v1/audio/speech --- */
  function mkp(text) {
    const v = vs();
    return http(`${FPT_BASE}/v1/audio/speech`, {
      method: 'POST', binary: true,
      headers: { Authorization: `Bearer ${v.fptKey}`, 'content-type': 'application/json' },
      body: { model: v.fptModel || 'FPT.TTS-pro', input: text, voice: v.fptVoice || 'std_banmai', response_format: 'mp3', speed: Math.max(0.7, Math.min(1.3, S.viRate || 0.8)) }
    });
  }
  /* --- Cách cũ: api.fpt.ai/hmi/tts/v5 (trả link mp3 tạo sau vài giây) --- */
  async function legacy(text) {
    const v = vs();
    const j = await http('https://api.fpt.ai/hmi/tts/v5', {
      method: 'POST',
      headers: { 'api-key': v.fptKey, voice: v.fptVoice || 'banmai', speed: String(Math.max(-3, Math.min(3, Math.round(((S.viRate || 0.8) - 1) * 10)))), 'content-type': 'text/plain' },
      body: text
    });
    if ((j.error !== 0 && j.error !== '0') || !j.async) throw new Error(j.message || 'FPT.AI lỗi');
    return j.async;
  }
  function request(text) {
    const v = vs(), key = [v.fptMode, v.fptModel, v.fptVoice, text].join('|');
    if (cache.has(key)) return cache.get(key);
    const pr = v.fptMode === 'legacy' ? legacy(text) : mkp(text);
    pr.catch(() => cache.delete(key));
    cache.set(key, pr);
    if (cache.size > 150) { const k = cache.keys().next().value; cache.get(k).then(u => u.startsWith('blob:') && URL.revokeObjectURL(u)).catch(() => {}); cache.delete(k); }
    return pr;
  }
  /* Phát âm thanh; link của cách cũ cần chờ file sẵn sàng nên thử lại mỗi giây (tối đa ~9 giây) */
  function play(src) {
    return new Promise((res, rej) => {
      let tries = 0;
      const remote = /^https?:/.test(src);
      const a = audio = new Audio();
      const attempt = () => {
        if (audio !== a) return res();
        a.src = remote && tries ? src + (src.includes('?') ? '&' : '?') + 't=' + tries : src;
        a.play().catch(() => {});
      };
      a.onended = () => res();
      a.onerror = () => {
        if (!remote || ++tries > 9 || audio !== a) return rej(new Error('Không phát được âm thanh'));
        setTimeout(attempt, 1000);
      };
      attempt();
    });
  }
  return {
    ready() { const v = vs(); return !!(v.viEngine === 'fpt' && v.fptKey); },
    prefetch(text) { if (text && this.ready()) request(text).catch(() => {}); },
    async speak(text) { if (!this.ready()) throw new Error('Chưa cài FPT'); return play(await request(text)); },
    stop() { if (audio) { try { audio.pause(); } catch (e) {} audio = null; } },
    /* Liệt kê model trong tài khoản Marketplace, ưu tiên model giọng nói */
    async models(key) {
      const j = await http(`${FPT_BASE}/v1/models`, { headers: { Authorization: `Bearer ${key}` } });
      const ids = (j.data || j.models || []).map(m => m.id || m.name || m).filter(x => typeof x === 'string');
      const isTts = id => /tts|speech|voice|audio|vits|giong/i.test(id) && !/whisper|stt|transcri|asr/i.test(id);
      return { tts: ids.filter(isTts), all: ids };
    },
    clear() { cache.clear(); }
  };
})();

const Ears = {
  available: false,
  blocked: false,
  _web: null,
  _listening: false,
  async init() {
    if (Native.SR) {
      try { this.available = (await Native.SR.available()).available; } catch (e) { this.available = false; }
    } else {
      const W = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.available = !!W;
    }
  },
  async ensurePermission() {
    if (!Native.SR) return true;
    try {
      let st = await Native.SR.checkPermissions();
      if (st.speechRecognition !== 'granted') st = await Native.SR.requestPermissions();
      return st.speechRecognition === 'granted';
    } catch (e) { return false; }
  },
  /* Nghe 1 câu, trả về mảng các câu đoán được (chữ thường) */
  async listen(lang = 'en-US', timeoutMs = 9000) {
    if (!this.available) return [];
    Voice.stop();
    this._listening = true;
    try {
      if (Native.SR) {
        if (!(await this.ensurePermission())) return [];
        const t = setTimeout(() => Native.SR.stop().catch(() => {}), timeoutMs);
        try {
          const r = await Native.SR.start({ language: lang, maxResults: 5, partialResults: false, popup: false });
          return (r.matches || []).map(s => s.toLowerCase());
        } finally { clearTimeout(t); }
      }
      const W = window.SpeechRecognition || window.webkitSpeechRecognition;
      return await new Promise(res => {
        const rec = new W();
        this._web = rec;
        rec.lang = lang; rec.maxAlternatives = 5; rec.interimResults = false; rec.continuous = false;
        let out = [];
        rec.onresult = e => { out = Array.from(e.results[0]).map(a => a.transcript.toLowerCase()); };
        rec.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') this.blocked = true; res(out); };
        rec.onend = () => res(out);
        setTimeout(() => { try { rec.stop(); } catch (e) {} }, timeoutMs);
        rec.start();
      });
    } catch (e) {
      return [];
    } finally {
      this._listening = false;
    }
  },
  stop() {
    if (!this._listening) return;
    if (Native.SR) Native.SR.stop().catch(() => {});
    else if (this._web) try { this._web.abort(); } catch (e) {}
  }
};

/* So khớp lời bé nói với đáp án — dễ tính để phù hợp trẻ nhỏ */
function norm(s) {
  return ' ' + String(s).toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/\b(\d+)\b/g, (m, d) => NUMBER_WORDS[+d] || d)
    .replace(/\s+/g, ' ').trim() + ' ';
}
function lev(a, b) {
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function heard(matches, accept) {
  for (const raw of matches) {
    const s = norm(raw);
    for (const a of accept) {
      const t = norm(a).trim();
      if (s.includes(' ' + t + ' ')) return true;
      if (t.length >= 4 && !t.includes(' ')) {
        for (const w of s.trim().split(' ')) if (w.length >= 3 && lev(w, t) <= 1) return true;
      }
    }
  }
  return false;
}

/* Hiệu ứng âm thanh tạo bằng WebAudio, không cần file */
const Sfx = (() => {
  let ctx;
  const ac = () => (ctx = ctx || new (window.AudioContext || window.webkitAudioContext)());
  function tone(freq, start, dur, type = 'sine', vol = 0.18, slideTo) {
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + start);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + start + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol, c.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g).connect(c.destination); o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
  }
  const safe = fn => (...a) => { try { fn(...a); } catch (e) {} };
  return {
    pop: safe(() => tone(520, 0, 0.12, 'sine', 0.2, 980)),
    tap: safe(() => tone(700, 0, 0.06, 'triangle', 0.12)),
    ding: safe(() => { tone(880, 0, 0.18, 'sine'); tone(1320, 0.12, 0.3, 'sine'); }),
    cheer: safe(() => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle', 0.16))),
    oops: safe(() => tone(330, 0, 0.25, 'sine', 0.14, 220)),
    unlock: safe(() => { const c = ac(); if (c.state === 'suspended') c.resume(); })
  };
})();

const wait = ms => new Promise(r => setTimeout(r, ms));
