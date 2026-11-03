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
  speak(text, lang = 'en-US', pitch = 1.2, rate = 0.85) {
    if (!text) return Promise.resolve();
    if (Native.TTS) {
      return Native.TTS.speak({ text, lang, rate, pitch, volume: 1.0, category: 'playback' }).catch(() => {});
    }
    if (!('speechSynthesis' in window)) return wait(Math.min(4000, text.length * 70));
    return new Promise(res => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; u.pitch = Math.min(2, pitch); u.rate = rate;
      const v = this._webVoices.find(v => v.lang === lang) || this._webVoices.find(v => v.lang && v.lang.startsWith(lang.slice(0, 2)));
      if (v) u.voice = v;
      let done = false;
      const fin = () => { if (!done) { done = true; res(); } };
      u.onend = fin; u.onerror = fin;
      setTimeout(fin, 3000 + text.length * 150); // phòng khi trình duyệt không báo onend
      speechSynthesis.speak(u);
    });
  },
  stop() {
    if (Native.TTS) Native.TTS.stop().catch(() => {});
    else if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
};

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
