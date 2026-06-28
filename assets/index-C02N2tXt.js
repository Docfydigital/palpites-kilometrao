(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=e=>`https://flagcdn.com/w80/${e}.png`,t=[{id:`m1`,side:`left`,a:[`Alemanha`,`de`],b:[`Paraguai`,`py`]},{id:`m2`,side:`left`,a:[`França`,`fr`],b:[`Suécia`,`se`]},{id:`m3`,side:`left`,a:[`África do Sul`,`za`],b:[`Canadá`,`ca`]},{id:`m4`,side:`left`,a:[`Holanda`,`nl`],b:[`Marrocos`,`ma`]},{id:`m5`,side:`left`,a:[`Portugal`,`pt`],b:[`Croácia`,`hr`]},{id:`m6`,side:`left`,a:[`Espanha`,`es`],b:[`Áustria`,`at`]},{id:`m7`,side:`left`,a:[`EUA`,`us`],b:[`Bósnia`,`ba`]},{id:`m8`,side:`left`,a:[`Bélgica`,`be`],b:[`Senegal`,`sn`]},{id:`m9`,side:`right`,a:[`Brasil`,`br`],b:[`Japão`,`jp`]},{id:`m10`,side:`right`,a:[`Irlanda`,`ie`],b:[`Noruega`,`no`]},{id:`m11`,side:`right`,a:[`México`,`mx`],b:[`Equador`,`ec`]},{id:`m12`,side:`right`,a:[`Inglaterra`,`gb-eng`],b:[`Congo`,`cd`]},{id:`m13`,side:`right`,a:[`Argentina`,`ar`],b:[`Cabo Verde`,`cv`]},{id:`m14`,side:`right`,a:[`Austrália`,`au`],b:[`Iraque`,`iq`]},{id:`m15`,side:`right`,a:[`Suíça`,`ch`],b:[`Argélia`,`dz`]},{id:`m16`,side:`right`,a:[`Colômbia`,`co`],b:[`Gana`,`gh`]}],n=[16,8,4,2,1],r=a();function i(){return{picks:{}}}function a(){try{return JSON.parse(localStorage.getItem(`kilometrao-bracket`))||i()}catch{return i()}}function o(){localStorage.setItem(`kilometrao-bracket`,JSON.stringify(r))}function s(e){if(!e)return null;let n=t.flatMap(e=>[e.a,e.b]).find(([t])=>t===e);return n?{name:n[0],code:n[1]}:{name:e,code:``}}function c(e){if(e===0)return t.map(e=>({...e,a:s(e.a[0]),b:s(e.b[0])}));let n=c(e-1),i=[];for(let t=0;t<n.length;t+=2){let a=s(r.picks[l(e-1,t)]),o=s(r.picks[l(e-1,t+1)]);i.push({id:l(e,t/2),side:t<n.length/2?`left`:`right`,a,b:o})}return i}function l(e,n){return e===0?t[n]?.id:`r${e+1}m${n+1}`}function u(e,t){for(let t=e+1;t<n.length;t++){let e=n[t];for(let n=0;n<e;n++)delete r.picks[l(t,n)]}}function d(e,t,n){let i=l(e,t),a=r.picks[i];u(e,t),a===n.name?delete r.picks[i]:r.picks[i]=n.name,o(),v()}function f(e){for(let t=0;t<n.length;t++){let i=n[t];for(let n=0;n<i;n++){let i=l(t,n);if(r.picks[i]===e){u(t,n),delete r.picks[i],o(),v();return}}}}function p(){r={picks:{}},o(),v()}function m(t,n,r,i){return t?`<button class="team ${n?`selected`:``}" ${i?`disabled`:``} data-team="${t.name}" draggable="true" title="Clique para escolher; clique de novo ou arraste para voltar">
    ${t.code?`<img src="${e(t.code)}" alt="${t.name}" loading="lazy" />`:``}
    <span>${t.name}</span>
  </button>`:`<button class="team empty" disabled><span>A definir</span></button>`}function h(e,t,n){let i=r.picks[l(t,n)],a=!e.a||!e.b;return`<article class="match" data-round="${t}" data-index="${n}" data-a="${e.a?.name||``}" data-b="${e.b?.name||``}">
    ${m(e.a,i===e.a?.name,null,a)}
    ${m(e.b,i===e.b?.name,null,a)}
  </article>`}function g(e){return[`Fase 1`,`Oitavas`,`Quartas`,`Semifinal`,`Final`][e]}function _(){return r.picks[l(4,0)]}function v(){let e=document.querySelector(`#app`),t=_(),n=[0,1,2,3,4].map(e=>c(e).slice(0,Math.ceil(c(e).length/2))),r=[0,1,2,3,4].map(e=>c(e).slice(Math.ceil(c(e).length/2)));e.innerHTML=`
    <main class="shell">
      <header class="hero glass">
        <div>
          <p class="eyebrow">Copa do Mundo • simulador de chave</p>
          <h1>Palpites do Kilometrão</h1>
          <p class="subtitle">Clique nos vencedores. Se errar, clique de novo ou arraste o país de volta para a chave.</p>
        </div>
        <div class="actions no-print">
          <button id="clear">zerar</button>
          <button id="print">print</button>
        </div>
      </header>

      <section class="champion glass">
        <div class="trophy">🏆</div>
        <div>
          <span>Campeão</span>
          <strong>${t||`a definir`}</strong>
        </div>
      </section>

      <section class="mobile-hint no-print">Arraste para o lado para navegar pela chave completa.</section>

      <section class="bracket-wrap glass">
        <div class="bracket">
          ${y(n,`left`)}
          <div class="center-line"><div></div></div>
          ${y(r,`right`)}
        </div>
      </section>
    </main>`,document.querySelectorAll(`.match`).forEach(e=>{let t=Number(e.dataset.round),n=Number(e.dataset.index);e.querySelectorAll(`.team:not(.empty)`).forEach(e=>{e.onclick=()=>d(t,n,s(e.dataset.team)),e.ondragstart=t=>{t.dataTransfer.setData(`text/plain`,e.dataset.team),t.dataTransfer.effectAllowed=`move`}}),e.ondragover=e=>{e.dataTransfer.types.includes(`text/plain`)&&e.preventDefault()},e.ondrop=t=>{t.preventDefault();let n=t.dataTransfer.getData(`text/plain`);n&&(e.dataset.a===n||e.dataset.b===n)&&f(n)}}),document.querySelector(`#clear`).onclick=p,document.querySelector(`#print`).onclick=()=>window.print()}function y(e,t){let n=t===`right`?8:0;return`<div class="side ${t}">
    ${e.map((e,r)=>{let i=r===0?n:t===`right`?Math.ceil(c(r).length/2):0;return`<div class="round r${r}">
        <div class="round-title">${g(r)}</div>
        ${e.map((e,t)=>h(e,r,i+t)).join(``)}
      </div>`}).join(``)}
  </div>`}v();