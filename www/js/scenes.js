/* ================== TRANH CHO GAME GHÉP HÌNH ==================
   Tranh gốc tự vẽ bằng SVG (800×600): khung cảnh + nhân vật của app + công chúa Hoa. */

/* Công chúa Hoa — nhân vật gốc */
const PRINCESS_SVG = () => `
<svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg">
  <path d="M70 120 Q60 250 95 300 L205 300 Q240 250 230 120 Z" fill="#f2b33d"/>
  <path d="M100 236 Q150 220 200 236 L250 350 Q150 372 50 350 Z" fill="#f48fb1"/>
  <path d="M85 300 Q150 318 215 300 L250 350 Q150 372 50 350 Z" fill="#ec6fa3"/>
  <path d="M75 330 Q150 345 225 330" stroke="#fff" stroke-width="5" fill="none" stroke-dasharray="2 14" stroke-linecap="round"/>
  <path d="M112 200 L188 200 L196 244 Q150 256 104 244 Z" fill="#f8bbd0"/>
  <circle cx="150" cy="222" r="7" fill="#fff59d" stroke="#f9a825" stroke-width="2"/>
  <path d="M112 212 Q80 240 84 276" stroke="#ffe0c7" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M188 212 Q220 240 216 276" stroke="#ffe0c7" stroke-width="16" fill="none" stroke-linecap="round"/>
  <rect x="139" y="182" width="22" height="22" fill="#ffe0c7"/>
  <circle cx="150" cy="128" r="66" fill="#ffe0c7"/>
  <path d="M84 132 Q80 58 150 56 Q222 58 216 132 Q206 92 176 84 Q160 104 132 100 Q140 88 136 82 Q100 92 84 132Z" fill="#f2b33d"/>
  <path d="M112 62 L124 30 L138 52 L150 22 L162 52 L176 30 L188 62 Z" fill="#ffd54f" stroke="#f9a825" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="150" cy="44" r="6" fill="#ec407a"/><circle cx="124" cy="46" r="4" fill="#4fc3f7"/><circle cx="176" cy="46" r="4" fill="#4fc3f7"/>
  <ellipse cx="126" cy="136" rx="9" ry="12" fill="#3b2f5c"/><ellipse cx="174" cy="136" rx="9" ry="12" fill="#3b2f5c"/>
  <circle cx="129" cy="131" r="3.5" fill="#fff"/><circle cx="177" cy="131" r="3.5" fill="#fff"/>
  <circle cx="108" cy="160" r="10" fill="#ff9eb5" opacity=".55"/><circle cx="192" cy="160" r="10" fill="#ff9eb5" opacity=".55"/>
  <path d="M136 164 Q150 178 164 164" stroke="#c2185b" stroke-width="5" fill="none" stroke-linecap="round"/>
</svg>`;

const SCENE_CHARS = {
  princess: { svg: PRINCESS_SVG, vi: 'Công chúa Hoa', en: 'the princess' },
  luna: { svg: () => CHARACTERS.luna.svg(), vi: 'Kỳ lân Luna', en: 'Luna the unicorn' },
  bong: { svg: () => CHARACTERS.bong.svg(), vi: 'Cún Bông', en: 'Bong the puppy' },
  mai: { svg: () => CHARACTERS.mai.svg(), vi: 'Bé Mai', en: 'Mai' }
};

/* đặt một nhân vật (300×360) vào tranh */
function placeChar(id, x, y, h, flip) {
  const w = h * 300 / 360;
  let s = SCENE_CHARS[id].svg().replace(/class="m-open"/g, 'class="m-open" style="display:none"');
  s = s.replace('<svg ', `<svg x="${flip ? 0 : x}" y="${y}" width="${w}" height="${h}" `);
  return flip ? `<g transform="translate(${x + w} 0) scale(-1 1)">${s}</g>` : s;
}

const R = (a, b) => a + Math.random() * (b - a);
const star = (x, y, r, c) => { let d = ''; for (let i = 0; i < 10; i++) { const a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * .45 : r; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1); } return `<path d="${d}Z" fill="${c}"/>`; };
const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff"><circle cx="0" cy="0" r="30"/><circle cx="35" cy="-15" r="38"/><circle cx="75" cy="0" r="30"/><rect x="0" y="0" width="75" height="30"/></g>`;
const flower = (x, y, c) => `<g transform="translate(${x} ${y})"><path d="M0 0 V30" stroke="#43a047" stroke-width="4"/>${[0, 72, 144, 216, 288].map(a => `<ellipse rx="8" ry="13" fill="${c}" transform="rotate(${a}) translate(0 -12)"/>`).join('')}<circle r="7" fill="#ffd54f"/></g>`;
const balloon = (x, y, c) => `<g><path d="M${x} ${y + 44} q8 40 -6 80" stroke="#888" stroke-width="2" fill="none"/><ellipse cx="${x}" cy="${y}" rx="30" ry="38" fill="${c}"/><ellipse cx="${x - 10}" cy="${y - 14}" rx="7" ry="11" fill="#fff" opacity=".5"/><path d="M${x - 6} ${y + 38} h12 l-6 8z" fill="${c}"/></g>`;

/* 10 khung cảnh — mỗi cái trả về [nền, tên tiếng Việt, tên tiếng Anh] */
const BACKGROUNDS = [
  () => [`<rect width="800" height="600" fill="#ffd6ec"/><rect width="800" height="380" fill="#c9e8ff"/>
    ${cloud(80, 90, 1)}${cloud(560, 60, .8)}
    <g fill="#f8bbd0" stroke="#ec6fa3" stroke-width="4"><rect x="470" y="170" width="250" height="230"/><rect x="440" y="120" width="70" height="280"/><rect x="680" y="120" width="70" height="280"/><rect x="560" y="90" width="70" height="200"/></g>
    <g fill="#ce93d8"><path d="M432 124 L475 50 L518 124Z"/><path d="M672 124 L715 50 L758 124Z"/><path d="M552 94 L595 20 L638 94Z"/></g>
    <path d="M560 400 V320 Q595 280 630 320 V400Z" fill="#8d6e63"/>${[470, 520, 570, 620, 670].map(x => `<rect x="${x}" y="150" width="30" height="22" fill="#f8bbd0" stroke="#ec6fa3" stroke-width="4"/>`).join('')}
    <rect x="583" y="180" width="24" height="34" rx="12" fill="#fff59d"/><rect x="460" y="230" width="20" height="30" rx="10" fill="#fff59d"/><rect x="700" y="230" width="20" height="30" rx="10" fill="#fff59d"/>
    <path d="M0 400 Q400 360 800 400 V600 H0Z" fill="#a5d6a7"/>${[60, 130, 210, 300, 380].map((x, i) => flower(x, 470 + (i % 2) * 40, ['#f06292', '#ffd54f', '#ba68c8'][i % 3])).join('')}`, 'Lâu đài', 'the castle'],
  () => [`<rect width="800" height="600" fill="#e1f5fe"/>
    ${['#ef5350', '#ffa726', '#ffee58', '#66bb6a', '#42a5f5', '#7e57c2'].map((c, i) => `<path d="M60 520 A340 340 0 0 1 740 520" stroke="${c}" stroke-width="34" fill="none" transform="translate(0 ${i * 34}) scale(1 ${1 - i * .03})"/>`).join('')}
    ${cloud(20, 470, 1.3)}${cloud(620, 470, 1.3)}${cloud(330, 120, .7)}
    <path d="M0 520 Q400 490 800 520 V600 H0Z" fill="#c5e1a5"/>${[star(120, 120, 18, '#ffd54f'), star(680, 160, 14, '#ffd54f'), star(250, 60, 10, '#fff')].join('')}`, 'Cầu vồng', 'the rainbow'],
  () => [`<rect width="800" height="600" fill="#b3e5fc"/><circle cx="680" cy="110" r="60" fill="#ffd54f"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<rect x="676" y="20" width="8" height="26" rx="4" fill="#ffca28" transform="rotate(${a} 680 110)"/>`).join('')}
    ${cloud(120, 100, .9)}<path d="M0 330 Q100 310 200 330 T400 330 T600 330 T800 330 V600 H0Z" fill="#29b6f6"/>
    <path d="M0 380 Q100 360 200 380 T400 380 T600 380 T800 380 V600 H0Z" fill="#0288d1"/>
    <path d="M0 520 Q400 470 800 520 V600 H0Z" fill="#ffe0b2"/>
    <g transform="translate(560 270)"><path d="M0 40 H140 L120 70 H20Z" fill="#8d6e63"/><path d="M68 40 V-40 L120 30Z" fill="#fff"/><path d="M68 -40 V40" stroke="#5d4037" stroke-width="5"/></g>
    ${[[120, 430, '#ff7043'], [260, 470, '#ffd54f'], [420, 440, '#ec407a']].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><ellipse rx="26" ry="15" fill="${c}"/><path d="M22 0 l18 -12 v24z" fill="${c}"/><circle cx="-12" cy="-4" r="4" fill="#fff"/><circle cx="-12" cy="-4" r="2" fill="#333"/></g>`).join('')}`, 'Bãi biển', 'the beach'],
  () => [`<rect width="800" height="600" fill="#dcedc8"/><rect width="800" height="330" fill="#fff9c4"/>
    ${[[80, 230, 90], [700, 220, 100], [600, 260, 70]].map(([x, y, r]) => `<rect x="${x - 12}" y="${y}" width="24" height="120" fill="#8d6e63"/><circle cx="${x}" cy="${y - 20}" r="${r}" fill="#66bb6a"/><circle cx="${x - 30}" cy="${y - 40}" r="8" fill="#ef5350"/><circle cx="${x + 25}" cy="${y - 10}" r="8" fill="#ef5350"/>`).join('')}
    <path d="M0 340 Q400 300 800 340 V600 H0Z" fill="#9ccc65"/>
    ${Array.from({ length: 22 }, (_, i) => flower(30 + (i * 37) % 760, 380 + (i * 53) % 200, ['#f06292', '#ffd54f', '#ba68c8', '#4fc3f7', '#ff8a65'][i % 5])).join('')}
    ${[[300, 120], [480, 90]].map(([x, y]) => `<g transform="translate(${x} ${y})"><ellipse cx="-12" cy="0" rx="14" ry="20" fill="#ff80ab" transform="rotate(-25)"/><ellipse cx="12" cy="0" rx="14" ry="20" fill="#ff80ab" transform="rotate(25)"/><rect x="-3" y="-14" width="6" height="28" rx="3" fill="#5d4037"/></g>`).join('')}`, 'Vườn hoa', 'the flower garden'],
  () => [`<rect width="800" height="600" fill="#1a1446"/>
    ${Array.from({ length: 60 }, (_, i) => `<circle cx="${(i * 137) % 800}" cy="${(i * 89) % 600}" r="${1 + (i % 3)}" fill="#fff" opacity="${.4 + (i % 5) / 8}"/>`).join('')}
    <circle cx="140" cy="140" r="70" fill="#ffb74d"/><ellipse cx="140" cy="140" rx="120" ry="24" fill="none" stroke="#ffe0b2" stroke-width="10" transform="rotate(-18 140 140)"/>
    <circle cx="690" cy="460" r="46" fill="#4fc3f7"/><circle cx="676" cy="446" r="12" fill="#81d4fa"/>
    <g transform="translate(620 110) rotate(30)"><path d="M0 -60 Q30 -30 30 30 H-30 Q-30 -30 0 -60Z" fill="#eceff1"/><circle cy="-10" r="12" fill="#4fc3f7" stroke="#90a4ae" stroke-width="4"/><path d="M-30 20 L-50 50 H-30Z M30 20 L50 50 H30Z" fill="#ef5350"/><path d="M-16 32 L0 70 L16 32Z" fill="#ffa726"/></g>
    ${star(300, 80, 16, '#ffd54f')}${star(520, 220, 12, '#fff59d')}${star(60, 420, 14, '#ffd54f')}
    <path d="M0 530 Q400 480 800 530 V600 H0Z" fill="#9575cd"/><circle cx="200" cy="560" r="14" fill="#7e57c2"/><circle cx="560" cy="550" r="20" fill="#7e57c2"/>`, 'Vũ trụ', 'space'],
  () => [`<rect width="800" height="600" fill="#fce4ec"/>
    ${[[90, 0], [250, 1], [580, 0], [720, 1]].map(([x, k]) => `<rect x="${x - 6}" y="230" width="12" height="190" fill="#fff"/><circle cx="${x}" cy="210" r="46" fill="${k ? '#81d4fa' : '#ff80ab'}"/><path d="M${x - 46} 210 A46 46 0 0 0 ${x + 46} 210" fill="none" stroke="#fff" stroke-width="10" stroke-dasharray="20 14"/>`).join('')}
    <path d="M0 420 Q100 380 200 420 T400 420 T600 420 T800 420 V600 H0Z" fill="#ffccbc"/>
    <path d="M0 460 Q100 430 200 460 T400 460 T600 460 T800 460 V600 H0Z" fill="#f8bbd0"/>
    ${[[120, 520, '#ffd54f'], [330, 540, '#a5d6a7'], [520, 520, '#b39ddb'], [700, 540, '#ffab91']].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><rect x="-26" y="-14" width="52" height="28" rx="14" fill="${c}"/><path d="M-26 0 l-16 -12 v24z M26 0 l16 -12 v24z" fill="${c}"/></g>`).join('')}
    ${cloud(300, 90, .8)}${cloud(480, 140, .6)}`, 'Vườn kẹo', 'candy land'],
  () => [`<rect width="800" height="600" fill="#283593"/><circle cx="640" cy="120" r="70" fill="#fff59d"/><circle cx="670" cy="100" r="62" fill="#283593"/>
    ${Array.from({ length: 30 }, (_, i) => star((i * 151) % 800, (i * 97) % 380, 4 + (i % 3) * 3, '#fff59d')).join('')}
    <path d="M0 420 Q200 360 400 420 T800 420 V600 H0Z" fill="#3949ab"/><path d="M0 480 Q400 440 800 480 V600 H0Z" fill="#1e2a78"/>
    <g transform="translate(110 330)"><rect width="120" height="100" fill="#ffcc80"/><path d="M-15 0 L60 -60 L135 0Z" fill="#e57373"/><rect x="45" y="40" width="30" height="60" fill="#8d6e63"/><rect x="12" y="20" width="24" height="24" fill="#fff59d"/><rect x="84" y="20" width="24" height="24" fill="#fff59d"/></g>
    ${[[360, 300], [480, 260], [300, 220]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#ffee58" opacity=".9"/><circle cx="${x}" cy="${y}" r="12" fill="#ffee58" opacity=".25"/>`).join('')}`, 'Đêm trăng', 'the moon night'],
  () => [`<rect width="800" height="600" fill="#cfe8fc"/>
    ${Array.from({ length: 50 }, (_, i) => `<circle cx="${(i * 131) % 800}" cy="${(i * 71) % 600}" r="${3 + (i % 4)}" fill="#fff"/>`).join('')}
    <path d="M0 400 Q400 340 800 400 V600 H0Z" fill="#fff"/><path d="M0 470 Q400 430 800 470 V600 H0Z" fill="#eef6ff"/>
    <g transform="translate(640 300)"><circle cy="90" r="60" fill="#fff" stroke="#cfd8dc" stroke-width="3"/><circle cy="10" r="42" fill="#fff" stroke="#cfd8dc" stroke-width="3"/><circle cx="-14" cy="0" r="5" fill="#333"/><circle cx="14" cy="0" r="5" fill="#333"/><path d="M0 12 l26 6 l-26 6z" fill="#ff7043"/><path d="M-34 36 Q0 56 34 36" stroke="#ef5350" stroke-width="12" fill="none"/><rect x="-28" y="-60" width="56" height="34" fill="#37474f"/><rect x="-40" y="-30" width="80" height="8" fill="#37474f"/></g>
    ${[[100, 330], [180, 360]].map(([x, y]) => `<path d="M${x} ${y} l-40 70 h80z" fill="#66bb6a"/><path d="M${x} ${y - 40} l-30 55 h60z" fill="#81c784"/><path d="M${x - 30} ${y + 15} h60 M${x - 22} ${y - 8} h44" stroke="#fff" stroke-width="6"/>`).join('')}`, 'Mùa đông', 'the snowy day'],
  () => [`<rect width="800" height="600" fill="#4dd0e1"/><rect width="800" height="600" fill="#006064" opacity=".25"/>
    ${Array.from({ length: 24 }, (_, i) => `<circle cx="${(i * 113) % 800}" cy="${(i * 67) % 520}" r="${4 + (i % 4) * 3}" fill="none" stroke="#e0f7fa" stroke-width="3" opacity=".8"/>`).join('')}
    <path d="M0 520 Q400 470 800 520 V600 H0Z" fill="#ffe082"/>
    ${[80, 140, 690, 740].map((x, i) => `<path d="M${x} 540 q-25 -60 0 -120 q25 -60 0 -120" stroke="#43a047" stroke-width="14" fill="none" stroke-linecap="round" opacity="${.8 + i * .05}"/>`).join('')}
    ${[[260, 150, '#ff7043', 1], [520, 110, '#ffd54f', -1], [620, 260, '#ec407a', -1]].map(([x, y, c, d]) => `<g transform="translate(${x} ${y}) scale(${d} 1)"><ellipse rx="34" ry="20" fill="${c}"/><path d="M30 0 l24 -16 v32z" fill="${c}"/><circle cx="-16" cy="-5" r="6" fill="#fff"/><circle cx="-16" cy="-5" r="3" fill="#333"/></g>`).join('')}
    <g transform="translate(420 540)"><path d="M-40 0 Q0 -50 40 0Z" fill="#ff8a80"/><circle cx="-20" cy="-14" r="5" fill="#fff"/></g>`, 'Dưới biển', 'under the sea'],
  () => [`<rect width="800" height="600" fill="#fff3e0"/>
    ${['#ef5350', '#42a5f5', '#66bb6a', '#ffca28', '#ab47bc', '#ff7043'].map((c, i) => `<path d="M${i * 140} 0 l70 60 l70 -60" fill="${c}"/>`).join('')}
    ${balloon(90, 170, '#ef5350')}${balloon(170, 130, '#42a5f5')}${balloon(650, 150, '#ffca28')}${balloon(720, 200, '#ab47bc')}
    <rect x="0" y="470" width="800" height="130" fill="#ffccbc"/>
    <g transform="translate(560 330)"><rect x="0" y="60" width="180" height="90" rx="10" fill="#f8bbd0"/><rect x="20" y="10" width="140" height="60" rx="10" fill="#fff59d"/><path d="M20 30 q35 20 70 0 q35 20 70 0" stroke="#fff" stroke-width="10" fill="none"/>${[50, 90, 130].map(x => `<rect x="${x - 5}" y="-26" width="10" height="36" fill="#4fc3f7"/><ellipse cx="${x}" cy="-34" rx="6" ry="10" fill="#ffa726"/>`).join('')}</g>
    ${Array.from({ length: 30 }, (_, i) => `<rect x="${(i * 97) % 800}" y="${100 + (i * 61) % 340}" width="10" height="14" fill="${['#ef5350', '#42a5f5', '#66bb6a', '#ffca28'][i % 4]}" transform="rotate(${i * 37} ${(i * 97) % 800} ${100 + (i * 61) % 340})"/>`).join('')}`, 'Tiệc sinh nhật', 'the birthday party']
];

/* Ai xuất hiện trong tranh: mỗi cấp độ ghép khác nhau để có tranh mới */
const CAST = [['princess'], ['luna'], ['princess', 'luna'], ['bong'], ['mai'], ['mai', 'bong'], ['luna', 'bong'], ['princess', 'mai'], ['luna', 'mai'], ['princess', 'bong']];

const PUZZLE_LEVELS = [
  { n: 20, cols: 5, rows: 4, vi: 'Dễ', en: 'Easy' },
  { n: 30, cols: 6, rows: 5, vi: 'Vừa', en: 'Medium' },
  { n: 40, cols: 8, rows: 5, vi: 'Khó', en: 'Hard' },
  { n: 50, cols: 10, rows: 5, vi: 'Siêu khó', en: 'Super' }
];

const _sceneCache = {};
function sceneInfo(lv, k) {
  const bgI = (k + lv * 3) % BACKGROUNDS.length;
  const cast = CAST[(k + lv * 7) % CAST.length];
  const [bg, place, placeEn] = BACKGROUNDS[bgI]();
  const names = cast.map(c => SCENE_CHARS[c].vi);
  return { bg, cast, title: `${names.join(' và ')} · ${place}`, en: `${cast.map(c => SCENE_CHARS[c].en).join(' and ')} at ${placeEn}` };
}
/* SVG tranh hoàn chỉnh (data URL) */
function sceneURL(lv, k) {
  const key = lv + '-' + k;
  if (_sceneCache[key]) return _sceneCache[key];
  const s = sceneInfo(lv, k);
  const chars = s.cast.length === 1
    ? placeChar(s.cast[0], 260, 170, 380)
    : placeChar(s.cast[0], 120, 200, 340) + placeChar(s.cast[1], 400, 190, 350, true);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">${s.bg}${chars}</svg>`;
  return (_sceneCache[key] = { url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), title: s.title, en: s.en });
}
