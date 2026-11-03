/* ================== Bé Học Tiếng Anh — logic ứng dụng ================== */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const TILE_COLORS = ['c-pink', 'c-blue', 'c-yellow', 'c-green', 'c-purple', 'c-orange'];

/* ---------- Lưu cài đặt ---------- */
const DEFAULTS = {
  charId: 'luna', childName: '', childAge: 4,
  viHint: true, viVoice: true, rate: 0.85,
  maxCount: 10, lowerCase: false,
  aiOn: true, apiKey: '', model: 'claude-haiku-5-5', aiDaily: 30, aiUsed: { date: '', n: 0 },
  stars: 0, traced: {}, book: {}
};
const S = (() => {
  let s = {};
  try { s = JSON.parse(localStorage.getItem('kidsEnglish') || '{}'); } catch (e) {}
  return Object.assign({}, DEFAULTS, s);
})();
const save = () => { try { localStorage.setItem('kidsEnglish', JSON.stringify(S)); } catch (e) {} };
const char = () => CHARACTERS[S.charId] || CHARACTERS.luna;

/* ---------- Nhân vật + bong bóng thoại ---------- */
const Stage = {
  box: null,
  render() {
    const c = char();
    $('#charbox').innerHTML = `<div class="char" id="charEl" style="height:100%;display:flex;justify-content:center">${c.svg()}</div>`;
    document.documentElement.style.setProperty('--accent', c.color);
  },
  mood(m, ms) {
    const el = $('#charEl'); if (!el) return;
    el.classList.remove('cheer', 'think', 'listen', 'sad');
    if (m) el.classList.add(m);
    if (ms) setTimeout(() => el.classList.remove(m), ms);
  },
  talking(on) { const el = $('#charEl'); if (el) el.classList.toggle('talking', on); },
  bubble(en, vi) {
    const b = $('#bubble');
    $('.en', b).textContent = en || '';
    $('.vi', b).textContent = (S.viHint && vi) ? vi : '';
    b.classList.toggle('empty', !en);
  }
};

const fill = t => String(t || '')
  .replace(/\{char\}/g, char().name)
  .replace(/\{name\}/g, Run.name || S.childName || 'friend')
  .replace(/\{age\}/g, Run.age || S.childAge);

/* Nhân vật nói (có thể kèm gợi ý tiếng Việt). Trả về false nếu màn hình đã đổi. */
async function talk(en, vi, opts = {}) {
  const token = Run.id;
  en = fill(en); vi = fill(vi);
  Stage.bubble(en, vi);
  Stage.talking(true);
  await Voice.speak(en, 'en-US', char().pitch, S.rate * char().rate);
  if (token !== Run.id) return false;
  if (vi && S.viHint && S.viVoice && Voice.viOK && !opts.noVi) {
    await wait(150);
    if (token !== Run.id) return false;
    await Voice.speak(vi, 'vi-VN', 1.1, 1.0);
  }
  Stage.talking(false);
  return token === Run.id;
}

/* ---------- Sao thưởng & pháo giấy ---------- */
function addStar(n = 1) {
  S.stars += n; save();
  const st = $('#stars'); $('span', st).textContent = S.stars;
  st.classList.remove('bump'); void st.offsetWidth; st.classList.add('bump');
}
function confetti(n = 40) {
  const colors = ['#ff7eb6', '#4fc3f7', '#ffd54f', '#66bb6a', '#b388ff', '#ffa94d'];
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div');
    d.className = 'confetti';
    d.style.left = Math.random() * 100 + 'vw';
    d.style.background = pick(colors);
    d.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
    d.style.animationDelay = Math.random() * 0.4 + 's';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3800);
  }
}
function toast(emoji) {
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = emoji;
  document.body.appendChild(d); setTimeout(() => d.remove(), 1300);
}
async function celebrate(text, vi) {
  Sfx.cheer(); confetti(); toast(pick(['⭐', '🎉', '🌟', '🏆', '💖']));
  Stage.mood('cheer', 1500); addStar();
  return talk(text || pick(PRAISE), vi);
}

/* ---------- Điều hướng ---------- */
const Run = { id: 0, name: '', age: '' };
const SCREENS = {};
let current = 'home';

function go(name, params = {}, push = true) {
  Run.id++;
  Voice.stop(); Ears.stop();
  Stage.talking(false); Stage.mood(null); Stage.bubble('');
  current = name;
  const sc = SCREENS[name];
  $('#title').textContent = sc.title(params);
  $('#back').classList.toggle('hidden', name === 'home');
  $('#main').classList.toggle('full', !!sc.full);
  const panel = $('#panel'); panel.innerHTML = ''; panel.scrollTop = 0;
  if (push) history.pushState({ name, params }, '');
  sc.render(panel, params);
}
window.addEventListener('popstate', e => {
  const st = e.state || { name: 'home', params: {} };
  go(st.name, st.params, false);
});
$('#back').onclick = () => history.back();
$('#parent').onclick = () => { Sfx.tap(); go('gate'); };
document.addEventListener('pointerdown', () => Sfx.unlock(), { once: true });

/* Khung micro dùng chung: trả về chuỗi bé nói, hoặc null nếu không có micro */
function micButton(onResult, label = 'Bấm để nói') {
  const wrap = document.createElement('div');
  wrap.className = 'center'; wrap.style.flex = '0';
  const typeBox = () => {
    if ($('.textin', wrap)) return;
    const t = document.createElement('div');
    t.className = 'textin';
    t.innerHTML = `<input placeholder="Gõ câu bé nói (bản thử trên web)"><button class="btn">Gửi</button>`;
    const inp = $('input', t), go_ = () => { const v = inp.value.trim(); if (v) { inp.value = ''; onResult([v.toLowerCase()]); } };
    $('button', t).onclick = go_;
    inp.onkeydown = e => { if (e.key === 'Enter') go_(); };
    wrap.appendChild(t);
  };
  // Ô gõ thay giọng nói: hiện trên PC; trên máy cảm ứng chỉ hiện khi không dùng được micro
  const touch = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  if (!Native.isNative && (!touch || !Ears.available || Ears.blocked)) setTimeout(typeBox, 0);
  if (!Ears.available || Ears.blocked) return wrap;
  wrap.innerHTML = `<button class="mic">🎤</button><div class="mic-label">${label}</div>`;
  const b = $('.mic', wrap);
  b.onclick = async () => {
    if (b.classList.contains('on')) { Ears.stop(); return; }
    const token = Run.id;
    Sfx.pop(); b.classList.add('on'); Stage.mood('listen');
    $('.mic-label', wrap).textContent = 'Bé nói đi, mình đang nghe...';
    const res = await Ears.listen();
    if (token !== Run.id) return;
    b.classList.remove('on'); Stage.mood(null);
    $('.mic-label', wrap).textContent = Ears.blocked ? 'Micro không dùng được ở đây — hãy gõ bên dưới' : label;
    if (Ears.blocked) { b.disabled = true; typeBox(); return; }
    onResult(res);
  };
  return wrap;
}

/* ================== MÀN HÌNH ================== */

/* ---------- Trang chủ ---------- */
SCREENS.home = {
  title: () => 'Bé Học Tiếng Anh',
  render(p) {
    const items = [
      ['bookMenu', '📚', 'Học theo sách lớp 1', 'English 1'],
      ['chatTopics', '💬', 'Nói chuyện', 'Talk with me'],
      ['ai', '✨', 'Trò chuyện tự do', 'Free talk'],
      ['count', '🔢', 'Học đếm', 'Count with me'],
      ['traceMenu', '✏️', 'Tập tô chữ & số', 'Write'],
      ['findMenu', '🔍', 'Tìm chữ & số', 'Find it'],
      ['chars', '🦄', 'Đổi bạn chơi', 'Friends']
    ].filter(x => x[0] !== 'ai' || S.aiOn);
    p.innerHTML = `<div class="tiles">${items.map((x, i) =>
      `<button class="tile ${TILE_COLORS[i % 6]}" data-go="${x[0]}"><span class="ico">${x[1]}</span>${x[2]}<small>${x[3]}</small></button>`).join('')}</div>`;
    $$('[data-go]', p).forEach(b => b.onclick = () => { Sfx.tap(); go(b.dataset.go); });
    const nm = S.childName ? `, ${S.childName}` : '';
    talk(`Hi${nm}! Let's play!`, 'Chào bé! Mình cùng chơi nhé!');
  }
};

/* ---------- Chọn nhân vật ---------- */
SCREENS.chars = {
  title: () => 'Chọn bạn chơi', full: true,
  render(p) {
    p.innerHTML = `<div class="charpick">${Object.values(CHARACTERS).map(c =>
      `<button class="charcard ${c.id === S.charId ? 'sel' : ''}" data-id="${c.id}"><div class="mini char">${c.svg()}</div>${c.vi}</button>`).join('')}</div>
      <div class="row"><button class="btn big primary" id="ok">Xong ✔</button></div>`;
    $$('.charcard', p).forEach(b => b.onclick = async () => {
      Sfx.pop();
      S.charId = b.dataset.id; save(); Stage.render();
      $$('.charcard', p).forEach(x => x.classList.toggle('sel', x === b));
      const c = char(), mini = $('.mini', b);
      mini.classList.add('talking');
      await Voice.speak(`Hi! I am ${c.name}!`, 'en-US', c.pitch, S.rate * c.rate);
      mini.classList.remove('talking');
    });
    $('#ok', p).onclick = () => history.back();
  }
};

/* ---------- Nói chuyện theo chủ đề ---------- */
SCREENS.chatTopics = {
  title: () => 'Nói chuyện',
  render(p) {
    p.innerHTML = `<div class="tiles">${TOPICS.map((t, i) =>
      `<button class="tile ${TILE_COLORS[i % 6]}" data-id="${t.id}"><span class="ico">${t.icon}</span>${t.vi}<small>${t.en}</small></button>`).join('')}</div>`;
    $$('[data-id]', p).forEach(b => b.onclick = () => { Sfx.tap(); go('chat', { id: b.dataset.id }); });
    talk('What do you want to talk about?', 'Bé muốn nói về chủ đề gì?');
  }
};

SCREENS.chat = {
  title: pr => {
    if (pr.book) return `Unit ${pr.book} · ${BOOK_UNITS[pr.book - 1].count && pr.part === 'sent' ? 'Đếm số' : PART_NAMES[pr.part]}`;
    const t = TOPICS.find(x => x.id === pr.id); return `${t.icon} ${t.vi}`;
  },
  render(p, pr) {
    const unit = pr.book ? BOOK_UNITS[pr.book - 1] : null;
    const turns = unit ? bookTurns(unit, pr.part) : TOPICS.find(x => x.id === pr.id).turns();
    let i = 0;
    Run.name = S.childName; Run.age = '';

    const show = async () => {
      const token = Run.id;
      if (i >= turns.length) return finish();
      const t = turns[i];
      let tries = 0;
      p.innerHTML = `
        <div class="progress">${turns.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('')}</div>
        <div class="center">
          ${t.color ? `<div class="swatch" style="background:${t.color}"></div>` : `<div class="picture${t.small ? ' small' : ''}">${t.pic || '💬'}</div>`}
          <div class="row" id="choices"></div>
          <div class="heard" id="heard"></div>
        </div>
        <div class="row" id="ctrl"></div>`;
      const ctrl = $('#ctrl', p), choices = $('#choices', p), heardEl = $('#heard', p);

      const done = async (ok, reply) => {
        if (token !== Run.id) return;
        $$('button', p).forEach(b => b.disabled = true);
        if (ok) { if (!(await celebrate(reply || t.good || pick(PRAISE)))) return; }
        else { Sfx.ding(); addStar(); if (!(await talk(reply || 'Good try!'))) return; }
        await wait(500);
        if (token !== Run.id) return;
        i++; show();
      };

      const check = async (matches, fromTap) => {
        if (token !== Run.id) return;
        if (!fromTap) heardEl.textContent = matches.length ? `Bé nói: “${matches[0]}”` : 'Mình chưa nghe rõ...';
        const all = matches.join(' ');
        if (t.type === 'name') {
          const m = norm(all).match(/(?:my name is|name is|i am|i'm|im|call me)\s+([a-z]+)/);
          const w = m ? m[1] : (matches[0] || '').trim().split(/\s+/).pop();
          if (w && w.length > 1) {
            Run.name = w[0].toUpperCase() + w.slice(1);
            if (!S.childName) { S.childName = Run.name; save(); }
            return done(true);
          }
        } else if (t.type === 'age') {
          const m = norm(all).match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/);
          if (m) { Run.age = m[1]; return done(true); }
        } else if (t.type === 'action') {
          return done(true);
        } else if (heard(matches, t.accept || [])) {
          return done(true);
        }
        tries++;
        Sfx.oops(); Stage.mood('think', 1200);
        if (tries >= 2) return done(false, `${t.model || 'Good try!'} Good try!`);
        talk(t.type === 'name' ? 'Say: my name is ...' : `Try again! ${t.model || ''}`, t.vi);
      };

      // nút trả lời bấm được
      let choiceList = t.choices || [];
      if (t.type === 'name' && S.childName) choiceList = [`My name is ${S.childName}`];
      choiceList.forEach(c => {
        const b = document.createElement('button');
        const txt = fill(typeof c === 'string' ? c : c.t);
        b.className = 'choice';
        if (typeof c === 'string') b.textContent = txt;
        else b.innerHTML = `<span class="ce">${c.e}</span>${esc(txt)}`;
        b.onclick = async () => {
          Sfx.tap();
          const ok = (t.tapOnly || t.grade) ? heard([txt.toLowerCase()], t.accept) : true;
          b.classList.add(ok ? 'right' : 'wrongc');
          await Voice.speak(txt, 'en-US', 1.0, S.rate);
          check([txt.toLowerCase()], true);
        };
        choices.appendChild(b);
      });
      if (t.type === 'action') {
        const b = document.createElement('button');
        b.className = 'btn big primary'; b.textContent = '👍 Bé làm rồi!';
        b.onclick = () => { Sfx.tap(); check([], true); };
        choices.appendChild(b);
      }
      if (t.type !== 'action' && !t.tapOnly) ctrl.appendChild(micButton(r => check(r, false)));
      const again = document.createElement('button');
      again.className = 'btn'; again.textContent = '🔊 Nghe lại';
      again.onclick = () => talk(t.say, t.vi);
      const skip = document.createElement('button');
      skip.className = 'btn'; skip.textContent = '⏭️ Bỏ qua';
      skip.onclick = () => { Voice.stop(); Run.id++; i++; show(); };
      ctrl.append(again, skip);

      await talk(t.say, t.vi);
    };

    const finish = async () => {
      p.innerHTML = `<div class="center"><div class="picture">🏆</div>
        <div class="row"><button class="btn big primary" id="again">🔁 Chơi lại</button><button class="btn big" id="home">🏠 Về nhà</button></div></div>`;
      $('#again', p).onclick = () => go('chat', pr, false);
      $('#home', p).onclick = () => history.back();
      Sfx.cheer(); confetti(80); addStar(3);
      Stage.mood('cheer', 2000);
      if (unit) { S.book[`${unit.n}-${pr.part}`] = true; save(); }
      talk('You did it! You are a star!', 'Bé giỏi quá! Bé là ngôi sao!');
    };
    show();
  }
};

/* ---------- Trò chuyện tự do với AI ---------- */
SCREENS.ai = {
  title: () => '✨ Trò chuyện tự do',
  render(p) {
    const today = new Date().toISOString().slice(0, 10);
    if (S.aiUsed.date !== today) { S.aiUsed = { date: today, n: 0 }; save(); }
    if (!S.apiKey && !window.claude) {
      p.innerHTML = `<div class="center"><div class="picture">🔑</div>
        <div class="note">Bố mẹ cần nhập <b>API key</b> trong phần ⚙️ Cài đặt để mở chế độ trò chuyện tự do.</div></div>`;
      talk('Ask mom or dad to help me!', 'Bé nhờ bố mẹ giúp nhé!');
      return;
    }
    const history_ = [];
    p.innerHTML = `<div class="chatlog" id="log"></div><div id="micwrap"></div>
      ${Native.isNative ? '<div class="textin"><input id="txt" placeholder="(Bố mẹ có thể gõ thử ở đây)"><button class="btn" id="send">Gửi</button></div>' : ''}`;
    const log = $('#log', p);
    const add = (who, en, vi) => {
      const d = document.createElement('div'); d.className = 'msg ' + who;
      d.innerHTML = esc(en) + (vi && S.viHint ? `<span class="vi">${esc(vi)}</span>` : '');
      log.appendChild(d); log.scrollTop = log.scrollHeight;
    };
    let busy = false;
    const send = async text => {
      text = (text || '').trim();
      if (!text || busy) return;
      const token = Run.id;
      if (S.aiUsed.n >= S.aiDaily) {
        add('bot', "Let's take a break! See you tomorrow!", 'Hôm nay mình nói chuyện đủ rồi, mai gặp lại nhé!');
        talk("Let's take a break! See you tomorrow!", 'Hôm nay mình nói đủ rồi, mai gặp lại nhé!');
        return;
      }
      busy = true;
      add('kid', text);
      history_.push({ role: 'user', content: text });
      Stage.mood('think');
      try {
        const r = await askAI(history_.slice(-12));
        if (token !== Run.id) return;
        S.aiUsed.n++; save();
        history_.push({ role: 'assistant', content: JSON.stringify(r) });
        Stage.mood(null);
        add('bot', r.say, r.vi);
        await talk(r.say, r.vi, { noVi: true });
      } catch (e) {
        if (token !== Run.id) return;
        history_.pop();
        Stage.mood('sad', 1500);
        add('bot', 'Oops! I cannot hear the internet.', 'Lỗi kết nối: ' + e.message);
        talk('Oops! Let\'s try again.');
      } finally { busy = false; }
    };
    $('#micwrap', p).appendChild(micButton(r => { if (r.length) send(r[0]); else talk("Sorry, I didn't hear you. Again, please!"); }));
    if ($('#send', p)) {
      $('#send', p).onclick = () => { const t = $('#txt', p); send(t.value); t.value = ''; };
      $('#txt', p).onkeydown = e => { if (e.key === 'Enter') $('#send', p).click(); };
    }
    const hi = `Hi${S.childName ? ' ' + S.childName : ''}! I am ${char().name}. What do you like to play?`;
    add('bot', hi, 'Chào bé! Bé thích chơi gì?');
    history_.push({ role: 'user', content: '(The child opened the app.)' }, { role: 'assistant', content: JSON.stringify({ say: hi, vi: '' }) });
    talk(hi, 'Chào bé! Bé thích chơi gì?');
  }
};

async function askAI(messages) {
  if (!S.apiKey && window.claude) return askDemoAI(messages);
  const c = char();
  const system = `You are ${c.name}, a friendly cartoon ${c.species} in a tablet app. You talk with a ${S.childAge}-year-old Vietnamese child${S.childName ? ' named ' + S.childName : ''} who is learning to SPEAK English.
Rules:
- Use very simple English that a 4-year-old understands. Reply with 1-2 short sentences, at most 15 words.
- Usually end with ONE easy question the child can answer with one or two words.
- Be warm, playful and encouraging. Praise every try. Never scold or correct harshly.
- The child's words come from speech recognition and may be garbled: guess kindly what they meant.
- If the child speaks Vietnamese, answer in simple English and help them say it in English.
- Good topics: colors, animals, food, toys, family, numbers, shapes, weather, feelings, simple games.
- Stay strictly child-safe: no violence, scary things, romance, brands, or adult topics; gently change the subject.
- Never ask for personal information (address, school, phone, photos). Never suggest secrets, meeting up, or going anywhere.
Output ONLY a JSON object: {"say": "<your English reply>", "vi": "<short Vietnamese translation for the parent>"}`;
  return callAnthropic(system, messages);
}

function aiSystem() {
  const c = char();
  return `You are ${c.name}, a friendly cartoon ${c.species}. You talk with a ${S.childAge}-year-old Vietnamese child${S.childName ? ' named ' + S.childName : ''} who is learning to SPEAK English. Use very simple English, 1-2 short sentences, max 15 words, usually end with one easy question. Be warm and encouraging, never scold. The child's words may be garbled by speech recognition; guess kindly. If the child uses Vietnamese, answer in simple English and help them say it in English. Strictly child-safe: no violence, scary, romance, brands or adult topics; never ask for personal information or suggest secrets or going anywhere.`;
}

function parseAI(text) {
  const m = String(text).match(/\{[\s\S]*\}/);
  try { const j = JSON.parse(m ? m[0] : text); if (j.say) return { say: j.say, vi: j.vi || '' }; } catch (e) {}
  return { say: String(text).replace(/[{}"]/g, '').trim() || 'Hello!', vi: '' };
}

/* Bản demo chạy trong Claude: dùng Claude của trang thay cho API key */
async function askDemoAI(messages) {
  const sample = await window.claude.use('sample');
  if (!sample) throw new Error('Trang demo chưa được cấp quyền dùng Claude');
  const talkLog = messages.map(m => (m.role === 'user' ? 'Child: ' + m.content : 'You: ' + (parseAI(m.content).say))).join('\n');
  const prompt = `${aiSystem()}\n\nConversation so far:\n${talkLog}\n\nWrite your next reply. Output ONLY JSON: {"say": "<English reply>", "vi": "<short Vietnamese translation>"}`;
  const r = await sample(prompt, { modelTier: 'quick', cache: false });
  return parseAI(r.text);
}

async function callAnthropic(system, messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': S.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({ model: S.model, max_tokens: 200, system, messages })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data.error && data.error.message) || ('HTTP ' + res.status));
  const text = ((data.content || []).find(b => b.type === 'text') || {}).text || '';
  const m = text.match(/\{[\s\S]*\}/);
  try { const j = JSON.parse(m ? m[0] : text); if (j.say) return { say: j.say, vi: j.vi || '' }; } catch (e) {}
  return { say: text.replace(/[{}"]/g, '').trim() || 'Hello!', vi: '' };
}

/* ---------- Học theo sách lớp 1 ---------- */
const PART_NAMES = { words: 'Từ mới', sent: 'Mẫu câu' };
const unitDone = u => [S.book[`${u.n}-words`], S.book[`${u.n}-sent`], S.traced[u.L] || S.traced[u.L.toLowerCase()]].filter(Boolean).length;

SCREENS.bookMenu = {
  title: () => '📚 Tiếng Anh 1',
  render(p) {
    p.innerHTML = `<div class="units">${BOOK_UNITS.map((u, i) => {
      const d = unitDone(u);
      return `<button class="unit ${TILE_COLORS[i % 6]}" data-n="${u.n}">
        <span class="ul">${u.L}${u.L.toLowerCase()}</span><b>Unit ${u.n}</b><small>${u.place}</small>
        <span class="ustars">${'★'.repeat(d)}${'☆'.repeat(3 - d)}</span></button>`;
    }).join('')}</div>`;
    $$('[data-n]', p).forEach(b => b.onclick = () => { Sfx.tap(); go('bookUnit', { n: +b.dataset.n }); });
    talk('Pick a unit!', 'Bé chọn bài học nhé!');
  }
};

SCREENS.bookUnit = {
  title: pr => `Unit ${pr.n} · ${BOOK_UNITS[pr.n - 1].place}`,
  render(p, pr) {
    const u = BOOK_UNITS[pr.n - 1], l = u.L.toLowerCase();
    const parts = [
      ['words', '🗣️', 'Từ mới', u.w.map(w => w[1]).join(' ')],
      ['sent', u.count ? '🔢' : '💬', u.count ? 'Đếm số' : 'Mẫu câu', u.count ? 'How many?' : (u.s[0] || [''])[0]],
      ['traceU', '✏️', `Tô chữ ${u.L}`, u.L], ['traceL', '✏️', `Tô chữ ${l}`, l]
    ];
    const done = { words: S.book[`${u.n}-words`], sent: S.book[`${u.n}-sent`], traceU: S.traced[u.L], traceL: S.traced[l] };
    p.innerHTML = `<div class="unithead"><span class="bigL">${u.L}${l}</span><div><b>${u.en}</b><br>${u.w.map(w => `${w[1]} ${w[0]}`).join(' · ')}</div></div>
      <div class="tiles">${parts.map((x, i) => `<button class="tile ${TILE_COLORS[(i + pr.n) % 6]}" data-k="${x[0]}">
        <span class="ico">${x[1]}</span>${x[2]}${done[x[0]] ? ' ⭐' : ''}<small>${esc(x[3])}</small></button>`).join('')}</div>`;
    $$('[data-k]', p).forEach(b => b.onclick = () => {
      Sfx.tap();
      const k = b.dataset.k;
      if (k === 'traceU') go('trace', { g: u.L, tab: 'abc' });
      else if (k === 'traceL') go('trace', { g: l, tab: 'abc' });
      else go('chat', { book: u.n, part: k });
    });
    talk(`Unit ${u.n}. ${u.en}. Letter ${u.L}!`, `Bài ${u.n}: ${u.place}. Chữ ${u.L}.`);
  }
};

/* ---------- Học đếm ---------- */
SCREENS.count = {
  title: () => '🔢 Học đếm',
  render(p) {
    let round = 0;
    const next = async () => {
      const token = Run.id;
      round++;
      const n = 1 + Math.floor(Math.random() * S.maxCount);
      const [emo, one, many] = pick(COUNT_ITEMS);
      const word = n === 1 ? one : many;
      let counted = 0;
      p.innerHTML = `<div class="field" id="field"></div><div class="row" id="answers"></div>`;
      const field = $('#field', p), answers = $('#answers', p);
      for (let k = 0; k < n; k++) {
        const b = document.createElement('button');
        b.className = 'obj'; b.textContent = emo; b.style.animationDelay = k * 0.06 + 's';
        b.onclick = () => {
          if (b.classList.contains('counted') || !counting) return;
          counted++;
          b.classList.add('counted');
          b.insertAdjacentHTML('beforeend', `<span class="badge">${counted}</span>`);
          Sfx.pop();
          Voice.stop();
          Stage.bubble(NUMBER_WORDS[counted][0].toUpperCase() + NUMBER_WORDS[counted].slice(1) + '!', String(counted));
          Voice.speak(NUMBER_WORDS[counted] + '!', 'en-US', char().pitch, 0.9);
          if (counted === n) setTimeout(() => ask(), 900);
        };
        field.appendChild(b);
      }
      let counting = true;
      const ask = async () => {
        if (token !== Run.id) return;
        counting = false;
        if (!(await talk(`${NUMBER_WORDS[n][0].toUpperCase() + NUMBER_WORDS[n].slice(1)} ${word}! How many ${many}?`, `Có mấy cái? Bé chọn số ${n} nhé!`))) return;
        const opts = new Set([n]);
        while (opts.size < 3) { const x = n + pick([-2, -1, 1, 2, 3]); if (x >= 1 && x <= 20) opts.add(x); }
        answers.innerHTML = '';
        shuffle([...opts]).forEach(x => {
          const b = document.createElement('button');
          b.className = 'numbtn'; b.textContent = x;
          b.onclick = async () => {
            if (x === n) {
              b.classList.add('right'); $$('.numbtn', answers).forEach(z => z.disabled = true);
              if (!(await celebrate(`Yes! ${NUMBER_WORDS[n]} ${word}!`))) return;
              const nb = document.createElement('button');
              nb.className = 'btn big primary'; nb.textContent = 'Tiếp nào ➡️';
              nb.onclick = () => { Sfx.tap(); next(); };
              answers.innerHTML = ''; answers.appendChild(nb);
            } else {
              Sfx.oops(); b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 450);
              talk(`This is ${NUMBER_WORDS[x]}. Let's count again!`, 'Mình đếm lại nhé!');
            }
          };
          answers.appendChild(b);
        });
        answers.appendChild(micButton(r => {
          const m = norm(r.join(' ')).match(new RegExp(`\\b(${NUMBER_WORDS.slice(1).join('|')})\\b`));
          if (m && NUMBER_WORDS.indexOf(m[1]) === n) $$('.numbtn', answers).find(z => +z.textContent === n).click();
          else talk(`Count again! How many ${many}?`);
        }, 'Hoặc nói số'));
      };
      await talk(`Let's count the ${many}! Touch each one.`, 'Mình cùng đếm nào! Bé chạm vào từng cái nhé.');
    };
    next();
  }
};

/* ---------- Tô chữ & số: chọn ---------- */
SCREENS.traceMenu = {
  title: () => '✏️ Tập tô',
  render(p, pr) {
    let tab = pr.tab || 'abc';
    const draw = () => {
      const list = tab === 'abc' ? LETTERS.map(l => S.lowerCase ? l.toLowerCase() : l) : DIGITS;
      p.innerHTML = `<div class="row tabs">
          <button class="btn ${tab === 'abc' ? 'sel' : ''}" data-t="abc">🔤 Chữ cái</button>
          <button class="btn ${tab === '123' ? 'sel' : ''}" data-t="123">🔢 Chữ số</button>
          ${tab === 'abc' ? `<button class="btn" id="case">${S.lowerCase ? 'Aa → A' : 'A → a'}</button>` : ''}
        </div>
        <div class="glyphs">${list.map(g => `<button class="glyph ${S.traced[g] ? 'done' : ''}" data-g="${g}">${g}</button>`).join('')}</div>`;
      $$('[data-t]', p).forEach(b => b.onclick = () => { Sfx.tap(); tab = b.dataset.t; history.replaceState({ name: 'traceMenu', params: { tab } }, ''); draw(); });
      const cs = $('#case', p); if (cs) cs.onclick = () => { S.lowerCase = !S.lowerCase; save(); draw(); };
      $$('[data-g]', p).forEach(b => b.onclick = () => { Sfx.tap(); go('trace', { g: b.dataset.g, tab }); });
    };
    draw();
    talk('Pick a letter or a number!', 'Bé chọn một chữ hoặc một số để tô nhé!');
  }
};

function glyphInfo(g) {
  if (/\d/.test(g)) return { en: NUMBER_WORDS[+g], line: `${NUMBER_WORDS[+g]}!`, pic: '🔢' };
  const [w, pic] = LETTER_WORDS[g.toUpperCase()];
  return { en: g.toUpperCase(), line: `${g.toUpperCase()}! ${g.toUpperCase()} is for ${w}!`, pic };
}

/* ---------- Tô chữ & số: bảng tô ---------- */
SCREENS.trace = {
  title: pr => `✏️ Tô ${pr.g}`,
  render(p, pr) {
    const g = pr.g, info = glyphInfo(g);
    const list = /\d/.test(g) ? DIGITS : LETTERS.map(l => S.lowerCase ? l.toLowerCase() : l);
    p.innerHTML = `<div class="tracebox" id="tb"><canvas id="guide"></canvas><canvas id="ink"></canvas><div class="hint">${info.pic}</div></div>
      <div class="row">
        <button class="btn" id="hear">🔊 Nghe</button>
        <button class="btn warn" id="clear">🧽 Xóa</button>
        <button class="btn big primary" id="check">✔ Xong</button>
        <button class="btn" id="next">➡️ Chữ tiếp</button>
      </div>`;
    const tb = $('#tb', p), gc = $('#guide', p), ic = $('#ink', p);
    let W, H, dpr, fontPx, strokes = [], cur = null;
    const colors = ['#ff7eb6', '#4fc3f7', '#66bb6a', '#ffa94d', '#b388ff'];

    const setup = () => {
      dpr = window.devicePixelRatio || 1;
      W = tb.clientWidth; H = tb.clientHeight;
      [gc, ic].forEach(c => { c.width = W * dpr; c.height = H * dpr; c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0); });
      fontPx = Math.min(H * 0.85, W * 0.7);
      const x = gc.getContext('2d');
      x.clearRect(0, 0, W, H);
      // đường kẻ ô ly
      x.strokeStyle = '#e8eefc'; x.lineWidth = 3;
      [0.2, 0.5, 0.8].forEach(f => { x.beginPath(); x.moveTo(20, H * f); x.lineTo(W - 20, H * f); x.stroke(); });
      glyphPath(x, '#f1ecff', true);
      x.setLineDash([10, 12]); x.lineWidth = 4; x.strokeStyle = '#b9aee0';
      glyphPath(x, null, false); x.setLineDash([]);
      redraw();
    };
    const glyphPath = (x, fillColor, doFill) => {
      x.font = `800 ${fontPx}px "Baloo 2", sans-serif`;
      x.textAlign = 'center'; x.textBaseline = 'middle';
      const yy = H / 2 + fontPx * 0.06;
      if (doFill) { x.fillStyle = fillColor; x.fillText(g, W / 2, yy); }
      else x.strokeText(g, W / 2, yy);
    };
    const brush = () => Math.max(14, fontPx * 0.075);
    const redraw = () => {
      const x = ic.getContext('2d'); x.clearRect(0, 0, W, H);
      x.lineCap = 'round'; x.lineJoin = 'round';
      strokes.forEach(s => {
        x.strokeStyle = s.c; x.lineWidth = brush(); x.beginPath();
        s.pts.forEach((pt, k) => k ? x.lineTo(pt[0], pt[1]) : x.moveTo(pt[0], pt[1]));
        if (s.pts.length === 1) x.lineTo(s.pts[0][0] + 0.1, s.pts[0][1]);
        x.stroke();
      });
    };
    const pos = e => { const r = ic.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    ic.onpointerdown = e => { ic.setPointerCapture(e.pointerId); cur = { c: colors[strokes.length % colors.length], pts: [pos(e)] }; strokes.push(cur); redraw(); };
    ic.onpointermove = e => { if (!cur) return; cur.pts.push(pos(e)); redraw(); };
    ic.onpointerup = ic.onpointercancel = () => { cur = null; };

    /* Chấm điểm: phần chữ được phủ / nét vẽ lệch ra ngoài */
    const score = () => {
      const w = Math.round(W / 3), h = Math.round(H / 3);
      const mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.scale(1 / 3, 1 / 3); return x; };
      const tg = mk(); glyphPath(tg, '#000', true);
      const near = mk(); near.font = `800 ${fontPx}px "Baloo 2", sans-serif`; near.textAlign = 'center'; near.textBaseline = 'middle';
      near.lineWidth = fontPx * 0.12; near.strokeStyle = '#000'; near.fillStyle = '#000';
      near.fillText(g, W / 2, H / 2 + fontPx * 0.06); near.strokeText(g, W / 2, H / 2 + fontPx * 0.06);
      const fat = mk(), thin = mk();
      [[fat, fontPx * 0.2], [thin, brush()]].forEach(([x, lw]) => {
        x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = lw; x.strokeStyle = '#000';
        strokes.forEach(s => { x.beginPath(); s.pts.forEach((pt, k) => k ? x.lineTo(pt[0], pt[1]) : x.moveTo(pt[0], pt[1])); x.stroke(); });
      });
      const A = tg.getImageData(0, 0, w, h).data, N = near.getImageData(0, 0, w, h).data,
        F = fat.getImageData(0, 0, w, h).data, T = thin.getImageData(0, 0, w, h).data;
      let tgt = 0, cov = 0, ink = 0, out = 0;
      for (let k = 3; k < A.length; k += 4) {
        if (A[k] > 128) { tgt++; if (F[k] > 128) cov++; }
        if (T[k] > 128) { ink++; if (N[k] < 128) out++; }
      }
      return { cover: tgt ? cov / tgt : 0, outside: ink ? out / ink : 1 };
    };

    $('#clear', p).onclick = () => { Sfx.tap(); strokes = []; redraw(); };
    $('#hear', p).onclick = () => talk(info.line);
    $('#next', p).onclick = () => {
      const k = list.indexOf(g);
      Sfx.tap(); history.replaceState({ name: 'trace', params: { g: list[(k + 1) % list.length], tab: pr.tab } }, '');
      go('trace', { g: list[(k + 1) % list.length], tab: pr.tab }, false);
    };
    $('#check', p).onclick = async () => {
      if (!strokes.length) { talk('Draw with your finger!', 'Bé dùng ngón tay tô theo nét chấm nhé!'); return; }
      const r = score();
      if (r.cover >= 0.6 && r.outside <= 0.4) {
        S.traced[g] = true; save();
        await celebrate(info.line);
      } else if (r.cover < 0.6) {
        Sfx.oops(); Stage.mood('think', 1200);
        talk('Almost! Color more of the letter.', 'Gần được rồi! Bé tô kín thêm nữa nhé.');
      } else {
        Sfx.oops(); Stage.mood('think', 1200);
        talk('Oops! Stay on the dotted line.', 'Bé tô theo nét chấm, đừng ra ngoài nhé.');
      }
    };
    const ro = new ResizeObserver(() => setup());
    ro.observe(tb);
    (document.fonts ? document.fonts.load(`800 40px "Baloo 2"`) : Promise.resolve()).then(setup);
    talk(`Let's write ${/\d/.test(g) ? 'number ' + NUMBER_WORDS[+g] : g.toUpperCase()}!`, 'Bé dùng ngón tay tô theo nét chấm nhé!');
  }
};

/* ---------- Tìm chữ & số ---------- */
SCREENS.findMenu = {
  title: () => '🔍 Tìm chữ & số',
  render(p) {
    const modes = [['abc', '🔤', 'Chữ cái', 'Letters'], ['123', '🔢', 'Chữ số', 'Numbers'], ['mix', '🎲', 'Cả hai', 'Mix']];
    p.innerHTML = `<div class="tiles">${modes.map((m, i) =>
      `<button class="tile ${TILE_COLORS[i + 1]}" data-m="${m[0]}"><span class="ico">${m[1]}</span>${m[2]}<small>${m[3]}</small></button>`).join('')}</div>`;
    $$('[data-m]', p).forEach(b => b.onclick = () => { Sfx.tap(); go('find', { m: b.dataset.m }); });
    talk('Can you find it? Pick a game!', 'Bé chọn trò chơi tìm chữ nhé!');
  }
};

SCREENS.find = {
  title: () => '🔍 Tìm nào!',
  render(p, pr) {
    const pool = pr.m === 'abc' ? LETTERS : pr.m === '123' ? DIGITS : LETTERS.concat(DIGITS);
    const ROUNDS = 8;
    let r = 0, prev = '';
    const next = async () => {
      const token = Run.id;
      if (r >= ROUNDS) {
        p.innerHTML = `<div class="center"><div class="picture">🏆</div><div class="row">
          <button class="btn big primary" id="again">🔁 Chơi lại</button><button class="btn big" id="home">🏠 Về nhà</button></div></div>`;
        $('#again', p).onclick = () => go('find', pr, false);
        $('#home', p).onclick = () => history.back();
        Sfx.cheer(); confetti(80); addStar(3); Stage.mood('cheer', 2000);
        talk('You found them all! Hooray!', 'Bé tìm được hết rồi! Hoan hô!');
        return;
      }
      r++;
      let target; do { target = pick(pool); } while (target === prev); prev = target;
      const isNum = /\d/.test(target);
      const opts = new Set([target]);
      while (opts.size < 3) opts.add(pick(pool));
      const show = c => (!/\d/.test(c) && S.lowerCase) ? c.toLowerCase() : c;
      p.innerHTML = `<div class="progress">${Array.from({ length: ROUNDS }, (_, k) => `<i class="${k < r - 1 ? 'done' : k === r - 1 ? 'now' : ''}"></i>`).join('')}</div>
        <div class="cards">${shuffle([...opts]).map((c, i) => `<button class="card ${TILE_COLORS[(i * 2 + r) % 6]}" data-c="${c}">${show(c)}</button>`).join('')}</div>
        <div class="row"><button class="btn" id="again">🔊 Nghe lại</button></div>`;
      const say = isNum ? `Where is number ${NUMBER_WORDS[+target]}?` : `Where is the letter ${target}?`;
      const sayVi = isNum ? `Số ${target} ở đâu?` : `Chữ ${target} ở đâu?`;
      $('#again', p).onclick = () => talk(say, sayVi);
      let locked = false;
      $$('.card', p).forEach(b => b.onclick = async () => {
        if (locked) return;
        const c = b.dataset.c;
        if (c === target) {
          locked = true; b.classList.add('right');
          const extra = isNum ? `${NUMBER_WORDS[+c]}!` : `${c}! ${c} is for ${LETTER_WORDS[c][0]}! ${LETTER_WORDS[c][1]}`;
          if (!(await celebrate(`Yes! ${extra}`))) return;
          await wait(300); if (token === Run.id) next();
        } else {
          Sfx.oops(); b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 450);
          const nm = /\d/.test(c) ? NUMBER_WORDS[+c] : c;
          talk(`This is ${nm}. ${say}`, sayVi, { noVi: true });
        }
      });
      await talk(say, sayVi);
    };
    next();
  }
};

/* ---------- Cổng phụ huynh (phép tính) ---------- */
SCREENS.gate = {
  title: () => 'Dành cho bố mẹ', full: true,
  render(p) {
    const a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7);
    let typed = '';
    p.innerHTML = `<div class="center">
      <div style="font-size:20px">Trả lời phép tính để vào cài đặt</div>
      <div class="gate">${a} + ${b} = <span id="ans">?</span></div>
      <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => `<button data-n="${n}">${n}</button>`).join('')}</div>
      <button class="btn" id="del">⌫ Xóa</button></div>`;
    const upd = () => {
      $('#ans', p).textContent = typed || '?';
      if (typed.length >= String(a + b).length) {
        if (+typed === a + b) { history.replaceState({ name: 'settings', params: {} }, ''); go('settings', {}, false); }
        else { Sfx.oops(); typed = ''; setTimeout(upd, 300); }
      }
    };
    $$('[data-n]', p).forEach(x => x.onclick = () => { Sfx.tap(); typed += x.dataset.n; upd(); });
    $('#del', p).onclick = () => { typed = typed.slice(0, -1); upd(); };
  }
};

/* ---------- Cài đặt ---------- */
SCREENS.settings = {
  title: () => '⚙️ Cài đặt', full: true,
  render(p) {
    const today = new Date().toISOString().slice(0, 10);
    const used = S.aiUsed.date === today ? S.aiUsed.n : 0;
    p.innerHTML = `<div class="form">
      <h3>👶 Về bé</h3>
      <label>Tên bé (tiếng Anh) <input type="text" id="childName" value="${esc(S.childName)}" placeholder="VD: Bin, Na, Su"></label>
      <label>Tuổi của bé <select id="childAge">${[3, 4, 5, 6].map(n => `<option ${n == S.childAge ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <h3>🔊 Giọng nói</h3>
      <label>Tốc độ đọc <select id="rate">
        <option value="0.7" ${S.rate == 0.7 ? 'selected' : ''}>Rất chậm</option>
        <option value="0.85" ${S.rate == 0.85 ? 'selected' : ''}>Chậm (khuyên dùng)</option>
        <option value="1" ${S.rate == 1 ? 'selected' : ''}>Bình thường</option></select></label>
      <label>Hiện gợi ý tiếng Việt <input type="checkbox" id="viHint" ${S.viHint ? 'checked' : ''}></label>
      <label>Đọc gợi ý tiếng Việt <input type="checkbox" id="viVoice" ${S.viVoice ? 'checked' : ''}></label>
      <div class="help">Giọng tiếng Việt: ${Voice.viOK ? '✅ có trên máy' : '⚠️ chưa có — vào Cài đặt Android › Chuyển văn bản thành giọng nói › tải gói tiếng Việt'}.
      Nhận dạng giọng nói: ${Ears.available ? '✅ sẵn sàng' : '⚠️ chưa có — cần ứng dụng Google trên máy'}.</div>
      <h3>🔢 Học đếm & chữ</h3>
      <label>Đếm tối đa đến <select id="maxCount">${[5, 10, 15, 20].map(n => `<option ${n == S.maxCount ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <label>Dùng chữ thường (a b c) <input type="checkbox" id="lowerCase" ${S.lowerCase ? 'checked' : ''}></label>
      <h3>✨ Trò chuyện tự do (AI)</h3>
      <label>Hiện ô Trò chuyện tự do <input type="checkbox" id="aiOn" ${S.aiOn ? 'checked' : ''}></label>
      <label>Claude API key <input type="password" id="apiKey" value="${esc(S.apiKey)}" placeholder="sk-ant-..."></label>
      <label>Model <input type="text" id="model" value="${esc(S.model)}"></label>
      <label>Giới hạn lượt / ngày <input type="number" id="aiDaily" min="5" max="200" value="${S.aiDaily}"></label>
      <div class="help">Hôm nay đã dùng ${used}/${S.aiDaily} lượt. Lấy API key tại console.anthropic.com (trả phí theo lượt dùng, mỗi lượt rất nhỏ).
      Key chỉ lưu trên máy này. Chế độ AI cần Internet; các phần còn lại dùng được không cần mạng.</div>
      <h3>⭐ Tiến độ</h3>
      <div class="row" style="justify-content:flex-start">Bé có <b>&nbsp;${S.stars}&nbsp;</b> sao · đã tô <b>&nbsp;${Object.keys(S.traced).length}&nbsp;</b> chữ/số
        <button class="btn warn" id="reset">Đặt lại tiến độ</button></div>
    </div>
    <div class="row"><button class="btn big primary" id="saveBtn">💾 Lưu</button></div>`;
    $('#reset', p).onclick = e => {
      const b = e.currentTarget;
      if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = 'Bấm lần nữa để xóa'; return; }
      S.stars = 0; S.traced = {}; save(); $('#stars span').textContent = 0; go('settings', {}, false);
    };
    $('#saveBtn', p).onclick = () => {
      S.childName = $('#childName', p).value.trim();
      S.childAge = +$('#childAge', p).value;
      S.rate = +$('#rate', p).value;
      S.viHint = $('#viHint', p).checked; S.viVoice = $('#viVoice', p).checked;
      S.maxCount = +$('#maxCount', p).value; S.lowerCase = $('#lowerCase', p).checked;
      S.aiOn = $('#aiOn', p).checked; S.apiKey = $('#apiKey', p).value.trim();
      S.model = $('#model', p).value.trim() || DEFAULTS.model;
      S.aiDaily = Math.max(1, +$('#aiDaily', p).value || 30);
      save(); Sfx.ding(); history.back();
    };
  }
};

/* ---------- Khởi động ---------- */
(async function start() {
  $('#stars span').textContent = S.stars;
  Stage.render();
  await Promise.all([Voice.init(), Ears.init()]);
  history.replaceState({ name: 'home', params: {} }, '');
  go('home', {}, false);
})();
