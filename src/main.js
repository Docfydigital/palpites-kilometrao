import './style.css';
import { toPng } from 'html-to-image';

const flag = (code) => `https://flagcdn.com/w80/${code}.png`;
const rounds = [16, 8, 4, 2, 1];
const CANVAS = { w: 1780, h: 1120 };
const BOX = { w: 184, h: 78 };

const initialMatches = [
  { id: 'm1', a: ['Alemanha', 'de'], b: ['Paraguai', 'py'] },
  { id: 'm2', a: ['França', 'fr'], b: ['Suécia', 'se'] },
  { id: 'm3', a: ['África do Sul', 'za'], b: ['Canadá', 'ca'] },
  { id: 'm4', a: ['Holanda', 'nl'], b: ['Marrocos', 'ma'] },
  { id: 'm5', a: ['Portugal', 'pt'], b: ['Croácia', 'hr'] },
  { id: 'm6', a: ['Espanha', 'es'], b: ['Áustria', 'at'] },
  { id: 'm7', a: ['EUA', 'us'], b: ['Bósnia', 'ba'] },
  { id: 'm8', a: ['Bélgica', 'be'], b: ['Senegal', 'sn'] },
  { id: 'm9', a: ['Brasil', 'br'], b: ['Japão', 'jp'] },
  { id: 'm10', a: ['Irlanda', 'ie'], b: ['Noruega', 'no'] },
  { id: 'm11', a: ['México', 'mx'], b: ['Equador', 'ec'] },
  { id: 'm12', a: ['Inglaterra', 'gb-eng'], b: ['Congo', 'cd'] },
  { id: 'm13', a: ['Argentina', 'ar'], b: ['Cabo Verde', 'cv'] },
  { id: 'm14', a: ['Austrália', 'au'], b: ['Iraque', 'iq'] },
  { id: 'm15', a: ['Suíça', 'ch'], b: ['Argélia', 'dz'] },
  { id: 'm16', a: ['Colômbia', 'co'], b: ['Gana', 'gh'] },
];

let state = loadState();

function defaultState() { return { picks: {} }; }
function loadState() {
  try { return JSON.parse(localStorage.getItem('kilometrao-bracket')) || defaultState(); }
  catch { return defaultState(); }
}
function saveState() { localStorage.setItem('kilometrao-bracket', JSON.stringify(state)); }
function matchKey(roundIndex, index) { return roundIndex === 0 ? initialMatches[index]?.id : `r${roundIndex + 1}m${index + 1}`; }
function teamObj(name) {
  if (!name) return null;
  const found = initialMatches.flatMap(m => [m.a, m.b]).find(([n]) => n === name);
  return found ? { name: found[0], code: found[1] } : { name, code: '' };
}
function getRoundMatches(roundIndex) {
  if (roundIndex === 0) return initialMatches.map(m => ({ a: teamObj(m.a[0]), b: teamObj(m.b[0]) }));
  const prev = getRoundMatches(roundIndex - 1);
  const matches = [];
  for (let i = 0; i < prev.length; i += 2) {
    matches.push({
      a: teamObj(state.picks[matchKey(roundIndex - 1, i)]),
      b: teamObj(state.picks[matchKey(roundIndex - 1, i + 1)]),
    });
  }
  return matches;
}
function clearDownstream(roundIndex) {
  for (let r = roundIndex + 1; r < rounds.length; r++) {
    for (let i = 0; i < rounds[r]; i++) delete state.picks[matchKey(r, i)];
  }
}
function choose(roundIndex, matchIndex, team) {
  if (!team) return;
  const wrap = document.querySelector('.bracket-wrap');
  const keepLeft = wrap?.scrollLeft || 0;
  const key = matchKey(roundIndex, matchIndex);
  const current = state.picks[key];
  clearDownstream(roundIndex);
  if (current === team.name) delete state.picks[key];
  else state.picks[key] = team.name;
  saveState();
  render();
  requestAnimationFrame(() => {
    const next = document.querySelector('.bracket-wrap');
    if (next) next.scrollLeft = keepLeft;
  });
}
function clearAll() { state = { picks: {} }; saveState(); render(); }
function champion() { return state.picks[matchKey(4, 0)]; }
function roundTitle(i) { return ['Fase 1', 'Oitavas', 'Quartas', 'Semifinal', 'Final'][i]; }

function yPositions(count) {
  if (count === 8) return [88, 210, 332, 454, 576, 698, 820, 942];
  if (count === 4) return [149, 393, 637, 881];
  if (count === 2) return [271, 759];
  return [515];
}

function layoutNodes() {
  const nodes = [];
  const leftX = [32, 262, 492, 652];
  const rightX = [1564, 1334, 1104, 944];

  for (let r = 0; r < 4; r++) {
    const matches = getRoundMatches(r);
    const half = matches.length / 2;
    const ys = yPositions(half);
    for (let i = 0; i < half; i++) nodes.push({ r, i, x: leftX[r], y: ys[i], match: matches[i], side: 'left' });
    for (let i = half; i < matches.length; i++) nodes.push({ r, i, x: rightX[r], y: ys[i - half], match: matches[i], side: 'right' });
  }
  nodes.push({ r: 4, i: 0, x: 798, y: 450, match: getRoundMatches(4)[0], side: 'final' });
  return nodes;
}
function findNode(nodes, r, i) { return nodes.find(n => n.r === r && n.i === i); }
function center(n) { return { x: n.x + BOX.w / 2, y: n.y + BOX.h / 2 }; }
function edgeX(n, direction) {
  if (direction === 'out') return n.side === 'right' ? n.x : n.x + BOX.w;
  return n.side === 'right' ? n.x + BOX.w : n.x;
}
function pathBetween(a, b) {
  const ac = center(a);
  const bc = center(b);
  const ax = edgeX(a, 'out');
  const bx = edgeX(b, 'in');
  const mid = (ax + bx) / 2;
  return `M ${ax} ${ac.y} H ${mid} V ${bc.y} H ${bx}`;
}
function renderLines(nodes) {
  const paths = [];
  for (let r = 0; r < 4; r++) {
    for (let i = 0; i < rounds[r]; i++) {
      const from = findNode(nodes, r, i);
      const to = findNode(nodes, r + 1, Math.floor(i / 2));
      if (from && to) paths.push(`<path d="${pathBetween(from, to)}"/>`);
    }
  }
  return `<svg class="bracket-lines" viewBox="0 0 ${CANVAS.w} ${CANVAS.h}" aria-hidden="true">${paths.join('')}</svg>`;
}
function teamButton(team, selected, disabled) {
  if (!team) return `<button type="button" class="team empty" disabled><span>A definir</span></button>`;
  return `<button type="button" class="team ${selected ? 'selected' : ''}" ${disabled ? 'disabled' : ''} data-team="${team.name}">
    ${team.code ? `<img src="${flag(team.code)}" alt="${team.name}" loading="lazy" crossorigin="anonymous" />` : ''}
    <span>${team.name}</span>
  </button>`;
}
function renderNode(node) {
  const picked = state.picks[matchKey(node.r, node.i)];
  const disabled = !node.match.a || !node.match.b;
  return `<article class="match node ${node.side}" style="left:${node.x}px;top:${node.y}px" data-round="${node.r}" data-index="${node.i}">
    ${teamButton(node.match.a, picked === node.match.a?.name, disabled)}
    ${teamButton(node.match.b, picked === node.match.b?.name, disabled)}
  </article>`;
}
function renderLabels() {
  const labels = [
    ['Fase 1', 124], ['Oitavas', 354], ['Quartas', 584], ['Semi', 744], ['Final', 890],
    ['Semi', 1036], ['Quartas', 1196], ['Oitavas', 1426], ['Fase 1', 1656],
  ];
  return labels.map(([t, x]) => `<div class="phase-label" style="left:${x}px">${t}</div>`).join('');
}
async function downloadImage() {
  const node = document.querySelector('#bracket-capture');
  const button = document.querySelector('#download');
  if (!node || !button) return;
  const old = button.textContent;
  button.textContent = 'gerando...';
  button.disabled = true;
  try {
    const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2, backgroundColor: '#06150d', width: CANVAS.w, height: CANVAS.h });
    const link = document.createElement('a');
    link.download = `palpites-do-kilometrao-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    alert('Não consegui gerar a imagem neste navegador. Tente pelo Chrome.');
    console.error(err);
  } finally {
    button.textContent = old;
    button.disabled = false;
  }
}
function attachEvents() {
  document.querySelectorAll('.match').forEach(card => {
    const r = Number(card.dataset.round);
    const idx = Number(card.dataset.index);
    card.querySelectorAll('.team:not(.empty)').forEach(btn => {
      btn.onclick = () => choose(r, idx, teamObj(btn.dataset.team));
    });
  });
  document.querySelector('#clear').onclick = clearAll;
  document.querySelector('#download').onclick = downloadImage;
}
function render() {
  const nodes = layoutNodes();
  const champ = champion();
  document.querySelector('#app').innerHTML = `
    <main class="shell">
      <header class="hero glass">
        <div>
          <p class="eyebrow">Copa do Mundo • simulador de chave</p>
          <h1>Palpites do Kilometrão</h1>
          <p class="subtitle">Clique nos vencedores e siga o caminho até a final. No fim, baixe a imagem completa.</p>
        </div>
        <div class="actions no-print">
          <button id="clear">zerar</button>
          <button id="download">baixar imagem</button>
        </div>
      </header>

      <section class="champion glass">
        <div class="trophy">🏆</div>
        <div><span>Campeão</span><strong>${champ || 'a definir'}</strong></div>
      </section>

      <section class="mobile-hint no-print">Arraste para os lados para navegar pela chave completa.</section>
      <section class="bracket-wrap glass">
        <div class="bracket" id="bracket-capture">
          ${renderLines(nodes)}
          ${renderLabels()}
          ${nodes.map(renderNode).join('')}
          <div class="final-trophy">🏆</div>
          <div class="final-winner">${champ || 'Campeão a definir'}</div>
        </div>
      </section>
    </main>`;
  attachEvents();
}

render();
