/* ================== TÌM ĐƯỜNG ĐI (nùi dây) & BẮN TRỨNG ================== */

/* ---------- 1. TÌM ĐƯỜNG ĐI: mỗi con vật nối với một món đồ bằng dây rối ---------- */
const PATH_PAIRS = [
  ['🐶', 'dog', 'con chó', '🦴', 'bone', 'khúc xương'], ['🐱', 'cat', 'con mèo', '🐟', 'fish', 'con cá'],
  ['🐰', 'rabbit', 'con thỏ', '🥕', 'carrot', 'củ cà rốt'], ['🐵', 'monkey', 'con khỉ', '🍌', 'banana', 'quả chuối'],
  ['🐝', 'bee', 'con ong', '🌸', 'flower', 'bông hoa'], ['🐭', 'mouse', 'con chuột', '🧀', 'cheese', 'miếng phô mai'],
  ['🐼', 'panda', 'gấu trúc', '🎋', 'bamboo', 'cây tre'], ['🐿️', 'squirrel', 'con sóc', '🌰', 'nut', 'hạt dẻ'],
  ['🐻', 'bear', 'con gấu', '🍯', 'honey', 'hũ mật ong'], ['🐮', 'cow', 'con bò', '🌾', 'grass', 'bó cỏ'],
  ['👧', 'girl', 'bạn gái', '🎈', 'balloon', 'quả bóng bay'], ['🐸', 'frog', 'con ếch', '🪷', 'lily pad', 'lá sen']
];
const PATH_LEVELS = [
  { n: 3, wiggle: 2, colors: true, vi: 'Dễ' },
  { n: 4, wiggle: 3, colors: false, vi: 'Vừa' },
  { n: 5, wiggle: 4, colors: false, vi: 'Khó' }
];

GAME_IMPL.path = (p, pr) => {
  let lv = pr.lv != null ? pr.lv : (S.childAge <= 3 ? 0 : S.childAge <= 5 ? 1 : 2);
  let round = 0;
  const ROUNDS = 4;

  const newRound = () => {
    const token = Run.id;
    if (round >= ROUNDS) return gameOver(p, { ...pr, lv });
    const L = PATH_LEVELS[lv], n = L.n;
    // khung ngang: con vật bên trái → đồ vật bên phải; khung dọc (điện thoại): trên → dưới
    const box = p.getBoundingClientRect();
    const vertical = box.width < box.height * 0.9;
    const VW = vertical ? 640 : 1000, VH = vertical ? 1000 : 640;
    const P = (a, b) => vertical ? [b, a] : [a, b];        // a: dọc theo dây (0..1000), b: ngang (0..640)
    const pairs = shuffle(PATH_PAIRS.slice()).slice(0, n);
    const ends = shuffle([...Array(n).keys()]);            // dây i đi từ con vật i đến ô bên phải ends[i]
    const ys = k => 70 + k * (640 - 140) / (n - 1);
    const COL = ['#ff7eb6', '#4fc3f7', '#ffb74d', '#81c784', '#b388ff'];
    // dây uốn lượn: đi qua nhiều điểm ngẫu nhiên → cắt nhau tạo thành "nùi"
    const paths = pairs.map((_, i) => {
      const pts = [[150, ys(i)]];
      const steps = L.wiggle + 1;
      for (let s = 1; s < steps; s++) pts.push([150 + s * (700 / steps) + (Math.random() - .5) * 60, 40 + Math.random() * (640 - 80)]);
      pts.push([850, ys(ends[i])]);
      // đường cong mượt (Catmull-Rom → Bézier)
      const Q = (x, y) => P(x, y).map(v => v.toFixed(1)).join(' ');
      let d = `M${Q(pts[0][0], pts[0][1])}`;
      for (let k = 0; k < pts.length - 1; k++) {
        const p0 = pts[k - 1] || [pts[0][0] - 80, pts[0][1]], p1 = pts[k], p2 = pts[k + 1], p3 = pts[k + 2] || [p2[0] + 80, p2[1]];
        d += ` C${Q(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ${Q(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${Q(p2[0], p2[1])}`;
      }
      return d;
    });
    let pickA = null, solved = 0, locked = false;
    p.innerHTML = `${progressDots(ROUNDS, round)}
      <div class="row tabs pzlv">${PATH_LEVELS.map((x, i) => `<button class="btn ${i === lv ? 'sel' : ''}" data-lv="${i}">${x.vi} · ${x.n} dây</button>`).join('')}</div>
      <div class="pathwrap">
        <svg viewBox="0 0 ${VW} ${VH}" class="pathsvg" id="psvg" preserveAspectRatio="xMidYMid meet">
          ${paths.map((d, i) => `<path d="${d}" class="rope" stroke="${L.colors ? COL[i] : '#8d6e63'}"/>`).join('')}
          ${paths.map((d, i) => `<path d="${d}" class="rope-glow" id="glow${i}" stroke="${COL[i]}"/>`).join('')}
          ${pairs.map((pp, i) => `<g class="pnode pa" data-i="${i}" transform="translate(${P(80, ys(i)).join(' ')})"><g><circle r="56"/><text y="20">${pp[0]}</text></g></g>`).join('')}
          ${pairs.map((pp, i) => `<g class="pnode pb" data-i="${i}" transform="translate(${P(920, ys(ends[i])).join(' ')})"><g><circle r="56"/><text y="20">${pp[3]}</text></g></g>`).join('')}
        </svg>
      </div>`;
    $$('[data-lv]', p).forEach(b => b.onclick = () => { Sfx.tap(); lv = +b.dataset.lv; round = 0; Run.id++; newRound(); });
    const svg = $('#psvg', p);
    // độ dài từng dây để làm hiệu ứng "chạy dọc dây"
    paths.forEach((_, i) => { const g = $(`#glow${i}`, svg), len = g.getTotalLength(); g.style.strokeDasharray = len; g.style.strokeDashoffset = len; g.dataset.len = len; });

    const trace = i => new Promise(res => {
      const g = $(`#glow${i}`, svg);
      g.style.transition = 'none'; g.style.strokeDashoffset = g.dataset.len; void g.getBoundingClientRect();
      g.style.transition = 'stroke-dashoffset 1.3s ease-in-out'; g.style.strokeDashoffset = 0;
      setTimeout(res, 1350);
    });
    $$('.pa', svg).forEach(a => a.onclick = () => {
      if (locked || a.classList.contains('done')) return;
      Sfx.tap(); pickA = +a.dataset.i;
      $$('.pa', svg).forEach(x => x.classList.toggle('sel', x === a));
      const pp = pairs[pickA];
      talk(`Where does the ${pp[1]} go?`, `Dây của ${pp[2]} dẫn tới đâu? Bé chạm vào món đồ nhé!`);
    });
    $$('.pb', svg).forEach(b => b.onclick = async () => {
      if (locked || b.classList.contains('done')) return;
      if (pickA === null) { shake(b); talk('Pick an animal first!', 'Bé chọn một con vật bên trái trước nhé!'); return; }
      locked = true;
      const i = pickA, pp = pairs[i], ok = +b.dataset.i === i;
      Voice.stop(); Sfx.tap();
      await trace(i);                                      // cho bé thấy dây thật sự dẫn tới đâu
      if (token !== Run.id) return;
      const a = $(`.pa[data-i="${i}"]`, svg), target = $(`.pb[data-i="${i}"]`, svg);
      if (ok) {
        a.classList.add('done'); a.classList.remove('sel'); target.classList.add('done');
        solved++; pickA = null;
        if (solved < n) { locked = false; celebrate(`The ${pp[1]} gets the ${pp[4]}!`); return; }   // chơi tiếp ngay, không phải chờ
        if (!(await celebrate(`The ${pp[1]} gets the ${pp[4]}!`))) return;
        if (token !== Run.id) return;
        round++; await wait(300); if (token === Run.id) newRound();
      } else {
        shake(b);
        $(`#glow${i}`, svg).classList.add('keep');
        locked = false;
        talk(`Oops! Follow the line. The ${pp[1]} gets the ${pp[4]}.`, `Dây dẫn tới ${pp[5]} cơ. Bé chạm vào ${pp[5]} nhé!`);
      }
    });
    talk('Follow the lines! Who gets what?', 'Bé dò theo sợi dây xem mỗi con vật được món gì nhé! Chạm con vật, rồi chạm món đồ.');
  };
  newRound();
};

/* ---------- 2. BẮN TRỨNG: chạm để bắn quả trứng có chữ/số đúng ---------- */
GAME_IMPL.eggs = (p, pr) => {
  let mode = pr.mode || 'abc';
  const WORD = mode === 'word';                            // chế độ ghép từ: bắn lần lượt từng chữ của từ
  const ROUNDS = WORD ? 5 : 10;
  p.innerHTML = `<div class="eggbar">
      <div class="row tabs pzlv">${[['abc', '🔤 Chữ cái'], ['123', '🔢 Chữ số'], ['mix', '🎲 Cả hai'], ['word', '🧩 Ghép từ']].map(([m, t]) => `<button class="btn ${m === mode ? 'sel' : ''}" data-m="${m}">${t}</button>`).join('')}</div>
      <div class="eggtarget" id="etgt"></div>
      <button class="btn" id="esay">🔊 Nghe lại</button>
    </div>
    <div class="eggarea" id="earea"><canvas id="ecv"></canvas></div>
    ${progressDots(ROUNDS, 0).replace('class="progress"', 'class="progress" id="eprog"')}`;
  $$('[data-m]', p).forEach(b => b.onclick = () => { Sfx.tap(); history.replaceState({ name: 'game', params: { g: 'eggs', mode: b.dataset.m } }, ''); go('game', { g: 'eggs', mode: b.dataset.m }, false); });

  const area = $('#earea', p), cv = $('#ecv', p), ctx = cv.getContext('2d');
  const token = Run.id;
  const pool = mode === 'abc' || WORD ? LETTERS : mode === '123' ? DIGITS : LETTERS.concat(DIGITS);
  const wordPool = shuffle(GAME_WORDS.filter(w => /^[a-z]+$/.test(w[0]) && w[0].length <= Math.max(3, maxLen())));
  let word = null, pos = 0, wi = 0;
  const show = c => (/\d/.test(c) || !S.lowerCase) ? c : c.toLowerCase();
  const nameOf = c => /\d/.test(c) ? NUMBER_WORDS[+c] : c;
  const EGG_COLORS = ['#fff3e0', '#e1f5fe', '#fce4ec', '#f1f8e9', '#ede7f6', '#fffde7'];
  const SPOTS = ['#ffb74d', '#4fc3f7', '#f06292', '#81c784', '#9575cd', '#ffd54f'];
  let W = 0, H = 0, dpr = 1, eggs = [], shots = [], bits = [], target = null, score = 0, raf = 0, aim = -Math.PI / 2, lock = false;
  const speed = () => (S.childAge <= 3 ? 40 : S.childAge <= 4 ? 60 : 85);
  const N_EGGS = () => (S.childAge <= 3 ? 4 : 6);

  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = area.clientWidth; H = area.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const eggR = () => Math.max(30, Math.min(56, Math.min(W, H) / 9));
  const LANES = 3;
  const laneY = l => H * (0.14 + l * 0.2);
  const laneV = l => (l % 2 ? -1 : 1) * speed() * (1 + l * .15);
  const spawn = (label, lane, slot, perLane) => {
    const r = eggR();
    if (lane == null) {                                       // trứng mới thả vào làn còn chỗ trống nhất
      lane = [...Array(LANES).keys()].sort((a, b) => eggs.filter(e => !e.falling && e.lane === a).length - eggs.filter(e => !e.falling && e.lane === b).length)[0];
    }
    const x = perLane ? (slot + .5) * (W / perLane) : (laneV(lane) > 0 ? -r : W + r);
    return { label, lane, x, y: laneY(lane), baseY: laneY(lane), vx: laneV(lane), t: Math.random() * 6, r,
      color: pick(EGG_COLORS), spot: pick(SPOTS), falling: false, vy: 0, rot: 0, vr: 0, crack: 0 };
  };
  /* --- chế độ ghép từ --- */
  const wordHUD = () => {
    const hint = S.childAge <= 4;                           // bé nhỏ: hiện mờ chữ cần bắn
    $('#etgt', p).innerHTML = `<span class="eword-pic">${word[1]}</span>` + word[0].toUpperCase().split('').map((c, i) =>
      `<span class="eslot ${i < pos ? 'filled' : i === pos ? 'now' : ''}">${i < pos ? show(c) : (hint ? `<i>${show(c)}</i>` : '')}</span>`).join('');
  };
  const sayWord = () => talk(`Let's spell ${word[0]}! ${spellOut(word[0])}.`, `Bé bắn lần lượt các chữ để ghép thành từ ${word[0]} — ${word[2]} nhé!`);
  // trên màn hình luôn có chữ cần bắn; các chữ còn thiếu của từ + vài chữ khác
  const fillEggs = () => {
    const alive = eggs.filter(e => !e.falling);
    const need = word[0].toUpperCase().slice(pos).split('');
    if (!alive.some(e => e.label === target)) eggs.push(spawn(target));
    while (eggs.filter(e => !e.falling).length < N_EGGS()) {
      const have = eggs.filter(e => !e.falling).map(e => e.label);
      const missing = need.filter(c => !have.includes(c));
      let l = missing.length && Math.random() < .6 ? pick(missing) : pick(pool);
      if (have.includes(l) && !missing.includes(l)) continue;
      eggs.push(spawn(l));
    }
  };
  const newWord = () => {
    if (score >= ROUNDS) return finish();
    word = wordPool[wi++ % wordPool.length]; pos = 0;
    target = word[0][0].toUpperCase();
    const letters = new Set(word[0].toUpperCase().split(''));
    while (letters.size < N_EGGS()) letters.add(pick(pool));
    const per = Math.ceil(N_EGGS() / LANES);
    eggs = shuffle([...letters].slice(0, Math.max(N_EGGS(), letters.size))).map((l, i) => spawn(l, i % LANES, Math.floor(i / LANES), per));
    wordHUD(); sayWord();
  };

  const newTarget = () => {
    if (WORD) return newWord();
    if (score >= ROUNDS) return finish();
    let t; do { t = pick(pool); } while (target && t === target);
    target = t;
    // đảm bảo trứng đúng có trên màn hình, các trứng còn lại khác nhau
    eggs = eggs.filter(e => !e.falling);
    const labels = new Set([t]);
    while (labels.size < N_EGGS()) labels.add(pick(pool));
    const per = Math.ceil(N_EGGS() / LANES);
    eggs = shuffle([...labels]).map((l, i) => spawn(l, i % LANES, Math.floor(i / LANES), per));
    $('#etgt', p).innerHTML = `Bắn <b>${show(t)}</b>`;
    talk(/\d/.test(t) ? `Shoot number ${nameOf(t)}!` : `Shoot the letter ${t}!`, `Bắn quả trứng có ${/\d/.test(t) ? 'số' : 'chữ'} ${show(t)} nhé!`);
  };
  $('#esay', p).onclick = () => {
    if (!target) return;
    if (WORD) return talk(`${word[0]}. Shoot the letter ${target}!`, `Bắn chữ ${show(target)} nhé!`);
    talk(/\d/.test(target) ? `Shoot number ${nameOf(target)}!` : `Shoot the letter ${target}!`);
  };

  /* --- vẽ --- */
  const drawEgg = e => {
    ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.rot);
    const r = e.r;
    ctx.beginPath(); ctx.ellipse(0, 0, r * .82, r, 0, 0, 7);
    ctx.fillStyle = e.color; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(59,47,92,.25)'; ctx.stroke();
    ctx.fillStyle = e.spot;
    [[-.45, -.45, .14], [.45, -.2, .1], [-.35, .55, .1], [.4, .6, .13]].forEach(([a, b, s]) => { ctx.beginPath(); ctx.arc(a * r, b * r, s * r, 0, 7); ctx.fill(); });
    if (e.crack) {
      ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(-r * .8, -r * .1); for (let i = 1; i <= 6; i++) ctx.lineTo(-r * .8 + i * r * .27, -r * .1 + (i % 2 ? -1 : 1) * r * .18); ctx.stroke();
    }
    ctx.fillStyle = '#3b2f5c'; ctx.font = `800 ${Math.round(r * 1.05)}px "Baloo 2", sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(show(e.label), 0, r * .08);
    ctx.restore();
  };
  const cannon = () => ({ x: W / 2, y: H - 10 });
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    // cỏ
    ctx.fillStyle = '#a5d6a7'; ctx.beginPath(); ctx.ellipse(W / 2, H + 30, W * .7, 70, 0, 0, 7); ctx.fill();
    eggs.forEach(drawEgg);
    bits.forEach(b => { ctx.globalAlpha = Math.max(0, b.life); ctx.font = `${b.size}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText(b.ch, b.x, b.y); ctx.globalAlpha = 1; });
    shots.forEach(s => { ctx.fillStyle = '#ff5252'; ctx.beginPath(); ctx.arc(s.x, s.y, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x - 3, s.y - 3, 3, 0, 7); ctx.fill(); });
    // ống bắn ở giữa phía dưới, xoay theo hướng bé chạm
    const c = cannon();
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(aim + Math.PI / 2);
    ctx.fillStyle = '#7e57c2'; ctx.fillRect(-12, -70, 24, 60); ctx.fillStyle = '#b39ddb'; ctx.fillRect(-16, -78, 32, 14);
    ctx.restore();
    ctx.fillStyle = '#ffd54f'; ctx.beginPath(); ctx.arc(c.x, c.y, 34, Math.PI, 0); ctx.fill();
    ctx.font = '34px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🎯', c.x, c.y - 4);
  };

  /* --- chuyển động --- */
  let last = performance.now();
  const step = now => {
    if (token !== Run.id) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    eggs.forEach(e => {
      if (e.falling) { e.vy += 1400 * dt; e.y += e.vy * dt; e.rot += e.vr * dt; return; }
      e.t += dt; e.x += e.vx * dt; e.y = e.baseY + Math.sin(e.t * 2) * 6;
      const m = e.r;                                          // ra khỏi mép này thì vào lại từ mép kia
      if (e.vx > 0 && e.x > W + m) e.x -= W + 2 * m; else if (e.vx < 0 && e.x < -m) e.x += W + 2 * m;
    });
    eggs = eggs.filter(e => e.y < H + e.r * 2);
    shots.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; });
    shots = shots.filter(s => s.y > -20 && s.x > -20 && s.x < W + 20 && !s.hit);
    bits.forEach(b => { b.y += b.vy * dt; b.vy += 600 * dt; b.life -= dt * .8; });
    bits = bits.filter(b => b.life > 0);
    // va chạm
    shots.forEach(s => eggs.forEach(e => {
      if (s.hit || e.falling) return;
      const dx = (s.x - e.x) / (e.r * .82), dy = (s.y - e.y) / e.r;
      if (dx * dx + dy * dy <= 1.15) { s.hit = true; hitEgg(e); }
    }));
    draw();
    raf = requestAnimationFrame(step);
  };

  async function hitEgg(e) {
    e.falling = true; e.crack = 1; e.vy = -220; e.vr = (Math.random() - .5) * 6;
    Sfx.pop();
    for (let i = 0; i < 6; i++) bits.push({ ch: i % 2 ? '✨' : '🥚', x: e.x + (Math.random() - .5) * e.r, y: e.y, vy: -200 - Math.random() * 200, life: 1, size: 18 + Math.random() * 14 });
    if (WORD && e.label === target) {                     // đúng chữ tiếp theo của từ
      pos++; Sfx.ding();
      bits.push({ ch: '🐣', x: e.x, y: e.y, vy: -320, life: 1.4, size: 52 });
      if (pos >= word[0].length) {
        lock = true; wordHUD();
        score++; addStar(2);
        const dots = $$('#eprog i', p); dots.forEach((d, k) => d.className = k < score ? 'done' : k === score ? 'now' : '');
        if (!(await celebrate(`${spellOut(word[0])}. ${word[0]}!`, `${word[0]} là ${word[2]}. Bé giỏi quá!`))) return;
        if (token !== Run.id) return;
        lock = false; return newTarget();
      }
      target = word[0][pos].toUpperCase();
      wordHUD(); fillEggs();
      Voice.stop(); Voice.speak(e.label, 'en-US', char().pitch, S.rate);
      return;
    }
    if (e.label === target) {
      lock = true;
      score++; addStar();
      const dots = $$('#eprog i', p); dots.forEach((d, k) => d.className = k < score ? 'done' : k === score ? 'now' : '');
      bits.push({ ch: '🐣', x: e.x, y: e.y, vy: -320, life: 1.6, size: 64 });
      if (!(await celebrate(`${nameOf(e.label)}! ${pick(PRAISE)}`))) return;
      if (token !== Run.id) return;
      lock = false; newTarget();
    } else {
      // trứng sai cũng rơi; app đọc tên để bé học, rồi thả một quả mới vào chỗ trống
      Sfx.oops();
      talk(`That is ${nameOf(e.label)}. Find ${nameOf(target)}!`, null, { noVi: true });
      setTimeout(() => {
        if (token !== Run.id) return;
        if (WORD) return fillEggs();
        let l; do { l = pick(pool); } while (eggs.some(x => !x.falling && x.label === l));
        eggs.push(spawn(l));
      }, 900);
    }
  }

  if (window.__test) window.__eggState = () => ({ eggs, target, score });
  area.addEventListener('pointerdown', ev => {
    if (lock || !target) return;
    const R0 = area.getBoundingClientRect(), x = ev.clientX - R0.left, y = ev.clientY - R0.top;
    const c = cannon();
    aim = Math.atan2(y - c.y, x - c.x);
    if (aim > -0.15) aim = -0.15; if (aim < -Math.PI + 0.15) aim = -Math.PI + 0.15;
    const sp = 1600;
    shots.push({ x: c.x + Math.cos(aim) * 70, y: c.y + Math.sin(aim) * 70, vx: Math.cos(aim) * sp, vy: Math.sin(aim) * sp });
    Sfx.tap();
  });

  function finish() {
    cancelAnimationFrame(raf);
    gameOver(p, pr);
  }

  const ro = new ResizeObserver(() => { if (token !== Run.id) return ro.disconnect(); resize(); eggs.forEach(e => { if (!e.falling) { e.baseY = laneY(e.lane); e.vx = laneV(e.lane); } }); });
  ro.observe(area);
  resize();
  (document.fonts ? document.fonts.load('800 40px "Baloo 2"') : Promise.resolve()).catch(() => {}).then(() => {
    if (token !== Run.id) return;
    newTarget();
    last = performance.now(); raf = requestAnimationFrame(step);
  });
};
