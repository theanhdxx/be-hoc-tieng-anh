/* Ba nhân vật gốc: Kỳ lân Luna, Cún Bông, Bé Mai.
   Mỗi SVG có: .bob (nhún), .eye (chớp mắt), .m-closed / .m-open (miệng), .tail (vẫy). */

const MOUTH = (cx, cy, w = 15) => `
  <g class="mouth">
    <path class="m-closed" d="M${cx - w} ${cy} Q${cx} ${cy + w * 0.95} ${cx + w} ${cy}" fill="none" stroke="#5a2a3a" stroke-width="5" stroke-linecap="round"/>
    <g class="m-open">
      <ellipse cx="${cx}" cy="${cy + 6}" rx="${w * 0.8}" ry="${w * 0.75}" fill="#6b2335"/>
      <ellipse cx="${cx}" cy="${cy + 12}" rx="${w * 0.5}" ry="${w * 0.32}" fill="#ff8aa6"/>
    </g>
  </g>`;

const EYE = (cx, cy, rx, ry, color) => `
  <g class="eye">
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}"/>
    <circle cx="${cx + rx * 0.35}" cy="${cy - ry * 0.4}" r="${rx * 0.38}" fill="#fff"/>
    <circle cx="${cx - rx * 0.3}" cy="${cy + ry * 0.35}" r="${rx * 0.16}" fill="#fff" opacity=".8"/>
  </g>`;

const CHARACTERS = {
  luna: {
    id: 'luna', name: 'Luna', vi: 'Kỳ lân Luna', species: 'unicorn',
    pitch: 1.35, rate: 1.0, color: '#b388ff',
    svg: () => `
<svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hornG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe066"/><stop offset="1" stop-color="#ffb300"/>
    </linearGradient>
  </defs>
  <g class="bob">
    <g class="tail">
      <path d="M222 280 C275 250 290 300 262 330" stroke="#ff9ecf" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M226 290 C268 275 276 315 250 340" stroke="#9fd7ff" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M224 300 C258 300 262 330 240 348" stroke="#c9a7ff" stroke-width="10" fill="none" stroke-linecap="round"/>
    </g>
    <rect x="95" y="300" width="26" height="50" rx="13" fill="#fff" stroke="#e8def8" stroke-width="3"/>
    <rect x="180" y="300" width="26" height="50" rx="13" fill="#fff" stroke="#e8def8" stroke-width="3"/>
    <rect x="95" y="336" width="26" height="16" rx="8" fill="#c9a7ff"/>
    <rect x="180" y="336" width="26" height="16" rx="8" fill="#c9a7ff"/>
    <ellipse cx="150" cy="285" rx="82" ry="52" fill="#fff" stroke="#e8def8" stroke-width="3"/>
    <path d="M118 120 L100 62 L140 100 Z" fill="#fff" stroke="#e8def8" stroke-width="3"/>
    <path d="M182 120 L200 62 L160 100 Z" fill="#fff" stroke="#e8def8" stroke-width="3"/>
    <path d="M112 106 L104 78 L126 98 Z" fill="#ffc6e2"/>
    <path d="M188 106 L196 78 L174 98 Z" fill="#ffc6e2"/>
    <ellipse cx="150" cy="168" rx="86" ry="80" fill="#fff" stroke="#e8def8" stroke-width="3"/>
    <polygon points="150,22 134,100 166,100" fill="#ffd23f" stroke="#f0a500" stroke-width="2"/>
    <path d="M140 80 L160 72 M138 90 L162 82 M144 62 L157 57" stroke="#f0a500" stroke-width="3"/>
    <circle cx="112" cy="100" r="22" fill="#ff9ecf"/>
    <circle cx="90" cy="120" r="20" fill="#c9a7ff"/>
    <circle cx="76" cy="146" r="18" fill="#9fd7ff"/>
    <circle cx="72" cy="172" r="16" fill="#ffe08a"/>
    <circle cx="132" cy="96" r="16" fill="#9fd7ff"/>
    ${EYE(118, 160, 14, 18, '#4a2a7a')}
    ${EYE(182, 160, 14, 18, '#4a2a7a')}
    <path d="M100 146 l-9 -6 M104 140 l-6 -9" stroke="#4a2a7a" stroke-width="3" stroke-linecap="round"/>
    <path d="M200 146 l9 -6 M196 140 l6 -9" stroke="#4a2a7a" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="150" cy="210" rx="50" ry="34" fill="#ffeaf4"/>
    <ellipse cx="134" cy="200" rx="5" ry="4" fill="#e59ab9"/>
    <ellipse cx="166" cy="200" rx="5" ry="4" fill="#e59ab9"/>
    <circle class="cheek" cx="92" cy="196" r="13" fill="#ffb3d1" opacity=".7"/>
    <circle class="cheek" cx="208" cy="196" r="13" fill="#ffb3d1" opacity=".7"/>
    ${MOUTH(150, 218, 13)}
  </g>
</svg>`
  },

  bong: {
    id: 'bong', name: 'Bong', vi: 'Cún Bông', species: 'puppy',
    pitch: 1.55, rate: 1.05, color: '#ffb74d',
    svg: () => `
<svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg">
  <g class="bob">
    <g class="tail"><path d="M222 285 C258 270 262 240 250 225" stroke="#c98b55" stroke-width="18" fill="none" stroke-linecap="round"/></g>
    <ellipse cx="150" cy="290" rx="78" ry="54" fill="#f6e3c3"/>
    <ellipse cx="150" cy="300" rx="45" ry="36" fill="#fff6e8"/>
    <ellipse cx="108" cy="342" rx="24" ry="14" fill="#f6e3c3" stroke="#e2c79f" stroke-width="3"/>
    <ellipse cx="192" cy="342" rx="24" ry="14" fill="#f6e3c3" stroke="#e2c79f" stroke-width="3"/>
    <path d="M92 236 Q150 262 208 236 L212 252 Q150 282 88 252 Z" fill="#ffd54f" stroke="#f9a825" stroke-width="3"/>
    <path d="M168 258 l22 36 l-30 -6 Z" fill="#ffd54f" stroke="#f9a825" stroke-width="3"/>
    <ellipse cx="66" cy="168" rx="30" ry="64" fill="#a0673c" transform="rotate(18 66 168)"/>
    <ellipse cx="234" cy="168" rx="30" ry="64" fill="#a0673c" transform="rotate(-18 234 168)"/>
    <circle cx="150" cy="160" r="86" fill="#f6e3c3"/>
    <ellipse cx="190" cy="148" rx="32" ry="30" fill="#d39a64"/>
    <path d="M128 78 Q150 64 172 78 Q150 92 128 78" fill="#d39a64"/>
    ${EYE(114, 150, 13, 15, '#2f1b10')}
    ${EYE(188, 150, 13, 15, '#2f1b10')}
    <ellipse cx="150" cy="198" rx="48" ry="34" fill="#fff6e8"/>
    <path d="M136 180 Q150 172 164 180 Q160 194 150 196 Q140 194 136 180Z" fill="#3a2418"/>
    <ellipse cx="146" cy="180" rx="4" ry="2.5" fill="#fff" opacity=".7"/>
    <circle class="cheek" cx="98" cy="190" r="12" fill="#ffab91" opacity=".6"/>
    <circle class="cheek" cx="202" cy="190" r="12" fill="#ffab91" opacity=".6"/>
    ${MOUTH(150, 208, 12)}
  </g>
</svg>`
  },

  mai: {
    id: 'mai', name: 'Mai', vi: 'Bé Mai', species: 'little girl',
    pitch: 1.3, rate: 1.0, color: '#ff8a80',
    svg: () => `
<svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg">
  <g class="bob">
    <rect x="118" y="318" width="22" height="34" rx="10" fill="#ffdcbc"/>
    <rect x="160" y="318" width="22" height="34" rx="10" fill="#ffdcbc"/>
    <ellipse cx="128" cy="350" rx="18" ry="9" fill="#e53935"/>
    <ellipse cx="172" cy="350" rx="18" ry="9" fill="#e53935"/>
    <g class="tail">
      <path d="M112 248 Q76 270 70 300" stroke="#ffdcbc" stroke-width="20" fill="none" stroke-linecap="round"/>
      <circle cx="70" cy="302" r="13" fill="#ffdcbc"/>
    </g>
    <path d="M188 248 Q224 270 230 300" stroke="#ffdcbc" stroke-width="20" fill="none" stroke-linecap="round"/>
    <circle cx="230" cy="302" r="13" fill="#ffdcbc"/>
    <path d="M118 236 L182 236 L222 326 Q150 340 78 326 Z" fill="#ffd54f" stroke="#f9a825" stroke-width="3"/>
    <path d="M128 236 Q150 256 172 236" fill="#fff" stroke="#f9a825" stroke-width="3"/>
    <circle cx="150" cy="282" r="6" fill="#ff8a65"/><circle cx="150" cy="304" r="6" fill="#ff8a65"/>
    <rect x="138" y="214" width="24" height="26" fill="#ffdcbc"/>
    <circle cx="82" cy="82" r="32" fill="#2b2b3a"/>
    <circle cx="218" cy="82" r="32" fill="#2b2b3a"/>
    <path d="M98 66 l-12 -18 l20 6 Z M202 66 l12 -18 l-20 6 Z" fill="#e53935"/>
    <circle cx="150" cy="148" r="80" fill="#ffdcbc"/>
    <ellipse cx="72" cy="158" rx="12" ry="16" fill="#ffcba4"/>
    <ellipse cx="228" cy="158" rx="12" ry="16" fill="#ffcba4"/>
    <path d="M68 150 Q66 62 150 60 Q234 62 232 150 Q222 112 198 104 Q190 120 170 118 Q174 104 166 100 Q150 124 122 120 Q130 108 126 100 Q96 110 68 150Z" fill="#2b2b3a"/>
    ${EYE(122, 160, 10, 13, '#2b2b3a')}
    ${EYE(178, 160, 10, 13, '#2b2b3a')}
    <path d="M110 140 Q122 134 132 140 M168 140 Q178 134 190 140" stroke="#2b2b3a" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle class="cheek" cx="100" cy="186" r="13" fill="#ff9e9e" opacity=".55"/>
    <circle class="cheek" cx="200" cy="186" r="13" fill="#ff9e9e" opacity=".55"/>
    <path d="M147 172 Q150 178 153 172" stroke="#e0a07a" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${MOUTH(150, 192, 13)}
  </g>
</svg>`
  }
};
