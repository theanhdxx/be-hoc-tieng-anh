/* ================== TRÒ CHƠI ==================
   Đoán từ · Ô chữ · Nối từ với hình · Ghép tranh · Lật hình
   Từ vựng chung: [từ, hình, nghĩa]                                                     */

const GAME_WORDS = [
  ['cat', '🐱', 'con mèo'], ['dog', '🐶', 'con chó'], ['pig', '🐷', 'con heo'], ['cow', '🐮', 'con bò'],
  ['duck', '🦆', 'con vịt'], ['fish', '🐟', 'con cá'], ['bird', '🐦', 'con chim'], ['lion', '🦁', 'sư tử'],
  ['goat', '🐐', 'con dê'], ['frog', '🐸', 'con ếch'], ['bee', '🐝', 'con ong'], ['owl', '🦉', 'con cú'],
  ['fox', '🦊', 'con cáo'], ['bear', '🐻', 'con gấu'], ['horse', '🐴', 'con ngựa'], ['mouse', '🐭', 'con chuột'],
  ['tiger', '🐯', 'con hổ'], ['zebra', '🦓', 'ngựa vằn'], ['apple', '🍎', 'quả táo'], ['cake', '🍰', 'bánh ngọt'],
  ['milk', '🥛', 'sữa'], ['egg', '🥚', 'quả trứng'], ['corn', '🌽', 'bắp ngô'], ['pear', '🍐', 'quả lê'],
  ['lemon', '🍋', 'quả chanh'], ['mango', '🥭', 'quả xoài'], ['sun', '☀️', 'mặt trời'], ['moon', '🌙', 'mặt trăng'],
  ['star', '⭐', 'ngôi sao'], ['tree', '🌳', 'cái cây'], ['car', '🚗', 'ô tô'], ['bus', '🚌', 'xe buýt'],
  ['ball', '⚽', 'quả bóng'], ['book', '📖', 'quyển sách'], ['bag', '🎒', 'cái cặp'], ['hat', '👒', 'cái mũ'],
  ['pen', '🖊️', 'cây bút'], ['bell', '🔔', 'cái chuông'], ['door', '🚪', 'cái cửa'], ['kite', '🪁', 'con diều'],
  ['cup', '☕', 'cái cốc'], ['bed', '🛏️', 'cái giường'], ['key', '🔑', 'chìa khóa'], ['boat', '⛵', 'con thuyền'],
  ['hand', '✋', 'bàn tay'], ['nose', '👃', 'cái mũi'], ['ear', '👂', 'cái tai'], ['sock', '🧦', 'đôi tất'],
  ['shoe', '👟', 'đôi giày'], ['drum', '🥁', 'cái trống'], ['clock', '🕐', 'đồng hồ'], ['house', '🏠', 'ngôi nhà'],
  ['train', '🚆', 'tàu hỏa'], ['plane', '✈️', 'máy bay'], ['rain', '🌧️', 'cơn mưa'], ['bike', '🚲', 'xe đạp']
];

const GAMES = [
  ['spell', '🔤', 'Đoán từ', 'Spell it'],
  ['cross', '✖️', 'Giải ô chữ', 'Crossword'],
  ['match', '🔗', 'Nối từ với hình', 'Match'],
  ['jigsaw', '🧩', 'Ghép tranh', 'Puzzle'],
  ['memory', '🃏', 'Lật hình', 'Memory']
];

/* Độ dài từ theo tuổi */
const maxLen = () => ({ 3: 3, 4: 4, 5: 5 }[S.childAge] || 6);
const wordsUpTo = n => GAME_WORDS.filter(w => w[0].length <= n);
const L = ch => S.lowerCase ? ch.toLowerCase() : ch.toUpperCase();
const spellOut = w => w.toUpperCase().split('').join(', ');

function progressDots(n, i) {
  return `<div class="progress">${Array.from({ length: n }, (_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('')}</div>`;
}
function gameOver(p, pr) {
  p.innerHTML = `<div class="center"><div class="picture">🏆</div><div class="row">
    <button class="btn big primary" id="again">🔁 Chơi lại</button><button class="btn big" id="home">🎮 Trò khác</button></div></div>`;
  $('#again', p).onclick = () => go('game', pr, false);
  $('#home', p).onclick = () => history.back();
  Sfx.cheer(); confetti(80); addStar(3); Stage.mood('cheer', 2000);
  talk('You win! Hooray!', 'Bé thắng rồi! Hoan hô!');
}
const shake = el => { el.classList.remove('wrong'); void el.offsetWidth; el.classList.add('wrong'); Sfx.oops(); };

SCREENS.games = {
  title: () => '🎮 Trò chơi',
  render(p) {
    p.innerHTML = `<div class="tiles">${GAMES.map((g, i) =>
      `<button class="tile ${TILE_COLORS[(i + 2) % 6]}" data-g="${g[0]}"><span class="ico">${g[1]}</span>${g[2]}<small>${g[3]}</small></button>`).join('')}</div>`;
    $$('[data-g]', p).forEach(b => b.onclick = () => { Sfx.tap(); go('game', { g: b.dataset.g }); });
    talk("Let's play a game!", 'Mình chơi trò gì nào?');
  }
};

SCREENS.game = {
  title: pr => { const g = GAMES.find(x => x[0] === pr.g); return `${g[1]} ${g[2]}`; },
  render(p, pr) { GAME_IMPL[pr.g](p, pr); }
};

const GAME_IMPL = {};

/* ---------- 1. ĐOÁN TỪ: nhìn hình, chọn chữ cái ghép thành từ ---------- */
GAME_IMPL.spell = (p, pr) => {
  const ROUNDS = 6;
  const pool = shuffle(wordsUpTo(maxLen()));
  let r = 0;
  const round = async () => {
    const token = Run.id;
    if (r >= ROUNDS) return gameOver(p, pr);
    const [w, emo, vi] = pool[r];
    const letters = w.toUpperCase().split('');
    const hint = S.childAge <= 4 ? 1 : 0;              // bé nhỏ: cho sẵn chữ đầu
    let pos = hint;
    const extra = shuffle(LETTERS.filter(c => !letters.includes(c))).slice(0, S.childAge <= 4 ? 2 : 3);
    p.innerHTML = `${progressDots(ROUNDS, r)}
      <div class="center">
        <div class="picture">${emo}</div>
        <div class="slots">${letters.map((c, i) => `<span class="slot ${i < hint ? 'filled' : ''}">${i < hint ? L(c) : ''}</span>`).join('')}</div>
        <div class="ltiles">${shuffle(letters.slice(hint).concat(extra)).map(c => `<button class="ltile" data-c="${c}">${L(c)}</button>`).join('')}</div>
      </div>
      <div class="row"><button class="btn" id="say">🔊 Nghe từ</button><button class="btn" id="skip">⏭️ Bỏ qua</button></div>`;
    const slots = $$('.slot', p);
    $('#say', p).onclick = () => talk(`${w}. ${spellOut(w)}. ${w}!`);
    $('#skip', p).onclick = () => { Voice.stop(); Run.id++; r++; round(); };
    $$('.ltile', p).forEach(b => b.onclick = async () => {
      if (b.disabled || pos >= letters.length) return;
      if (b.dataset.c === letters[pos]) {
        Sfx.pop(); b.disabled = true; b.classList.add('used');
        slots[pos].textContent = L(letters[pos]); slots[pos].classList.add('filled');
        pos++;
        if (pos === letters.length) {
          $$('.ltile', p).forEach(x => x.disabled = true);
          if (!(await celebrate(`${spellOut(w)}. ${w}!`))) return;
          await wait(300); if (token === Run.id) { r++; round(); }
        }
      } else {
        shake(b);
        if (S.childAge <= 4) slots[pos].classList.add('blink');
      }
    });
    await talk('What is this? Spell it!', `Đây là ${vi}. Bé chọn chữ cái để ghép từ nhé!`);
  };
  round();
};

/* ---------- 2. Ô CHỮ: 2–3 từ đan nhau, gợi ý bằng hình ---------- */
function makeCrossword(pool) {
  const ok = w => w[0].length >= 3;
  for (let tries = 0; tries < 400; tries++) {
    const [A, B, C] = shuffle(pool.filter(ok)).slice(0, 3);
    const a = A[0].toUpperCase();
    const place = [];       // {w, r, c, dir}
    place.push({ item: A, r: 0, c: 0, dir: 'across' });
    const cross = (item, avoidCols) => {
      const b = item[0].toUpperCase();
      const opts = [];
      for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++)
        if (a[i] === b[j] && avoidCols.every(c => Math.abs(c - i) >= 2)) opts.push([i, j]);
      return opts.length ? pick(opts) : null;
    };
    const x1 = cross(B, []);
    if (!x1) continue;
    place.push({ item: B, r: -x1[1], c: x1[0], dir: 'down' });
    const x2 = C && C[0] !== B[0] ? cross(C, [x1[0]]) : null;
    if (x2) place.push({ item: C, r: -x2[1], c: x2[0], dir: 'down' });
    if (place.length < 3 && tries < 300) continue;      // ưu tiên 3 từ
    const minR = Math.min(...place.map(q => q.r));
    place.forEach(q => q.r -= minR);
    const rows = Math.max(...place.map(q => q.dir === 'down' ? q.r + q.item[0].length : q.r + 1));
    const cols = a.length;
    return { place, rows, cols };
  }
  return null;
}

GAME_IMPL.cross = (p, pr) => {
  const pool = wordsUpTo(Math.max(4, maxLen()));
  const cw = makeCrossword(pool) || { place: [{ item: pool[0], r: 0, c: 0, dir: 'across' }], rows: 1, cols: pool[0][0].length };
  const cells = {};                 // "r,c" → {ch, el, done}
  cw.place.forEach((q, n) => {
    q.n = n + 1; q.cells = [];
    q.item[0].toUpperCase().split('').forEach((ch, k) => {
      const r = q.r + (q.dir === 'down' ? k : 0), c = q.c + (q.dir === 'across' ? k : 0), id = r + ',' + c;
      cells[id] = cells[id] || { ch, done: false };
      q.cells.push(id);
    });
  });
  let sel = null, left = cw.place.length;
  p.innerHTML = `<div class="cwwrap">
      <div class="cwgrid" style="grid-template-columns:repeat(${cw.cols}, var(--cw)); grid-template-rows:repeat(${cw.rows}, var(--cw))">
        ${Object.keys(cells).map(id => { const [r, c] = id.split(',').map(Number);
          const start = cw.place.find(q => q.cells[0] === id);
          return `<div class="cwcell" data-id="${id}" style="grid-row:${r + 1};grid-column:${c + 1}">${start ? `<i>${start.n}</i>` : ''}<b></b></div>`; }).join('')}
      </div>
      <div class="cwclues">${cw.place.map(q => `<button class="cwclue" data-n="${q.n}"><i>${q.n}</i><span>${q.item[1]}</span><small>${q.dir === 'across' ? '➡️' : '⬇️'}</small></button>`).join('')}</div>
    </div>
    <div class="ltiles" id="bank"></div>`;
  Object.keys(cells).forEach(id => cells[id].el = $(`.cwcell[data-id="${id}"]`, p));
  const bank = $('#bank', p);
  const choose = q => {
    sel = q;
    $$('.cwclue', p).forEach(b => b.classList.toggle('sel', +b.dataset.n === q.n));
    $$('.cwcell', p).forEach(el => el.classList.toggle('hl', q.cells.includes(el.dataset.id)));
    const need = q.cells.filter(id => !cells[id].done).map(id => cells[id].ch);
    const extra = shuffle(LETTERS.filter(c => !need.includes(c))).slice(0, 2);
    bank.innerHTML = shuffle(need.concat(extra)).map(c => `<button class="ltile" data-c="${c}">${L(c)}</button>`).join('');
    $$('.ltile', bank).forEach(b => b.onclick = () => tap(b));
    talk(`Number ${NUMBER_WORDS[q.n]}. What is this?`, `Số ${q.n}: đây là ${q.item[2]}. Bé điền chữ nhé!`, { noVi: !S.viVoice });
  };
  const tap = async b => {
    const q = sel; if (!q || b.disabled) return;
    const id = q.cells.find(x => !cells[x].done);
    if (!id) return;
    if (b.dataset.c !== cells[id].ch) return shake(b);
    Sfx.pop(); b.disabled = true; b.classList.add('used');
    cells[id].done = true; $('b', cells[id].el).textContent = L(cells[id].ch); cells[id].el.classList.add('filled');
    if (q.cells.every(x => cells[x].done)) {
      q.solved = true; left--;
      $(`.cwclue[data-n="${q.n}"]`, p).classList.add('done');
      bank.innerHTML = '';
      // từ khác có thể đã được điền xong nhờ ô chung
      cw.place.forEach(o => { if (!o.solved && o.cells.every(x => cells[x].done)) { o.solved = true; left--; $(`.cwclue[data-n="${o.n}"]`, p).classList.add('done'); } });
      const token = Run.id;
      if (!(await celebrate(`${q.item[0]}! ${spellOut(q.item[0])}.`))) return;
      if (token !== Run.id) return;
      if (left <= 0) return gameOver(p, pr);
      const next = cw.place.find(o => !o.solved); if (next) choose(next);
    }
  };
  $$('.cwclue', p).forEach(b => b.onclick = () => { const q = cw.place.find(o => o.n === +b.dataset.n); if (!q.solved) { Sfx.tap(); choose(q); } });
  choose(cw.place[0]);
};

/* ---------- 3. NỐI TỪ VỚI HÌNH ---------- */
GAME_IMPL.match = (p, pr) => {
  const ROUNDS = 3, N = S.childAge <= 3 ? 3 : 4;
  const pool = shuffle(GAME_WORDS.slice());
  let r = 0;
  const round = () => {
    if (r >= ROUNDS) return gameOver(p, pr);
    const set = pool.slice(r * N, r * N + N);
    let pickW = null, left = N;
    p.innerHTML = `${progressDots(ROUNDS, r)}<div class="mwrap" id="mw"><svg class="mlines" id="ml"></svg>
      <div class="mcol">${set.map(w => `<button class="mword" data-w="${w[0]}">${esc(S.lowerCase ? w[0] : w[0].toUpperCase())}</button>`).join('')}</div>
      <div class="mcol">${shuffle(set.slice()).map(w => `<button class="mpic" data-w="${w[0]}">${w[1]}</button>`).join('')}</div></div>`;
    const mw = $('#mw', p), svg = $('#ml', p), pairs = [];
    const draw = () => {
      const R = mw.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${R.width} ${R.height}`);
      svg.innerHTML = pairs.map(([a, b], i) => {
        const A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
        return `<line x1="${A.right - R.left}" y1="${A.top + A.height / 2 - R.top}" x2="${B.left - R.left}" y2="${B.top + B.height / 2 - R.top}" stroke="${['#ff7eb6', '#4fc3f7', '#66bb6a', '#ffa94d'][i % 4]}" stroke-width="8" stroke-linecap="round"/>`;
      }).join('');
    };
    new ResizeObserver(draw).observe(mw);
    $$('.mword', p).forEach(b => b.onclick = () => {
      if (b.classList.contains('right')) return;
      pickW = b; $$('.mword', p).forEach(x => x.classList.toggle('sel', x === b));
      Sfx.tap(); Voice.stop(); Voice.speak(b.dataset.w, 'en-US', char().pitch, S.rate);
    });
    $$('.mpic', p).forEach(b => b.onclick = async () => {
      if (b.classList.contains('right')) return;
      if (!pickW) { shake(b); talk('Pick a word first!', 'Bé chọn một chữ trước nhé!'); return; }
      if (b.dataset.w !== pickW.dataset.w) { shake(b); return; }
      const token = Run.id;
      b.classList.add('right'); pickW.classList.add('right'); pickW.classList.remove('sel');
      pairs.push([pickW, b]); draw(); pickW = null; left--;
      Sfx.ding(); addStar();
      if (left === 0) {
        if (!(await celebrate('All matched! Super!'))) return;
        if (token === Run.id) { r++; round(); }
      } else talk(pick(PRAISE));
    });
    talk('Touch a word, then touch its picture!', 'Bé chạm vào chữ, rồi chạm vào hình đúng nhé!');
  };
  round();
};

/* ---------- 4. GHÉP TRANH: chạm 2 mảnh để đổi chỗ ---------- */
function emojiImage(emo, bg) {
  const c = document.createElement('canvas'); c.width = c.height = 600;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 600, 600); g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]);
  x.fillStyle = g; x.fillRect(0, 0, 600, 600);
  x.fillStyle = 'rgba(255,255,255,.35)';
  for (let i = 0; i < 14; i++) { x.beginPath(); x.arc(Math.random() * 600, Math.random() * 600, 10 + Math.random() * 30, 0, 7); x.fill(); }
  x.font = '400px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(emo, 300, 330);
  return c.toDataURL('image/png');
}
GAME_IMPL.jigsaw = (p, pr) => {
  let N = pr.n || (S.childAge <= 3 ? 2 : 3);
  const BGS = [['#b3e5fc', '#4fc3f7'], ['#c8e6c9', '#66bb6a'], ['#f8bbd0', '#f06292'], ['#d1c4e9', '#9575cd'], ['#b2dfdb', '#26a69a']];
  const charPics = Object.values(CHARACTERS).map(c => ({ name: c.name, img: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    c.svg().replace('viewBox="0 0 300 360"', 'viewBox="-30 0 360 360"')
      .replace(/(<svg[^>]*>)/, '$1<rect x="-30" y="0" width="360" height="360" fill="#cdeeff"/><ellipse cx="150" cy="372" rx="230" ry="60" fill="#a5d6a7"/>')
      .replace('class="m-open"', 'class="m-open" style="display:none"')), char: true }));
  const pics = shuffle(charPics.concat(shuffle(GAME_WORDS.slice()).slice(0, 6).map(w => ({ name: w[0], emo: w[1] }))));
  let k = 0;
  const round = () => {
    const token = Run.id;
    const pic = pics[k++ % pics.length];
    const img = pic.img || emojiImage(pic.emo, pick(BGS));
    const order = (() => { let o; do { o = shuffle([...Array(N * N).keys()]); } while (o.every((v, i) => v === i)); return o; })();
    let first = null;
    p.innerHTML = `<div class="jwrap">
        <div class="jboard" id="jb" style="grid-template-columns:repeat(${N},1fr)"></div>
        <div class="jside"><div class="jpreview" style="background-image:url('${img}')"></div>
          <div class="row"><button class="btn ${N === 2 ? 'sel' : ''}" data-n="2">4 mảnh</button><button class="btn ${N === 3 ? 'sel' : ''}" data-n="3">9 mảnh</button></div>
          <button class="btn" id="jnext">🔁 Tranh khác</button></div>
      </div>`;
    const jb = $('#jb', p);
    const render = () => {
      jb.innerHTML = order.map((v, i) => {
        const r = Math.floor(v / N), c = v % N;
        return `<button class="jtile ${v === i ? 'ok' : ''}" data-i="${i}" style="background-image:url('${img}');background-size:${N * 100}% ${N * 100}%;background-position:${N === 1 ? 0 : c / (N - 1) * 100}% ${N === 1 ? 0 : r / (N - 1) * 100}%"></button>`;
      }).join('');
      $$('.jtile', jb).forEach(b => b.onclick = () => tap(+b.dataset.i));
    };
    const tap = async i => {
      if (first === null) { first = i; Sfx.tap(); $$('.jtile', jb)[i].classList.add('sel'); return; }
      if (first === i) { first = null; render(); return; }
      [order[first], order[i]] = [order[i], order[first]]; first = null;
      Sfx.pop(); render();
      if (order.every((v, j) => v === j)) {
        jb.classList.add('solved');
        const name = pic.name;
        if (!(await celebrate(pic.char ? `It's ${name}!` : `It's a ${name}!`))) return;
        if (token === Run.id) round();
      }
    };
    $$('[data-n]', p).forEach(b => b.onclick = () => { Sfx.tap(); N = +b.dataset.n; history.replaceState({ name: 'game', params: { g: 'jigsaw', n: N } }, ''); k--; Run.id++; round(); });
    $('#jnext', p).onclick = () => { Sfx.tap(); Run.id++; round(); };
    render();
    talk('Touch two pieces to swap them!', 'Bé chạm 2 mảnh để đổi chỗ, ghép thành bức tranh nhé!');
  };
  round();
};

/* ---------- 5. LẬT HÌNH: tìm cặp hình – chữ ---------- */
GAME_IMPL.memory = (p, pr) => {
  const PAIRS = S.childAge <= 3 ? 3 : S.childAge === 4 ? 4 : 6;
  const picToWord = S.childAge >= 4;      // bé lớn: ghép hình với chữ; bé nhỏ: hai hình giống nhau
  const set = shuffle(GAME_WORDS.slice()).slice(0, PAIRS);
  const deck = shuffle(set.flatMap(w => [{ w, face: w[1], pic: true }, { w, face: picToWord ? (S.lowerCase ? w[0] : w[0].toUpperCase()) : w[1], pic: !picToWord }]));
  let open = [], lock = false, found = 0, moves = 0;
  p.innerHTML = `<div class="mgrid" style="--cols:${PAIRS <= 3 ? 3 : 4}">${deck.map((d, i) =>
    `<button class="mcard" data-i="${i}"><span class="back">⭐</span><span class="face ${d.pic ? 'pic' : 'txt'}">${esc(d.face)}</span></button>`).join('')}</div>`;
  $$('.mcard', p).forEach(b => b.onclick = async () => {
    const i = +b.dataset.i, d = deck[i];
    if (lock || b.classList.contains('up')) return;
    const token = Run.id;
    b.classList.add('up'); Sfx.tap(); open.push([b, d]);
    Voice.stop(); Voice.speak(d.w[0], 'en-US', char().pitch, S.rate);
    if (open.length < 2) return;
    lock = true; moves++;
    const [[b1, d1], [b2, d2]] = open; open = [];
    await wait(700);
    if (token !== Run.id) return;
    if (d1.w === d2.w) {
      b1.classList.add('got'); b2.classList.add('got'); found++; Sfx.ding(); addStar();
      lock = false;
      if (found === PAIRS) { if (!(await celebrate(`You found them all in ${NUMBER_WORDS[moves] || moves} tries!`))) return; return gameOver(p, pr); }
      talk(`${d1.w[0]}! ${pick(PRAISE)}`);
    } else {
      Sfx.oops(); await wait(400);
      b1.classList.remove('up'); b2.classList.remove('up'); lock = false;
    }
  });
  talk('Find the pairs!', picToWord ? 'Bé lật thẻ, tìm hình và chữ giống nhau nhé!' : 'Bé lật thẻ, tìm hai hình giống nhau nhé!');
};
