import './style.css';
import { toPng } from 'html-to-image';

const flag = (code) => `https://flagcdn.com/w80/${code}.png`;
const sideRoundIndexes = [0, 1, 2, 3];
const rounds = [16, 8, 4, 2, 1];

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

function defaultState() {
  return { picks: {} };
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

function matchKey(roundIndex, index) {
  if (roundIndex === 0) return initialMatches[index]?.id;
  return `r${roundIndex + 1}m${index + 1}`;
}

function teamObj(name) {
  if (!name) return null;
  const found = initialMatches.flatMap(m => [m.a, m.b]).find(([n]) => n === name);
  return found ? { name: found[0], code: found[1] } : { name, code: '' };
}

function getRoundMatches(roundIndex) {
  if (roundIndex === 0) {
    return initialMatches.map(m => ({ a: teamObj(m.a[0]), b: teamObj(m.b[0]) }));
  }
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
  const key = matchKey(roundIndex, matchIndex);
  const current = state.picks[key];
  clearDownstream(roundIndex);
  if (current === team.name) delete state.picks[key];
  else state.picks[key] = team.name;
  saveState();
  render();
}

function undoTeam(teamName) {
  for (let r = 0; r < rounds.length; r++) {
    for (let i = 0; i < rounds[r]; i++) {
      const key = matchKey(r, i);
      if (state.picks[key] === teamName) {
        clearDownstream(r);
        delete state.picks[key];
        saveState();
        render();
        return;
      }
    }
  }
}

function clearAll() {
  state = { picks: {} };
  saveState();
  render();
}

function roundTitle(i) {
  return ['Fase 1', 'Oitavas', 'Quartas', 'Semifinal', 'Final'][i];
}

function champion() {
  return state.picks[matchKey(4, 0)];
}

function teamButton(team, selected, disabled) {
  if (!team) return `<button type="button" class="team empty" disabled><span>A definir</span></button>`;
  return `<button type="button" class="team ${selected ? 'selected' : ''}" ${disabled ? 'disabled' : ''} data-team="${team.name}" draggable="true">
    ${team.code ? `<img src="${flag(team.code)}" alt="${team.name}" loading="lazy" crossorigin="anonymous" />` : ''}
    <span>${team.name}</span>
  </button>`;
}

function renderMatch(match, roundIndex, matchIndex) {
  const picked = state.picks[matchKey(roundIndex, matchIndex)];
  const disabled = !match.a || !match.b;
  return `<article class="match" data-round="${roundIndex}" data-index="${matchIndex}" data-a="${match.a?.name || ''}" data-b="${match.b?.name || ''}">
    ${teamButton(match.a, picked === match.a?.name, disabled)}
    ${teamButton(match.b, picked === match.b?.name, disabled)}
  </article>`;
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

function renderMobileRound(roundIndex) {
  const matches = getRoundMatches(roundIndex);
  return `<section class="mobile-round">
    <h2>${roundTitle(roundIndex)}</h2>
    <div class="mobile-round-grid">
      ${matches.map((m, i) => renderMatch(m, roundIndex, i)).join('')}
    </div>
  </section>`;
}

async function downloadImage() {
  const node = document.querySelector('#bracket-capture');
  const button = document.querySelector('#download');
  if (!node || !button) return;
  const oldText = button.textContent;
  button.textContent = 'gerando...';
  button.disabled = true;
  try {
    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#06150d',
      width: node.scrollWidth,
      height: node.scrollHeight,
      style: {
        transform: 'none',
        width: `${node.scrollWidth}px`,
        height: `${node.scrollHeight}px`,
      },
    });
    const link = document.createElement('a');
    link.download = `palpites-do-kilometrao-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    alert('Não consegui gerar a imagem neste navegador. Tente pelo Chrome.');
    console.error(error);
  } finally {
    button.textContent = oldText;
    button.disabled = false;
  }
}

function attachEvents() {
  document.querySelectorAll('.match').forEach(card => {
    const r = Number(card.dataset.round);
    const idx = Number(card.dataset.index);
    card.querySelectorAll('.team:not(.empty)').forEach(btn => {
      btn.onclick = () => choose(r, idx, teamObj(btn.dataset.team));
      btn.ondragstart = (event) => {
        event.dataTransfer.setData('text/plain', btn.dataset.team);
        event.dataTransfer.effectAllowed = 'move';
      };
    });
    card.ondragover = (event) => {
      if (event.dataTransfer.types.includes('text/plain')) event.preventDefault();
    };
    card.ondrop = (event) => {
      event.preventDefault();
      const teamName = event.dataTransfer.getData('text/plain');
      if (teamName && (card.dataset.a === teamName || card.dataset.b === teamName)) undoTeam(teamName);
    };
  });
  document.querySelector('#clear').onclick = clearAll;
  document.querySelector('#download').onclick = downloadImage;
}

function render() {
  const app = document.querySelector('#app');
  const champ = champion();
  const leftRounds = sideRoundIndexes.map(i => getRoundMatches(i).slice(0, Math.ceil(getRoundMatches(i).length / 2)));
  const rightRounds = sideRoundIndexes.map(i => getRoundMatches(i).slice(Math.ceil(getRoundMatches(i).length / 2)));
  const finalMatch = getRoundMatches(4)[0];

  app.innerHTML = `
    <main class="shell">
      <header class="hero glass">
        <div>
          <p class="eyebrow">Copa do Mundo • simulador de chave</p>
          <h1>Palpites do Kilometrão</h1>
          <p class="subtitle">Clique nos vencedores. Se errar, clique de novo ou arraste o país de volta. No fim, baixe a imagem completa.</p>
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

      <section class="mobile-editor glass">
        <p class="mobile-editor-note">No celular, os palpites ficam por fase para não cortar nem desalinha. A imagem baixada sai como chave completa.</p>
        ${[0, 1, 2, 3, 4].map(renderMobileRound).join('')}
      </section>

      <section class="mobile-hint desktop-only no-print">Arraste para o lado para navegar pela chave completa.</section>
      <section class="bracket-wrap glass">
        <div class="bracket" id="bracket-capture">
          ${renderSide(leftRounds, 'left')}
          <div class="final-column">
            <div class="round-title">Final</div>
            ${renderMatch(finalMatch, 4, 0)}
            <div class="final-trophy">🏆</div>
            <div class="final-winner">${champ || 'Campeão a definir'}</div>
          </div>
          ${renderSide(rightRounds, 'right')}
        </div>
      </section>
    </main>`;

  attachEvents();
}

render();
