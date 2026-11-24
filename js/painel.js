/* Painel da equipe de ADM: lista todas as publicações (inclusive rascunhos)
   e permite editar, publicar, retirar do blog e excluir. */
const filtroStatus = document.querySelector('#filtrar-status');
const filtroTitulo = document.querySelector('#filtrar-titulo');
const mensagemPainel = document.querySelector('#mensagem-painel');
let todasPublicacoes = [];

async function carregarPainel() {
  todasPublicacoes = await Blog.listar({todas: true});
  desenharPainel();
}

function desenharPainel() {
  const termo = filtroTitulo.value.toLowerCase();
  const lista = todasPublicacoes.filter(p =>
    (!filtroStatus.value || p.status === filtroStatus.value) && p.titulo.toLowerCase().includes(termo));

  // Indicadores no topo do painel
  const indicadores = document.querySelector('#indicadores-painel');
  indicadores.replaceChildren();
  for (const [rotulo, contar] of [
    ['Publicadas', p => p.status === 'publicada'], ['Rascunhos', p => p.status === 'rascunho'],
    ['Enquetes e murais', p => p.tipo === 'enquete' || p.tipo === 'mural'], ['Total', () => true]]) {
    const div = document.createElement('div'), num = document.createElement('strong'), nome = document.createElement('span');
    num.textContent = todasPublicacoes.filter(contar).length; nome.textContent = rotulo;
    div.append(num, nome); indicadores.append(div);
  }

  // Linhas da tabela
  const linhas = document.querySelector('#linhas-publicacoes');
  linhas.replaceChildren();
  document.querySelector('#painel-vazio').hidden = lista.length > 0;
  lista.forEach(p => {
    const tr = document.createElement('tr');
    for (const texto of [p.titulo, Blog.tipos[p.tipo], p.categoria, p.status === 'publicada' ? 'Publicada' : 'Rascunho']) {
      const td = document.createElement('td'); td.textContent = texto; tr.append(td);
    }
    const acoes = document.createElement('td'); acoes.className = 'acoes-tabela';

    const editar = document.createElement('a');
    editar.href = 'editor.html?id=' + encodeURIComponent(p.id); editar.textContent = 'Editar';
    acoes.append(editar);

    if (p.status === 'publicada') {
      const ver = document.createElement('a');
      ver.href = 'publicacao.html?id=' + encodeURIComponent(p.id); ver.textContent = 'Ver no blog';
      acoes.append(ver);
    }

    // Publicar / Retirar do blog: muda a situação sem apagar o conteúdo.
    const alternar = document.createElement('button'); alternar.type = 'button';
    alternar.textContent = p.status === 'publicada' ? 'Retirar do blog' : 'Publicar';
    alternar.addEventListener('click', () => executar(
      () => Blog.mudarStatus(p.id, p.status !== 'publicada'),
      p.status === 'publicada' ? 'A publicação voltou a rascunho.' : 'Publicação colocada no blog.'));
    acoes.append(alternar);

    // Excluir de vez, com confirmação.
    const excluir = document.createElement('button'); excluir.type = 'button';
    excluir.textContent = 'Excluir'; excluir.className = 'acao-perigo';
    excluir.addEventListener('click', () => {
      if (confirm('Excluir "' + p.titulo + '"?\nIsso apaga a publicação e os votos dela, e não pode ser desfeito.')) {
        executar(() => Blog.excluir(p.id), 'Publicação excluída.');
      }
    });
    acoes.append(excluir);

    tr.append(acoes); linhas.append(tr);
  });
}

// Roda uma ação no banco, mostra a mensagem e recarrega a tabela.
async function executar(acao, sucesso) {
  try { await acao(); mensagemPainel.textContent = sucesso; }
  catch (erro) { mensagemPainel.textContent = 'Erro: ' + erro.message; }
  carregarPainel();
}

filtroTitulo.addEventListener('input', desenharPainel);
filtroStatus.addEventListener('change', desenharPainel);
usuarioPronto.then(usuario => { if (usuario) carregarPainel(); });
