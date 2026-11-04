/* ================== GHÉP HÌNH KÉO THẢ (PUZZLE) ==================
   Khung ghép + hình mẫu; mảnh ghép răng cưa nằm ở khay bên ngoài, kéo vào đúng chỗ thì tự khớp. */

SCREENS.puzzleMenu = {
  title: () => '🧩 Ghép hình',
  full: true,
  render(p, pr) {
    let lv = pr.lv != null ? pr.lv : (S.puzzleLv || 0);
    S.puzzle = S.puzzle || {};
    const draw = () => {
      p.innerHTML = `<div class="row tabs pzlv">${PUZZLE_LEVELS.map((L, i) =>
        `<button class="btn ${i === lv ? 'sel' : ''}" data-lv="${i}">${L.vi} · ${L.n} mảnh</button>`).join('')}</div>
        <div class="pzgallery">${Array.from({ length: 10 }, (_, k) => {
          const sc = sceneURL(lv, k), done = S.puzzle[lv + '-' + k];
          return `<button class="pzthumb ${done ? 'done' : ''}" data-k="${k}"><img src="${sc.url}" alt=""><span>${esc(sc.title)}</span></button>`;
        }).join('')}</div>`;
      $$('[data-lv]', p).forEach(b => b.onclick = () => {
        Sfx.tap(); lv = +b.dataset.lv; S.puzzleLv = lv; save();
        history.replaceState({ name: 'puzzleMenu', params: { lv } }, ''); draw();
      });
      $$('[data-k]', p).forEach(b => b.onclick = () => { Sfx.tap(); go('puzzle', { lv, k: +b.dataset.k }); });
    };
    draw();
    talk('Pick a picture!', 'Bé chọn một bức tranh để ghép nhé!');
  }
};

/* Vẽ đường viền mảnh ghép có răng cưa. t = +1 lồi ra, -1 lõm vào, 0 phẳng */
function pieceEdge(ctx, x0, y0, x1, y1, t) {
  if (!t) { ctx.lineTo(x1, y1); return; }
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
  const ox = dy / len * t, oy = -dx / len * t;            // pháp tuyến hướng ra ngoài (đi theo chiều kim đồng hồ)
  const P = (a, h) => [x0 + dx * a + ox * h * len, y0 + dy * a + oy * h * len];
  ctx.lineTo(...P(0.34, 0));
  ctx.bezierCurveTo(...P(0.42, 0), ...P(0.30, 0.22), ...P(0.50, 0.23));
  ctx.bezierCurveTo(...P(0.70, 0.22), ...P(0.58, 0), ...P(0.66, 0));
  ctx.lineTo(x1, y1);
}

SCREENS.puzzle = {
  title: pr => `🧩 ${PUZZLE_LEVELS[pr.lv].n} mảnh`,
  full: true,
  render(p, pr) {
    const L = PUZZLE_LEVELS[pr.lv], sc = sceneURL(pr.lv, pr.k);
    const { cols, rows } = L, N = cols * rows;
    const token = Run.id;
    // răng cưa ngẫu nhiên nhưng khớp nhau giữa 2 mảnh kề
    const H = Array.from({ length: rows - 1 }, () => Array.from({ length: cols }, () => Math.random() < .5 ? 1 : -1));
    const V = Array.from({ length: rows }, () => Array.from({ length: cols - 1 }, () => Math.random() < .5 ? 1 : -1));
    const pieces = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pieces.push({
      r, c, placed: false, fx: Math.random(), fy: Math.random(),            // vị trí trong khay (tỉ lệ)
      edges: [r ? -H[r - 1][c] : 0, c < cols - 1 ? V[r][c] : 0, r < rows - 1 ? H[r][c] : 0, c ? -V[r][c - 1] : 0]
    });
    let ghost = true, placedN = 0, z = 10, geo = null, img = null, full = null;

    p.innerHTML = `<div class="pzbar">
        <img class="pzref" src="${sc.url}" alt="Hình mẫu">
        <div class="pzinfo"><b>${esc(sc.title)}</b><span id="pzcount">0 / ${N} mảnh</span></div>
        <button class="btn" id="pzghost">👁️ Hình mờ</button>
        <button class="btn" id="pzhint">💡 Gợi ý</button>
        <button class="btn" id="pzmix">🔀 Xáo lại</button>
      </div>
      <div class="pzarea" id="pzarea">
        <div class="pzboard" id="pzboard"><div class="pzghostimg" id="pzghostimg" style="background-image:url('${sc.url}')"></div><div class="pzhintbox" id="pzhintbox"></div></div>
        <div class="pztray" id="pztray"></div>
      </div>`;
    const area = $('#pzarea', p), board = $('#pzboard', p), tray = $('#pztray', p), countEl = $('#pzcount', p);

    /* Bố cục: khung bên trái + khay bên phải (màn ngang), hoặc khung trên + khay dưới (màn dọc) */
    function layout() {
      const W = area.clientWidth, Hh = area.clientHeight;
      if (!W || !Hh) return;
      const side = W > Hh * 1.15;
      const gap = 10;
      let bw, bh;
      const fit = (w, h) => { const s = Math.min(w / 4, h / 3); return [s * 4, s * 3]; };
      if (side) [bw, bh] = fit(W * 0.6 - gap, Hh - 16); else [bw, bh] = fit(W - 16, Hh * 0.52);
      const bx = side ? 8 : (W - bw) / 2, by = side ? (Hh - bh) / 2 : 8;
      const tr = side ? { x: bx + bw + gap, y: 4, w: W - bx - bw - gap - 4, h: Hh - 8 } : { x: 4, y: by + bh + gap, w: W - 8, h: Hh - by - bh - gap - 4 };
      Object.assign(board.style, { left: bx + 'px', top: by + 'px', width: bw + 'px', height: bh + 'px' });
      Object.assign(tray.style, { left: tr.x + 'px', top: tr.y + 'px', width: tr.w + 'px', height: tr.h + 'px' });
      const pw = bw / cols, ph = bh / rows, pad = Math.ceil(Math.max(pw, ph) * 0.25);
      geo = { bx, by, bw, bh, pw, ph, pad, tr };
      // ảnh gốc vẽ sẵn ở đúng kích thước khung
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      full = document.createElement('canvas'); full.width = Math.round(bw * dpr); full.height = Math.round(bh * dpr);
      full.getContext('2d').drawImage(img, 0, 0, full.width, full.height);
      pieces.forEach(pc => drawPiece(pc, dpr));
      pieces.forEach(placeEl);
    }

    function drawPiece(pc, dpr) {
      const { pw, ph, pad } = geo;
      const cw = pw + pad * 2, ch = ph + pad * 2;
      if (!pc.el) {
        pc.el = document.createElement('canvas'); pc.el.className = 'pzpiece';
        pc.z = ++z; pc.el.style.zIndex = pc.z;
        area.appendChild(pc.el);
      }
      const cv = pc.el;
      cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
      cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
      const x = cv.getContext('2d');
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.translate(pad, pad);
      const [t, rgt, b, l] = pc.edges;
      // hình dạng mảnh (dùng để vẽ và để biết ngón tay có chạm đúng vào mảnh không)
      const path = new Path2D(); path.moveTo(pad, pad);
      pieceEdge(path, pad, pad, pad + pw, pad, t); pieceEdge(path, pad + pw, pad, pad + pw, pad + ph, rgt);
      pieceEdge(path, pad + pw, pad + ph, pad, pad + ph, b); pieceEdge(path, pad, pad + ph, pad, pad, l);
      path.closePath();
      pc.path = path;
      x.translate(-pad, -pad);
      x.save(); x.clip(path);
      x.drawImage(full, pad - pc.c * pw, pad - pc.r * ph, geo.bw, geo.bh);
      x.restore();
      x.lineWidth = 2; x.strokeStyle = 'rgba(255,255,255,.9)'; x.stroke(path);
      x.lineWidth = 1; x.strokeStyle = 'rgba(59,47,92,.35)'; x.stroke(path);
    }

    const target = pc => [geo.bx + pc.c * geo.pw - geo.pad, geo.by + pc.r * geo.ph - geo.pad];
    function placeEl(pc) {
      let x, y;
      if (pc.placed) [x, y] = target(pc);
      else {
        const { tr, pw, ph, pad } = geo;
        x = tr.x + pc.fx * Math.max(0, tr.w - pw - pad * 2);
        y = tr.y + pc.fy * Math.max(0, tr.h - ph - pad * 2);
      }
      pc.x = x; pc.y = y;
      pc.el.style.transform = `translate(${x}px, ${y}px)`;
      pc.el.classList.toggle('placed', pc.placed);
    }

    /* Kéo thả: chọn mảnh nằm trên cùng mà ngón tay chạm đúng vào phần hình (bỏ qua phần trong suốt) */
    const hitCtx = document.createElement('canvas').getContext('2d');
    let drag = null;
    area.addEventListener('pointerdown', e => {
      if (!geo || drag) return;
      const R0 = area.getBoundingClientRect(), mx = e.clientX - R0.left, my = e.clientY - R0.top;
      const pc = pieces.filter(q => !q.placed).sort((a, b) => b.z - a.z)
        .find(q => hitCtx.isPointInPath(q.path, mx - q.x, my - q.y));
      if (!pc) return;
      e.preventDefault();
      try { area.setPointerCapture(e.pointerId); } catch (err) {}
      pc.z = ++z; pc.el.style.zIndex = pc.z; pc.el.classList.add('drag');
      drag = { pc, id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: pc.x, oy: pc.y };
      Sfx.tap();
    });
    area.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const pc = drag.pc;
      pc.x = drag.ox + e.clientX - drag.sx; pc.y = drag.oy + e.clientY - drag.sy;
      pc.el.style.transform = `translate(${pc.x}px, ${pc.y}px)`;
    });
    const up = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const pc = drag.pc; drag = null;
      pc.el.classList.remove('drag');
      const [tx, ty] = target(pc);
      if (Math.hypot(pc.x - tx, pc.y - ty) < Math.min(geo.pw, geo.ph) * 0.4) {
        pc.placed = true; pc.el.style.zIndex = 1; placeEl(pc);
        placedN++; countEl.textContent = `${placedN} / ${N} mảnh`;
        Sfx.pop();
        if (placedN === N) return finish();
        if (placedN % 5 === 0) talk(pick(PRAISE), null, { noVi: true });
      } else {
        // ghi nhớ vị trí mới trong khay (giữ khi xoay màn hình); kéo ra ngoài vùng chơi thì về lại khay
        const { tr, pw, ph, pad } = geo, W = area.clientWidth, Hh = area.clientHeight;
        if (pc.x < -pad || pc.y < -pad || pc.x > W - pw - pad || pc.y > Hh - ph - pad) placeEl(pc);
        else {
          pc.fx = Math.max(0, Math.min(1, (pc.x - tr.x) / Math.max(1, tr.w - pw - pad * 2)));
          pc.fy = Math.max(0, Math.min(1, (pc.y - tr.y) / Math.max(1, tr.h - ph - pad * 2)));
        }
      }
    };
    area.addEventListener('pointerup', up);
    area.addEventListener('pointercancel', up);

    async function finish() {
      (S.puzzle = S.puzzle || {})[pr.lv + '-' + pr.k] = true; save();
      board.classList.add('solved');
      Sfx.cheer(); confetti(100); addStar(L.n >= 40 ? 5 : 3);
      const done = document.createElement('div');
      done.className = 'pzdone';
      done.innerHTML = `<div class="row"><button class="btn big primary" id="pznext">➡️ Tranh tiếp</button><button class="btn big" id="pzback">🖼️ Chọn tranh</button></div>`;
      p.appendChild(done);
      $('#pznext', p).onclick = () => go('puzzle', { lv: pr.lv, k: (pr.k + 1) % 10 }, false);
      $('#pzback', p).onclick = () => history.back();
      await talk(`You did it! Look at ${sc.en}!`, `Bé ghép xong rồi! Giỏi quá!`);
    }

    $('#pzghost', p).onclick = e => { ghost = !ghost; $('#pzghostimg', p).style.opacity = ghost ? .28 : 0; e.currentTarget.classList.toggle('sel', ghost); };
    $('#pzghost', p).classList.add('sel');
    $('#pzhint', p).onclick = () => {
      const left = pieces.filter(q => !q.placed);
      if (!left.length) return;
      const pc = pick(left), hb = $('#pzhintbox', p);
      Object.assign(hb.style, { left: pc.c * geo.pw + 'px', top: pc.r * geo.ph + 'px', width: geo.pw + 'px', height: geo.ph + 'px' });
      hb.classList.remove('on'); void hb.offsetWidth; hb.classList.add('on');
      pc.z = ++z; pc.el.style.zIndex = pc.z; pc.el.classList.remove('hint'); void pc.el.offsetWidth; pc.el.classList.add('hint');
      Sfx.ding();
    };
    $('#pzmix', p).onclick = () => { Sfx.tap(); pieces.forEach(q => { if (!q.placed) { q.fx = Math.random(); q.fy = Math.random(); placeEl(q); } }); };

    img = new Image();
    img.onload = () => {
      if (token !== Run.id) return;
      layout();
      let t; new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => { if (token === Run.id) layout(); }, 150); }).observe(area);
    };
    img.src = sc.url;
    talk('Drag the pieces into the frame!', 'Bé kéo các mảnh vào khung cho đúng chỗ nhé!');
  }
};
