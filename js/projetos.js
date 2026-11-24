/* =====================================================================
   projetos.js — página Projetos, em forma de TABELA.
   Mostra as publicações da categoria "Projetos". As colunas extras
   (professores, turmas, título do projeto e status) são preenchidas
   no editor quando a categoria escolhida é Projetos.
   ===================================================================== */

let projetos = [];

function el(id) { return document.getElementById(id); }

// Tira acentos e deixa minúsculo, para a busca achar "robotica" em "Robótica".
function normalizar(texto) {
  return (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Cria uma célula <td>. "rotulo" aparece no celular, quando a tabela vira cartões.
function celula(rotulo, conteudo) {
  const td = document.createElement('td');
  td.dataset.rotulo = rotulo;
  if (typeof conteudo === 'string') td.textContent = conteudo || '—';
  else td.append(conteudo);
  return td;
}

// "Ana Silva\nPaulo Santos" → uma pessoa por linha (aceita também vírgula).
function emLinhas(texto) {
  const span = document.createElement('span');
  span.className = 'em-linhas';
  const itens = (texto || '').split(/\n|,/).map(t => t.trim()).filter(t => t);
  span.textContent = itens.length ? itens.join('\n') : '—';
  return span;
}

function seloSituacao(situacao) {
  const selo = document.createElement('span');
  selo.className = 'selo-situacao selo-' + (situacao || 'planejado');
  selo.textContent = Blog.situacoesProjeto[situacao] || 'Planejado';
  return selo;
}

function botaoDocumentos(p) {
  const link = document.createElement('a');
  link.className = 'botao botao-documentos';
  link.href = 'publicacao.html?id=' + encodeURIComponent(p.id);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#documento');
  svg.append(use);
  const texto = document.createElement('span');
  texto.textContent = 'Ver documentos';
  if (p.pdf) {
    const detalhe = document.createElement('small');
    detalhe.textContent = 'PDF e outros arquivos';
    texto.append(detalhe);
  }
  link.append(svg, texto);
  link.setAttribute('aria-label', 'Ver documentos do projeto ' + p.titulo);
  return link;
}

function desenharTabela() {
  const termo = normalizar(el('buscar-projeto').value);
  const situacao = el('filtrar-situacao').value;
  const lista = projetos.filter(p =>
    (!situacao || (p.situacaoProjeto || 'planejado') === situacao) &&
    normalizar([p.titulo, p.professores, p.turmas, p.tituloProjeto, p.resumo].join(' ')).includes(termo));

  const corpo = el('linhas-projetos');
  corpo.replaceChildren();
  lista.forEach(p => {
    const tr = document.createElement('tr');
    const nome = document.createElement('strong');
    nome.textContent = p.titulo;
    tr.append(
      celula('Nome do projeto', nome),
      celula('Professores', emLinhas(p.professores)),
      celula('Turma(s)', emLinhas(p.turmas)),
      celula('Título do projeto', p.tituloProjeto),
      celula('Status', seloSituacao(p.situacaoProjeto)),
      celula('Descrição', p.resumo),
      celula('Documentação', botaoDocumentos(p))
    );
    corpo.append(tr);
  });
  el('projetos-vazio').hidden = lista.length > 0;
  document.querySelector('.tabela-projetos-caixa').hidden = lista.length === 0;
}

async function carregarProjetos() {
  projetos = (await Blog.listar())
    .filter(p => p.categoria === 'Projetos')
    .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));   // ordem alfabética
  el('nota-projetos').hidden = !MODO_DEMO;
  desenharTabela();
}

el('buscar-projeto').addEventListener('input', desenharTabela);
el('filtrar-situacao').addEventListener('change', desenharTabela);
carregarProjetos();
