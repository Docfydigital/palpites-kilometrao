import './style.css';

const flag = (code) => `https://flagcdn.com/w80/${code}.png`;

const initialMatches = [
  { id: 'm1', side: 'left', a: ['Alemanha', 'de'], b: ['Paraguai', 'py'] },
  { id: 'm2', side: 'left', a: ['França', 'fr'], b: ['Suécia', 'se'] },
  { id: 'm3', side: 'left', a: ['África do Sul', 'za'], b: ['Canadá', 'ca'] },
  { id: 'm4', side: 'left', a: ['Holanda', 'nl'], b: ['Marrocos', 'ma'] },
  { id: 'm5', side: 'left', a: ['Portugal', 'pt'], b: ['Croácia', 'hr'] },
  { id: 'm6', side: 'left', a: ['Espanha', 'es'], b: ['Áustria', 'at'] },
  { id: 'm7', side: 'left', a: ['EUA', 'us'], b: ['Bósnia', 'ba'] },
  { id: 'm8', side: 'left', a: ['Bélgica', 'be'], b: ['Senegal', 'sn'] },
  { id: 'm9', side: 'right', a: ['Brasil', 'br'], b: ['Japão', 'jp'] },
  { id: 'm10', side: 'right', a: ['Irlanda', 'ie'], b: ['Noruega', 'no'] },
  { id: 'm11', side: 'right', a: ['México', 'mx'], b: ['Equador', 'ec'] },
  { id: 'm12', side: 'right', a: ['Inglaterra', 'gb-eng'], b: ['Congo', 'cd'] },
  { id: 'm13', side: 'right', a: ['Argentina', 'ar'], b: ['Cabo Verde', 'cv'] },
  { id: 'm14', side: 'right', a: ['Austrália', 'au'], b: ['Iraque', 'iq'] },
  { id: 'm15', side: 'right', a: ['Suíça', 'ch'], b: ['Argélia', 'dz'] },
  { id: 'm16', side: 'right', a: ['Colômbia', 'co'], b: ['Gana', 'gh'] },
];

const presets = {
  m1: 'Alemanha', m2: 'França', m3: 'Canadá', m4: 'Marrocos',
  m5: 'Portugal', m6: 'Espanha', m7: 'EUA', m8: 'Bélgica',
  m9: 'Brasil', m10: 'Noruega', m11: 'México', m12: 'Inglaterra',
  m13: 'Argentina', m14: 'Austrália', m15: 'Suíça'
};

const rounds = [16, 8, 4, 2, 1];
let state = loadState();

function defaultState() {
  return { picks: { ...presets } };
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem('kilometrao-bracket')) || defaultState();
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem('kilometrao-bracket', JSON.stringify(state));
}

function teamObj(name) {
  if (!name) return null;
  const found = initialMatches.flatMap(m => [m.a, m.b]).find(([n]) => n === name);
  return found ? { name: found[0], code: found[1] } : { name, code: '' };
}

function getRoundMatches(roundIndex) {
  if (roundIndex === 0) return initialMatches.map(m => ({ ...m, a: teamObj(m.a[0]), b: teamObj(m.b[0]) }));
  const prev = getRoundMatches(roundIndex - 1);
  const matches = [];
  for (let i = 0; i < prev.length; i += 2) {
    const a = teamObj(state.picks[matchKey(roundIndex - 1, i)]);
    const b = teamObj(state.picks[matchKey(roundIndex - 1, i + 1)]);
    matches.push({ id: matchKey(roundIndex, i / 2), side: i < prev.length / 2 ? 'left' : 'right', a, b });
  }
  return matches;
}

function matchKey(roundIndex, index) {
  if (roundIndex === 0) return initialMatches[index]?.id;
  return `r${roundIndex + 1}m${index + 1}`;
}

function clearDownstream(roundIndex, matchIndex) {
  for (let r = roundIndex + 1; r < rounds.length; r++) {
    const count = rounds[r];
    for (let i = 0; i < count; i++) delete state.picks[matchKey(r, i)];
  }
}

function choose(roundIndex, matchIndex, team) {
  const key = matchKey(roundIndex, matchIndex);
  state.picks[key] = team.name;
  clearDownstream(roundIndex, matchIndex);
  state.picks[key] = team.name;
  saveState();
  render();
}

function reset() {
  state = defaultState();
  saveState();
  render();
}

function clearAll() {
  state = { picks: {} };
  saveState();
  render();
}

function teamButton(team, selected, onClick, disabled) {
  if (!team) return `<button class="team empty" disabled><span>A definir</span></button>`;
  return `<button class="team ${selected ? 'selected' : ''}" ${disabled ? 'disabled' : ''} data-team="${team.name}">
    ${team.code ? `<img src="${flag(team.code)}" alt="${team.name}" loading="lazy" />` : ''}
    <span>${team.name}</span>
  </button>`;
}

function renderMatch(match, roundIndex, matchIndex) {
  const picked = state.picks[matchKey(roundIndex, matchIndex)];
  const disabled = !match.a || !match.b;
  return `<article class="match" data-round="${roundIndex}" data-index="${matchIndex}">
    ${teamButton(match.a, picked === match.a?.name, null, disabled)}
    ${teamButton(match.b, picked === match.b?.name, null, disabled)}
  </article>`;
}

function roundTitle(i) {
  return ['Fase 1', 'Oitavas', 'Quartas', 'Semifinal', 'Final'][i];
}

function champion() {
  return state.picks[matchKey(4, 0)];
}

function render() {
  const app = document.querySelector('#app');
  const champ = champion();
  const leftRounds = [0,1,2,3,4].map(i => getRoundMatches(i).slice(0, Math.ceil(getRoundMatches(i).length / 2)));
  const rightRounds = [0,1,2,3,4].map(i => getRoundMatches(i).slice(Math.ceil(getRoundMatches(i).length / 2)));
  app.innerHTML = `
    <main class="shell">
      <header class="hero glass">
        <div>
          <p class="eyebrow">Copa do Mundo • simulador de chave</p>
          <h1>Palpites do Kilometrão</h1>
          <p class="subtitle">Clique nos vencedores, avance até a final e tire print da chave.</p>
        </div>
        <div class="actions no-print">
          <button id="preset">base Filipe</button>
          <button id="clear">limpar</button>
          <button id="print">print</button>
        </div>
      </header>

      <section class="champion glass">
        <div class="trophy">🏆</div>
        <div>
          <span>Campeão</span>
          <strong>${champ || 'a definir'}</strong>
        </div>
      </section>

      <section class="mobile-hint no-print">Arraste para o lado para navegar pela chave completa.</section>

      <section class="bracket-wrap glass">
        <div class="bracket">
          ${renderSide(leftRounds, 'left')}
          <div class="center-line"><div></div></div>
          ${renderSide(rightRounds, 'right')}
        </div>
      </section>
    </main>`;

  document.querySelectorAll('.match').forEach(card => {
    const r = Number(card.dataset.round);
    const idx = Number(card.dataset.index);
    card.querySelectorAll('.team:not(.empty)').forEach(btn => {
      btn.onclick = () => choose(r, idx, teamObj(btn.dataset.team));
    });
  });
  document.querySelector('#preset').onclick = reset;
  document.querySelector('#clear').onclick = clearAll;
  document.querySelector('#print').onclick = () => window.print();
}

function renderSide(roundsData, side) {
  const globalStart = side === 'right' ? 8 : 0;
  return `<div class="side ${side}">
    ${roundsData.map((matches, roundIndex) => {
      const offset = roundIndex === 0 ? globalStart : side === 'right' ? Math.ceil(getRoundMatches(roundIndex).length / 2) : 0;
      return `<div class="round r${roundIndex}">
        <div class="round-title">${roundTitle(roundIndex)}</div>
        ${matches.map((m, i) => renderMatch(m, roundIndex, offset + i)).join('')}
      </div>`;
    }).join('')}
  </div>`;
}

render();
