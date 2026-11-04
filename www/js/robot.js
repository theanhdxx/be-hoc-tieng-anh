/* ================== CHẾ ĐỘ ROBOT ==================
   Đặt điện thoại/tablet cũ vào thân robot: nhân vật hiện to, bé chỉ việc nói.
   - Có API key  → trò chuyện bằng AI (Claude Haiku), hết lượt/ngày thì tự chuyển sang não offline
   - Không có key → "não offline" miễn phí, không cần mạng cho phần trả lời                         */

const BRAIN = (() => {
  const COLORS = ['red', 'blue', 'yellow', 'green', 'orange', 'pink', 'purple', 'white', 'black', 'brown'];
  const ANIMALS = { cat: 'Meow, meow!', dog: 'Woof, woof!', cow: 'Moo, moo!', duck: 'Quack, quack!', pig: 'Oink, oink!',
    lion: 'Roar!', bird: 'Tweet, tweet!', monkey: 'Ooh ooh, ah ah!', fish: 'Blub, blub!', elephant: 'Pawoo!',
    tiger: 'Grr!', horse: 'Neigh!', goat: 'Maa!', mouse: 'Squeak, squeak!', chicken: 'Cluck, cluck!',
    turtle: 'Slow and steady!', rabbit: 'Hop, hop!', unicorn: 'Sparkle, sparkle!', puppy: 'Woof!' };
  const FOODS = ['apple', 'banana', 'orange', 'mango', 'grapes', 'watermelon', 'strawberry', 'cake', 'milk', 'chicken',
    'chips', 'fish', 'noodles', 'nuts', 'rice', 'ice cream', 'candy', 'bread', 'egg', 'lemon', 'juice', 'pizza'];
  const QUESTIONS = [
    ['What color do you like?', 'Bé thích màu gì?'],
    ['Do you like cats or dogs?', 'Bé thích mèo hay chó?'],
    ['What food do you like?', 'Bé thích ăn gì?'],
    ['How old are you?', 'Bé mấy tuổi?'],
    ['Can you count to five?', 'Bé đếm đến 5 được không?'],
    ['What animal do you like?', 'Bé thích con vật nào?'],
    ['How are you today?', 'Hôm nay bé thế nào?'],
    ['Can you say hello?', 'Bé nói hello được không?'],
    ['What is your name?', 'Bé tên là gì?'],
    ['Do you like apples?', 'Bé có thích táo không?']
  ];
  let qi = 0, lastQ = null, misses = 0;
  const ask = () => { const q = QUESTIONS[qi++ % QUESTIONS.length]; lastQ = q; return q; };
  const cap = w => w[0].toUpperCase() + w.slice(1);
  const has = (t, w) => new RegExp(`\\b${w}s?\\b`).test(t);
  const NOT_NAMES = new Set(['fine', 'good', 'happy', 'sad', 'ok', 'okay', 'great', 'tired', 'sleepy', 'hungry', 'a', 'the', 'here', 'not',
    ...NUMBER_WORDS, ...COLORS]);

  function reply(raw) {
    const t = norm(raw).trim();
    const name = Run.name || S.childName;
    const nameBit = name ? `, ${name}` : '';
    if (!t) { misses++; return null; }
    misses = 0;
    const out = (say, vi) => ({ say, vi });
    const withQ = (say, vi) => { const q = ask(); return out(`${say} ${q[0]}`, `${vi} ${q[1]}`); };

    if (/\b(bye|goodbye|good night|see you)\b/.test(t)) return out(`Bye bye${nameBit}! See you soon!`, 'Tạm biệt! Hẹn gặp lại!');
    if (/\b(thank|thanks)\b/.test(t)) return withQ("You're welcome!", 'Không có gì!');
    if (/what('s| is) your name|who are you/.test(t)) return withQ(`I am ${char().name}!`, `Mình là ${char().name}!`);
    if (/how old are you/.test(t)) return withQ('I am five robot years old!', 'Mình 5 tuổi robot!');
    if (/how are you/.test(t)) return out('I am happy! How are you?', 'Mình vui lắm! Bé thế nào?');
    const nm = t.match(/(?:my name is|name is|i am|i'm|im|call me)\s+([a-z]+)/);
    if (nm && !NOT_NAMES.has(nm[1])) {
      Run.name = cap(nm[1]); if (!S.childName) { S.childName = Run.name; save(); }
      return withQ(`Nice to meet you, ${Run.name}!`, `Rất vui được gặp ${Run.name}!`);
    }
    if (/\b(sing|song)\b/.test(t)) return out('La la la! One, two, three, clap with me! La la la!', 'La la la! Một, hai, ba, vỗ tay nào!');
    if (/\b(count|counting)\b/.test(t)) return out("Let's count! One, two, three, four, five! Now you!", 'Mình cùng đếm! Đến lượt bé!');
    if (/\b(hello|hi|hey|hallo)\b/.test(t)) return withQ(`Hello${nameBit}!`, 'Xin chào!');
    if (/\b(fine|good|great|happy|ok|okay|super)\b/.test(t)) return withQ('Yay! I am happy too!', 'Tuyệt! Mình cũng vui!');
    if (/\b(sad|tired|sleepy|hungry|angry|scared)\b/.test(t)) return out('Oh no! Here is a big hug for you! Hug!', 'Ôi! Mình ôm bé một cái nhé!');
    for (const a of Object.keys(ANIMALS)) if (has(t, a)) return withQ(`A ${a}! ${ANIMALS[a]}`, `Con ${a}!`);
    for (const c of COLORS) if (has(t, c)) return withQ(`${cap(c)}! I like ${c} too!`, `Màu ${c}! Mình cũng thích!`);
    for (const f of FOODS) if (has(t, f)) return withQ(`${cap(f)}! Yummy, yummy!`, `${cap(f)}! Ngon quá!`);
    const n = t.match(new RegExp(`\\b(${NUMBER_WORDS.slice(1).join('|')})\\b`));
    if (n) {
      const k = NUMBER_WORDS.indexOf(n[1]);
      if ((lastQ && /old/.test(lastQ[0])) || /\b(i am|i'm|im|years?)\b/.test(t)) return withQ(`${cap(n[1])}! You are so big!`, `${k} tuổi! Bé lớn quá!`);
      if (k < 20) return out(`${cap(n[1])}! What comes next? ${cap(NUMBER_WORDS[k + 1])}!`, `Số ${k}! Tiếp theo là ${k + 1}!`);
    }
    if (/\b(yes|yeah|yep)\b/.test(t)) return withQ('Great!', 'Tuyệt!');
    if (/\b(no|nope)\b/.test(t)) return withQ('Okay!', 'Được rồi!');
    // Không hiểu: khen bé đã nói, rồi hỏi câu mới
    return withQ(pick(['Wow, good talking!', 'I like that!', 'Cool!', 'Good try!']), 'Bé nói giỏi lắm!');
  }
  const start = () => { qi = Math.floor(Math.random() * QUESTIONS.length); misses = 0; const q = ask();
    return { say: `Hi${(Run.name || S.childName) ? ' ' + (Run.name || S.childName) : ''}! I am ${char().name}. ${q[0]}`, vi: `Chào bé! ${q[1]}` }; };
  return { reply, start, misses: () => misses };
})();

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
    let auto = true, asleep = false, busy = false, quiet = 0;

    p.innerHTML = `
      <div class="robotbar">
        <button class="mic" id="rmic">🎤</button>
        <div class="rinfo">
          <div class="mic-label" id="rstate">Chạm vào ${esc(char().vi)} để nói chuyện</div>
          <div class="heard" id="rheard"></div>
        </div>
        <label class="rauto"><input type="checkbox" id="rauto" checked> Tự nghe</label>
      </div>
      <div class="note rnote">${useAI() ? '✨ Đang dùng AI' : '🧠 Não offline (miễn phí)'}</div>`;
    const micB = $('#rmic', p), stateEl = $('#rstate', p), heardEl = $('#rheard', p);
    if (!Native.isNative && (!Ears.available || Ears.blocked)) {
      const tb = micButton(r => handle(r), 'Gõ thay giọng nói');
      $('.mic', tb) && $('.mic', tb).remove();
      p.appendChild(tb);
    }
    $('#rauto', p).onchange = e => { auto = e.target.checked; };

    const setState = s => { stateEl.textContent = s; };

    async function say(r) {
      if (!r) return false;
      hist.push({ role: 'assistant', content: JSON.stringify(r) });
      return talk(r.say, r.vi, { noVi: true });
    }

    async function think(text) {
      hist.push({ role: 'user', content: text });
      if (useAI()) {
        try {
          Stage.mood('think');
          const r = await askAI(hist.slice(-12));
          S.aiUsed.n++; save();
          return r;
        } catch (e) { hist.pop(); /* lỗi mạng/key → dùng não offline */ }
        finally { Stage.mood(null); }
      }
      return BRAIN.reply(text);
    }

    async function handle(matches) {
      const token = Run.id;
      const text = (matches && matches[0]) || '';
      heardEl.textContent = text ? `Bé nói: “${text}”` : '';
      if (!text) {
        quiet++;
        if (quiet >= 2) return sleep();
        if (await talk("I can't hear you. Say something!", 'Mình chưa nghe thấy. Bé nói gì đi!', { noVi: true }) && token === Run.id) loop();
        return;
      }
      quiet = 0;
      const r = await think(text);
      if (token !== Run.id) return;
      if (/bye/i.test(r.say)) Stage.mood('cheer', 1200); else if (Math.random() < .35) Stage.mood('cheer', 900);
      if (!(await say(r)) || token !== Run.id) return;
      if (/^bye/i.test(r.say)) return sleep(true);
      loop();
    }

    async function listen() {
      if (busy || asleep) return;
      const token = Run.id;
      if (!Ears.available || Ears.blocked) { setState('Gõ câu bé nói bên dưới'); return; }
      busy = true;
      micB.classList.add('on'); Stage.mood('listen'); setState('Mình đang nghe...');
      const res = await Ears.listen('en-US', 8000);
      micB.classList.remove('on'); Stage.mood(null); busy = false;
      if (token !== Run.id) return;
      setState(`Chạm vào ${char().vi} để nói chuyện`);
      handle(res);
    }
    const loop = () => { if (auto && !asleep) setTimeout(listen, 350); };

    async function sleep(silent) {
      asleep = true; Stage.mood('sad');
      $('#charEl') && $('#charEl').classList.add('sleeping');
      setState('💤 Đang ngủ — chạm để đánh thức');
      if (!silent) await talk("I'm going to sleep. Touch me to wake me up!", 'Mình đi ngủ đây. Bé chạm vào mình để gọi dậy nhé!', { noVi: true });
    }
    async function wake() {
      Sfx.pop();
      if (asleep) {
        asleep = false; quiet = 0; Stage.mood('cheer', 900);
        $('#charEl') && $('#charEl').classList.remove('sleeping');
        if (!(await say(BRAIN.start()))) return;
        return loop();
      }
      if (micB.classList.contains('on')) { Ears.stop(); return; }
      Voice.stop(); listen();
    }
    micB.onclick = wake;
    $('#charbox').onclick = wake;

    (async () => { if (await say(BRAIN.start())) loop(); })();
  }
};
