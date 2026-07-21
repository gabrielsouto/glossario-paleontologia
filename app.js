const CATS = {
  fosseis: { label: 'Fósseis', corVar: '--c-fosseis', bgVar: '--c-fosseis-bg' },
  processos: { label: 'Processos', corVar: '--c-processos', bgVar: '--c-processos-bg' },
  tempo: { label: 'Tempo', corVar: '--c-tempo', bgVar: '--c-tempo-bg' },
  disciplinas: { label: 'Disciplinas', corVar: '--c-disciplinas', bgVar: '--c-disciplinas-bg' }
};

const TERMS = [
  {"t":"Bioestratigrafia","meta":"escala geológica","cat":"tempo","d":"Uso da distribuição de fósseis para correlacionar e ordenar camadas de rocha."},
  {"t":"Contramolde","meta":"preservação e formação","cat":"processos","d":"Preenchimento de um molde que reproduz a forma do organismo."},
  {"t":"Coprolito","meta":"tipo de registro","cat":"fosseis","d":"Excremento fossilizado que pode registrar dieta e ambiente."},
  {"t":"Datação relativa","meta":"escala geológica","cat":"tempo","d":"Ordenação de eventos e rochas do mais antigo ao mais recente, sem atribuir idade numérica."},
  {"t":"Época","meta":"escala geológica","cat":"tempo","d":"Divisão de um período geológico."},
  {"t":"Era","meta":"escala geológica","cat":"tempo","d":"Divisão do tempo geológico composta por períodos."},
  {"t":"Fóssil","meta":"tipo de registro","cat":"fosseis","d":"Evidência de vida passada preservada em contexto geológico."},
  {"t":"Fóssil corporal","meta":"tipo de registro","cat":"fosseis","d":"Parte preservada de um organismo, como osso, dente, concha ou folha."},
  {"t":"Fóssil-guia","meta":"escala geológica","cat":"tempo","d":"Fóssil útil para correlacionar a idade relativa de camadas por sua distribuição temporal e geográfica."},
  {"t":"Fossilização","meta":"preservação e formação","cat":"processos","d":"Conjunto de processos pelos quais evidências de vida são preservadas no registro geológico."},
  {"t":"Icnofóssil","meta":"tipo de registro","cat":"fosseis","d":"Registro de atividade de um organismo, como pegada, toca ou trilha."},
  {"t":"Micropaleontologia","meta":"área de estudo","cat":"disciplinas","d":"Estudo de fósseis que geralmente exigem microscópio para análise."},
  {"t":"Molde","meta":"preservação e formação","cat":"processos","d":"Impressão negativa deixada quando o material original se dissolve ou desaparece."},
  {"t":"Paleobiologia","meta":"área de estudo","cat":"disciplinas","d":"Estudo da biologia de organismos do passado a partir do registro fóssil."},
  {"t":"Paleobotânica","meta":"área de estudo","cat":"disciplinas","d":"Estudo de plantas e vida vegetal fósseis."},
  {"t":"Paleoecologia","meta":"área de estudo","cat":"disciplinas","d":"Estudo das relações entre organismos antigos e seus ambientes."},
  {"t":"Paleontologia","meta":"área de estudo","cat":"disciplinas","d":"Estudo da vida em tempos geológicos passados com base no registro fóssil."},
  {"t":"Paleozoologia","meta":"área de estudo","cat":"disciplinas","d":"Estudo de animais fósseis."},
  {"t":"Período","meta":"escala geológica","cat":"tempo","d":"Divisão de uma era na escala do tempo geológico."},
  {"t":"Permineralização","meta":"preservação e formação","cat":"processos","d":"Preenchimento de espaços de restos orgânicos por minerais transportados pela água."},
  {"t":"Registro fóssil","meta":"tipo de registro","cat":"fosseis","d":"Conjunto de fósseis conhecidos e seu contexto nas rochas."},
  {"t":"Sedimento","meta":"preservação e formação","cat":"processos","d":"Material transportado e depositado que pode soterrar evidências de vida."},
  {"t":"Tafonomia","meta":"preservação e formação","cat":"processos","d":"Estudo do que ocorre com restos e vestígios desde a morte ou produção até sua descoberta."},
  {"t":"Tempo geológico","meta":"escala geológica","cat":"tempo","d":"Escala usada para organizar a longa história da Terra."}
];

function escapar(texto) {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizar(texto) {
  return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

function filtrarTermos(termos, { cat, query }) {
  const q = normalizar(query).trim();
  return termos.filter(item => {
    const bateCategoria = !cat || item.cat === cat;
    const conteudo = normalizar(`${item.t} ${item.meta} ${item.d}`);
    return bateCategoria && (!q || conteudo.includes(q));
  });
}

function contarPorCategoria(termos) {
  return Object.keys(CATS).reduce((acc, chave) => {
    acc[chave] = termos.filter(item => item.cat === chave).length;
    return acc;
  }, {});
}

function destacar(textoOriginal, query) {
  const q = String(query || '').trim();
  if (!q) return escapar(textoOriginal);
  const indice = String(textoOriginal).toLocaleLowerCase('pt-BR').indexOf(q.toLocaleLowerCase('pt-BR'));
  if (indice === -1) return escapar(textoOriginal);
  return `${escapar(textoOriginal.slice(0, indice))}<mark>${escapar(textoOriginal.slice(indice, indice + q.length))}</mark>${escapar(textoOriginal.slice(indice + q.length))}`;
}

if (typeof document !== 'undefined') {
  let categoriaAtiva = null;
  let termoBusca = '';
  const catNav = document.querySelector('#catNav');
  const resultsEl = document.querySelector('#results');
  const countEl = document.querySelector('#resultCount');
  const searchEl = document.querySelector('#search');
  const resetBtn = document.querySelector('#resetBtn');

  function montarNav() {
    const contagens = contarPorCategoria(TERMS);
    catNav.innerHTML = Object.entries(CATS).map(([chave, info]) => `
      <button class="cat-btn${categoriaAtiva === chave ? ' active' : ''}" type="button" data-cat="${chave}" aria-pressed="${categoriaAtiva === chave}">
        <span class="cat-dot" style="background:var(${info.corVar})"></span>${escapar(info.label)}<span class="cat-count">${contagens[chave]}</span>
      </button>
    `).join('');
  }

  function render() {
    montarNav();
    const filtrados = filtrarTermos(TERMS, { cat: categoriaAtiva, query: termoBusca });
    countEl.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'termo' : 'termos'}`;
    if (!filtrados.length) {
      resultsEl.innerHTML = '<p class="empty-state">Nenhum termo encontrado. Tente outra busca ou limpe o filtro de categoria.</p>';
      return;
    }

    const blocos = [];
    filtrados.forEach(item => {
      const letra = item.t[0].toLocaleUpperCase('pt-BR');
      const ultimo = blocos.at(-1);
      if (!ultimo || ultimo.letra !== letra) blocos.push({ letra, itens: [] });
      blocos.at(-1).itens.push(item);
    });

    resultsEl.innerHTML = blocos.map(bloco => `
      <h2 class="letter-heading">${escapar(bloco.letra)}</h2>
      <div class="grid">
        ${bloco.itens.map(item => {
          const info = CATS[item.cat];
          return `<article class="term-card">
            <div class="term-head">
              <span><span class="term-name">${destacar(item.t, termoBusca)}</span><span class="term-meta">${escapar(item.meta)}</span></span>
              <span class="chip" style="background:var(${info.bgVar});color:var(${info.corVar})">${escapar(info.label)}</span>
            </div>
            <p class="term-def">${destacar(item.d, termoBusca)}</p>
          </article>`;
        }).join('')}
      </div>
    `).join('');
  }

  catNav.addEventListener('click', event => {
    const botao = event.target.closest('[data-cat]');
    if (!botao) return;
    categoriaAtiva = categoriaAtiva === botao.dataset.cat ? null : botao.dataset.cat;
    render();
  });
  searchEl.addEventListener('input', event => { termoBusca = event.target.value; render(); });
  resetBtn.addEventListener('click', () => { categoriaAtiva = null; termoBusca = ''; searchEl.value = ''; render(); });
  render();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CATS, TERMS, escapar, normalizar, filtrarTermos, contarPorCategoria, destacar };
}
