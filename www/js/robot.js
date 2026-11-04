/* ================== CHẾ ĐỘ ROBOT — "CÔ GIÁO NHỎ" ==================
   Robot nói tiếng Việt xen tiếng Anh, đặt câu hỏi cho bé trả lời (bằng tiếng Việt hoặc tiếng Anh),
   nói câu tiếng Anh và hướng dẫn bé đọc lại, sửa nhẹ nhàng khi bé nói chưa đúng.
   - Có API key → não AI (Claude Haiku); hết lượt/ngày hoặc lỗi mạng → tự chuyển sang não offline
   - Không có key → não offline miễn phí

   Một "lượt" robot nói:
   { parts: [['vi','…'], ['en','…']],   // các đoạn nói lần lượt, đúng giọng từng ngôn ngữ
     pic: '🐱',                          // hình minh họa (tùy chọn)
     expect: 'en' | 'vi',                // bé trả lời bằng tiếng gì → micro nghe tiếng đó
     check(text) → lượt tiếp theo | null // offline: chấm câu trả lời                         */

/* ---------- tiện ích chữ tiếng Việt ---------- */
const vnorm = s => ' ' + String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
const viCore = vi => vi.replace(/^(con|quả|cái|chiếc|bông|cây|đôi|bắp|chùm|ngôi|quyển|cơn|bàn|màu)\s+/i, '');
const hasWord = (text, w) => vnorm(text).includes(' ' + vnorm(w).trim() + ' ');

const TEACH = (() => {
  const COLORS = [['red', 'đỏ'], ['blue', 'xanh dương'], ['yellow', 'vàng'], ['green', 'xanh lá'], ['pink', 'hồng'],
    ['purple', 'tím'], ['orange', 'cam'], ['white', 'trắng'], ['black', 'đen'], ['brown', 'nâu']];
  const EXTRA_VI = [['rice', '🍚', 'cơm'], ['noodles', '🍜', 'mì'], ['bread', '🍞', 'bánh mì'], ['water', '💧', 'nước'],
    ['ice cream', '🍦', 'kem'], ['candy', '🍬', 'kẹo'], ['banana', '🍌', 'chuối'], ['orange', '🍊', 'cam'], ['chicken', '🍗', 'thịt gà'],
    ['meat', '🍖', 'thịt'], ['soup', '🍲', 'canh'], ['mom', '👩', 'mẹ'], ['dad', '👨', 'bố'], ['ba', '👨', 'ba'],
    ['grandma', '👵', 'bà'], ['grandpa', '👴', 'ông'], ['baby', '👶', 'em bé'], ['teddy bear', '🧸', 'gấu bông'], ['doll', '🪆', 'búp bê'],
    ['rabbit', '🐰', 'thỏ'], ['elephant', '🐘', 'voi'], ['monkey', '🐵', 'khỉ'], ['chicken', '🐔', 'gà']];
  const PHRASES = [['Good morning!', 'Chào buổi sáng'], ['Thank you!', 'Cảm ơn'], ['I love you!', 'Con yêu mẹ / Mình thương bạn'],
    ['How are you?', 'Bạn có khỏe không?'], ['I am happy!', 'Mình đang vui'], ["Let's play!", 'Mình cùng chơi nào'],
    ['See you later!', 'Hẹn gặp lại'], ['Good night!', 'Chúc ngủ ngon'], ['I like apples!', 'Mình thích táo'],
    ['Nice to meet you!', 'Rất vui được gặp bạn'], ['Excuse me!', 'Xin lỗi cho mình hỏi'], ['I am sorry!', 'Mình xin lỗi'],
    ['Happy birthday!', 'Chúc mừng sinh nhật'], ['Sit down, please!', 'Mời bạn ngồi xuống'], ['Stand up!', 'Đứng lên nào'],
    ['Open the door!', 'Mở cửa ra'], ['I can jump!', 'Mình nhảy được'], ['Look at me!', 'Nhìn mình nè']];
  const PRAISE_MIX = [[['vi', 'Giỏi quá!'], ['en', 'Great job!']], [['vi', 'Đúng rồi!'], ['en', 'Well done!']],
    [['vi', 'Hay lắm!'], ['en', 'Super!']], [['vi', 'Tuyệt vời!'], ['en', 'Amazing!']], [['vi', 'Bé giỏi ghê!'], ['en', 'Good job!']]];
  const praise = () => pick(PRAISE_MIX);
  const W = () => (typeof GAME_WORDS !== 'undefined' ? GAME_WORDS : []);
  const ALL = () => W().concat(EXTRA_VI);
  /* tìm từ tiếng Việt bé nói → từ tiếng Anh tương ứng */
  const findVi = text => {
    let best = null;
    for (const w of ALL()) { const core = viCore(w[2]); if (hasWord(text, core) && (!best || core.length > viCore(best[2]).length)) best = w; }
    return best;
  };
  const findEn = (text, list) => list.find(w => hasWord(text, w[0]) || hasWord(text, w[0] + 's'));
  const enOk = (text, target) => {                 // bé đọc lại câu tiếng Anh: đúng ≥ một nửa số từ là được
    const want = norm(target).trim().split(' ').filter(x => x.length > 1);
    const got = new Set(norm(text).trim().split(' '));
    const hit = want.filter(x => got.has(x) || [...got].some(g => g.length > 3 && lev(g, x) <= 1)).length;
    return want.length ? hit / want.length >= 0.5 : false;
  };
  const cap = s => s[0].toUpperCase() + s.slice(1);

  /* Bảo bé đọc lại một từ/câu tiếng Anh (dùng khi bé trả lời chưa đúng) */
  const repeatAfter = (en, lead, tries = 0) => ({
    parts: [['vi', lead || 'Bé nói theo mình nhé:'], ['en', en]], expect: 'en',
    check: t => enOk(t, en) || heard([t], [en.toLowerCase()])
      ? { parts: [...praise(), ['en', en]], done: true }
      : tries >= 1 ? { parts: [['vi', 'Không sao, bé giỏi lắm! Mình học tiếp nhé.']], done: true }
        : repeatAfter(en, 'Mình nói chậm nè, bé nói theo:', tries + 1)
  });

  const KINDS = {
    /* Việt → Anh: "Con mèo tiếng Anh là gì?" */
    viToEn() {
      const [en, pic, vi] = pick(W());
      return { pic, parts: [['vi', `${cap(vi)} tiếng Anh là gì nhỉ?`]], expect: 'en',
        check: t => findEn(t, [[en]]) ? { parts: [...praise(), ['en', `${cap(en)}!`]], done: true }
          : { ...repeatAfter(en, `${cap(vi)} là`), parts: [['vi', `${cap(vi)} tiếng Anh là`], ['en', en], ['vi', '. Bé nói theo mình nhé:'], ['en', en]] } };
    },
    /* Anh → Việt: "Chữ apple nghĩa là gì?" */
    enToVi() {
      const [en, pic, vi] = pick(W());
      return { pic, parts: [['vi', 'Mình hỏi nè, chữ'], ['en', en], ['vi', 'nghĩa là gì?']], expect: 'vi',
        check: t => hasWord(t, viCore(vi)) ? { parts: [['vi', `Đúng rồi! ${cap(en)} là ${vi}.`], ['en', 'Great job!']], done: true }
          : { ...repeatAfter(en), parts: [['en', en], ['vi', `nghĩa là ${vi} đó. Bé nói theo mình nhé:`], ['en', en]] } };
    },
    /* Nói câu tiếng Anh, bé đọc lại */
    repeat() {
      const [en, vi] = pick(PHRASES);
      const r = repeatAfter(en, 'Bé đọc theo mình nhé:');
      return { ...r, pic: '🗣️', check: t => { const x = r.check(t); if (x && x.done && enOk(t, en)) x.parts.push(['vi', `Câu này nghĩa là: ${vi}.`]); return x; } };
    },
    /* Hỏi tiếng Việt, bé trả lời tiếng Việt → dạy từ tiếng Anh cho câu trả lời */
    askVi() {
      const q = pick([['Hôm nay bé ăn gì?', '🍽️'], ['Bé thích con vật nào nhất?', '🐾'], ['Bé thích ăn quả gì?', '🍉'],
        ['Ở nhà bé có ai?', '🏠'], ['Bé thích đồ chơi gì?', '🧸']]);
      return { pic: q[1], parts: [['vi', q[0]]], expect: 'vi',
        check: t => {
          const w = findVi(t);
          if (!w) return { parts: [['vi', 'Hay quá! Mình học thêm một từ nhé.']], done: true };
          return { ...repeatAfter(w[0]), pic: w[1], parts: [['vi', `${cap(viCore(w[2]))} tiếng Anh là`], ['en', w[0]], ['vi', '. Bé nói theo mình nhé:'], ['en', w[0]]] };
        } };
    },
    /* Hỏi để bé trả lời bằng tiếng Anh */
    color() {
      return { pic: '🎨', parts: [['vi', 'Bé thích màu gì? Bé nói bằng tiếng Anh nhé, ví dụ'], ['en', 'red, blue, pink.']], expect: 'en',
        check: t => { const c = findEn(t, COLORS);
          return c ? { parts: [['en', `${cap(c[0])}!`], ['vi', `Màu ${c[1]}. Mình cũng thích màu này!`]], done: true }
            : repeatAfter('I like pink!', 'Bé thử nói thế này nhé:'); } };
    },
    name() {
      return { pic: '😊', parts: [['vi', 'Mình hỏi bằng tiếng Anh nè:'], ['en', "What's your name?"], ['vi', 'Bé trả lời:'], ['en', 'My name is'], ['vi', 'rồi nói tên bé nhé!']], expect: 'en',
        check: t => { const m = norm(t).match(/(?:my name is|name is|i am|i'm|im)\s+([a-z]+)/) || (S.childName ? null : norm(t).trim().match(/^([a-z]{2,})$/));
          if (m) { Run.name = cap(m[1]); if (!S.childName) { S.childName = Run.name; save(); } return { parts: [['en', `Nice to meet you, ${Run.name}!`], ['vi', 'Rất vui được làm quen với bé!']], done: true }; }
          return repeatAfter(`My name is ${S.childName || 'Bin'}.`, 'Bé nói theo mình nhé:'); } };
    },
    age() {
      return { pic: '🎂', parts: [['en', 'How old are you?'], ['vi', 'Bé trả lời, ví dụ:'], ['en', 'I am four.']], expect: 'en',
        check: t => { const m = norm(t).match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/);
          return m ? { parts: [['en', `${cap(m[1])}! You are so big!`], ['vi', 'Bé lớn quá rồi!']], done: true } : repeatAfter(`I am ${NUMBER_WORDS[S.childAge] || 'four'}.`); } };
    },
    feeling() {
      return { pic: '🙂', parts: [['en', 'How are you today?'], ['vi', 'Bé trả lời'], ['en', 'I am happy'], ['vi', 'hoặc'], ['en', 'I am fine'], ['vi', 'nhé!']], expect: 'en',
        check: t => /\b(happy|fine|good|great|ok|okay|sad|tired|sleepy|hungry)\b/.test(norm(t))
          ? (/\b(sad|tired|sleepy|hungry)\b/.test(norm(t))
            ? { parts: [['vi', 'Ôi, mình ôm bé một cái nhé!'], ['en', 'Big hug!']], done: true }
            : { parts: [['en', 'Yay! I am happy too!'], ['vi', 'Mình cũng vui lắm!']], done: true })
          : repeatAfter('I am happy!') };
    },
    count() {
      const n = S.childAge <= 3 ? 3 : 5;
      const seq = NUMBER_WORDS.slice(1, n + 1).map(cap).join(', ') + '!';
      return { pic: '🔢', parts: [['vi', `Mình cùng đếm bằng tiếng Anh nhé! Bé đếm từ 1 đến ${n}:`], ['en', seq], ['vi', 'Đến lượt bé!']], expect: 'en',
        check: t => NUMBER_WORDS.slice(1, n + 1).filter(w => norm(t).includes(w)).length >= Math.min(3, n)
          ? { parts: [...praise(), ['vi', 'Bé đếm hay quá!']], done: true } : repeatAfter(seq, 'Bé đếm theo mình nhé:') };
    },
    /* Bé chỉ cần làm động tác (không cần nói) */
    action() {
      const a = pick([['Touch your nose!', 'chạm vào mũi', '👃', 'nose'], ['Clap your hands!', 'vỗ tay', '👏', 'clap'],
        ['Jump!', 'nhảy lên', '🦘', 'jump'], ['Touch your head!', 'chạm vào đầu', '🙆', 'head'], ['Wave your hand!', 'vẫy tay', '👋', 'wave']]);
      return { pic: a[2], parts: [['vi', 'Bé làm theo mình nhé:'], ['en', a[0]], ['vi', `nghĩa là ${a[1]}. Xong rồi bé nói`], ['en', 'Done!']], expect: 'en',
        check: t => ({ parts: [...praise(), ['vi', `${cap(a[3])} — bé nhớ chữ này nhé!`], ['en', a[3]]], done: true }) };
    }
  };
  const ORDER = ['viToEn', 'repeat', 'color', 'enToVi', 'askVi', 'feeling', 'viToEn', 'action', 'count', 'repeat', 'age', 'askVi', 'name', 'enToVi'];
  let i = 0;
  return {
    start() {
      const nm = Run.name || S.childName;
      i = Math.floor(Math.random() * ORDER.length);
      return { parts: [['en', `Hello${nm ? ' ' + nm : ''}!`], ['vi', `Mình là ${char().name}. Hôm nay mình cùng học tiếng Anh nhé!`]], next: true };
    },
    next() {
      let k = ORDER[i++ % ORDER.length];
      if (k === 'name' && S.childName && Math.random() < .7) k = 'viToEn';
      return KINDS[k]();
    },
    praise
  };
})();

/* ---------- Não AI ---------- */
function robotSystem() {
  const c = char();
  return `You are ${c.name}, a friendly cartoon ${c.species} robot who teaches English to a ${S.childAge}-year-old Vietnamese child${S.childName ? ' named ' + S.childName : ''}. The child understands Vietnamese and is a beginner in English.
How you teach (rotate between these, one per turn):
1. Ask in Vietnamese how to say something in English ("Con mèo tiếng Anh là gì nhỉ?") — expect an English answer.
2. Say an English word and ask what it means in Vietnamese — expect a Vietnamese answer.
3. Say a short English phrase and ask the child to repeat it ("Bé đọc theo mình nhé: Good morning!") — expect English.
4. Ask a simple question in English and tell the child exactly how to answer ("What's your name? Bé trả lời: My name is…") — expect English.
5. Ask an everyday question in Vietnamese ("Hôm nay bé ăn gì?"), then teach the English word for their answer and ask them to say it.
Rules:
- Speak mostly simple Vietnamese, with 1–2 short English words or phrases woven in. At most 2 short sentences per turn.
- When the child answers: if right, praise briefly mixing both languages ("Giỏi quá! Great job!") and move to a new activity; if wrong or unclear, kindly give the right answer and ask them to repeat it once, then move on.
- The child's words come from speech recognition and may be garbled; English words heard by a Vietnamese recognizer may look odd. Guess kindly.
- Strictly child-safe: no violence, scary things, romance, brands or adult topics. Never ask for address, school, phone, photos; never suggest secrets or going anywhere.
Output ONLY JSON: {"parts":[{"lang":"vi","text":"..."},{"lang":"en","text":"..."}],"expect":"en" or "vi","pic":"<one emoji>"}
Put every English word or phrase in its own part with "lang":"en" so it is read with an English voice.`;
}
async function robotAI(history) {
  let text = '';
  if (S.apiKey) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': S.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: S.model, max_tokens: 300, system: robotSystem(), messages: history })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data.error && data.error.message) || ('HTTP ' + res.status));
    text = ((data.content || []).find(b => b.type === 'text') || {}).text || '';
  } else if (window.claude) {
    const sample = await window.claude.use('sample');
    if (!sample) throw new Error('no sample');
    const log = history.map(m => (m.role === 'user' ? 'Child: ' : 'You: ') + m.content).join('\n');
    text = (await sample(`${robotSystem()}\n\nConversation so far:\n${log}\n\nWrite your next turn as JSON only.`, { modelTier: 'quick', cache: false })).text;
  } else throw new Error('no AI');
  const m = text.match(/\{[\s\S]*\}/);
  const j = JSON.parse(m ? m[0] : text);
  const parts = (j.parts || []).filter(x => x && x.text).map(x => [x.lang === 'en' ? 'en' : 'vi', String(x.text)]);
  if (!parts.length) throw new Error('empty');
  return { parts, expect: j.expect === 'vi' ? 'vi' : 'en', pic: j.pic || '', raw: JSON.stringify(j) };
}

/* Giữ màn hình luôn sáng khi ở chế độ robot */
const Awake = {
  lock: null,
  async on() { try { if (navigator.wakeLock) this.lock = await navigator.wakeLock.request('screen'); } catch (e) {} },
  off() { try { this.lock && this.lock.release(); } catch (e) {} this.lock = null; }
};
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && current === 'robot') Awake.on(); });

SCREENS.robot = {
  title: () => '🤖 Robot',
  render(p) {
    $('#main').classList.add('robotmode');
    Awake.on();
    const useAI = () => S.aiOn && (S.apiKey || window.claude) && S.aiUsed.n < S.aiDaily;
    const today = new Date().toISOString().slice(0, 10);
    if (S.aiUsed.date !== today) { S.aiUsed = { date: today, n: 0 }; save(); }
    Run.name = S.childName;
    const hist = [];
    let auto = true, asleep = false, busy = false, quiet = 0, turn = null;

    p.innerHTML = `
      <div class="robotbar">
        <button class="mic" id="rmic">🎤</button>
        <div class="rinfo">
          <div class="mic-label" id="rstate">Chạm vào ${esc(char().vi)} để nói chuyện</div>
          <div class="heard" id="rheard"></div>
        </div>
        <label class="rauto"><input type="checkbox" id="rauto" checked> Tự nghe</label>
      </div>
      <div class="note rnote" id="rnote">${useAI() ? '✨ Đang dùng AI' : '🧠 Não offline (miễn phí)'}</div>`;
    const micB = $('#rmic', p), stateEl = $('#rstate', p), heardEl = $('#rheard', p);
    if (!Native.isNative && (!Ears.available || Ears.blocked)) {
      const tb = micButton(r => handle(r), 'Gõ thay giọng nói');
      $('.mic', tb) && $('.mic', tb).remove();
      p.appendChild(tb);
    }
    $('#rauto', p).onchange = e => { auto = e.target.checked; };
    const idleLabel = () => turn && turn.expect === 'vi' ? '🇻🇳 Bé trả lời bằng tiếng Việt' : '🇬🇧 Bé trả lời bằng tiếng Anh';
    const setState = s => { stateEl.textContent = s; };

    /* Bong bóng thoại: chữ tiếng Anh tô đậm màu; đọc lần lượt từng đoạn đúng giọng */
    async function say(t) {
      const token = Run.id;
      const b = $('#bubble');
      $('.en', b).innerHTML = (t.pic ? `<span class="rpic">${t.pic}</span> ` : '') +
        t.parts.map(([l, x]) => l === 'en' ? `<b class="enw">${esc(x)}</b>` : esc(x)).join(' ');
      $('.vi', b).textContent = ''; b.classList.remove('empty');
      t.parts.forEach(([l, x]) => l === 'vi' && FPT.prefetch(x));
      Stage.talking(true);
      for (let k = 0; k < t.parts.length; k++) {
        const [l, x] = t.parts[k];
        if (token !== Run.id) return false;
        if (l === 'en') await Voice.speak(x, 'en-US', char().pitch, S.rate * char().rate);
        else await Voice.speak(x, 'vi-VN', 1.1, 1.0);
        if (k < t.parts.length - 1) await Voice.idle(120);
      }
      Stage.talking(false);
      return token === Run.id;
    }

    async function nextTurn(answer) {
      // answer: câu bé vừa nói (hoặc null nếu bắt đầu lượt mới)
      if (useAI()) {
        try {
          Stage.mood('think');
          hist.push({ role: 'user', content: answer == null ? '(Bắt đầu hoạt động mới)' : `Bé trả lời (${turn && turn.expect === 'vi' ? 'tiếng Việt' : 'tiếng Anh'}): "${answer}"` });
          const t = await robotAI(hist.slice(-14));
          S.aiUsed.n++; save();
          hist.push({ role: 'assistant', content: t.raw });
          return t;
        } catch (e) { hist.pop(); $('#rnote', p).textContent = '🧠 Não offline (AI đang lỗi hoặc hết lượt)'; }
        finally { Stage.mood(null); }
      }
      // offline
      if (answer != null && turn && turn.check) {
        const r = turn.check(answer);
        if (r) return r;
      }
      return TEACH.next();
    }

    async function run(t) {
      const token = Run.id;
      turn = t;
      if (/^(bye|goodbye)/i.test((t.parts[0] || [])[1] || '')) Stage.mood('cheer', 1200);
      if (!(await say(t)) || token !== Run.id) return;
      if (t.done || t.next) {                       // khen xong → sang hoạt động mới
        Stage.mood('cheer', 900);
        await wait(500);
        if (token !== Run.id) return;
        return run(useAI() ? await nextTurn(null) : TEACH.next());
      }
      setState(idleLabel());
      loop();
    }

    async function handle(matches) {
      const token = Run.id;
      const text = (matches && matches[0]) || '';
      heardEl.textContent = text ? `Bé nói: “${text}”` : '';
      if (!text) {
        quiet++;
        if (quiet >= 2) return sleep();
        const again = turn && turn.expect === 'vi' ? 'Bé trả lời đi nào!' : 'Bé nói to lên nhé!';
        if (await say({ parts: [['vi', `Mình chưa nghe rõ. ${again}`]] }) && token === Run.id) loop();
        return;
      }
      quiet = 0;
      if (/\b(bye|goodbye|tam biet)\b/.test(vnorm(text))) {
        await say({ parts: [['en', `Bye bye${Run.name ? ' ' + Run.name : ''}!`], ['vi', 'Tạm biệt bé, hẹn gặp lại nhé!']] });
        return sleep(true);
      }
      const t = await nextTurn(text);
      if (token !== Run.id) return;
      run(t);
    }

    async function listen() {
      if (busy || asleep) return;
      const token = Run.id;
      if (!Ears.available || Ears.blocked) { setState(idleLabel() + ' — gõ bên dưới'); return; }
      busy = true;
      const lang = turn && turn.expect === 'vi' ? 'vi-VN' : 'en-US';
      micB.classList.add('on'); Stage.mood('listen'); setState(lang === 'vi-VN' ? '🇻🇳 Mình đang nghe (tiếng Việt)...' : '🇬🇧 Mình đang nghe (tiếng Anh)...');
      const res = await Ears.listen(lang, 8000);
      micB.classList.remove('on'); Stage.mood(null); busy = false;
      if (token !== Run.id) return;
      setState(idleLabel());
      handle(res);
    }
    const loop = () => { if (auto && !asleep) setTimeout(listen, 350); };

    async function sleep(silent) {
      asleep = true; Stage.mood('sad');
      $('#charEl') && $('#charEl').classList.add('sleeping');
      setState('💤 Đang ngủ — chạm để đánh thức');
      if (!silent) await say({ parts: [['vi', 'Mình đi ngủ đây. Bé chạm vào mình để gọi mình dậy nhé!'], ['en', 'Good night!']] });
    }
    async function wake() {
      Sfx.pop();
      if (asleep) {
        asleep = false; quiet = 0; Stage.mood('cheer', 900);
        $('#charEl') && $('#charEl').classList.remove('sleeping');
        return run(TEACH.start());
      }
      if (micB.classList.contains('on')) { Ears.stop(); return; }
      Voice.stop(); listen();
    }
    micB.onclick = wake;
    $('#charbox').onclick = wake;

    run(TEACH.start());
  }
};
