/* Editor da equipe de ADM: cria ou edita uma publicação.
   editor.html          → nova publicação
   editor.html?id=NUM   → editar a publicação NUM */
const form = document.querySelector('#form-editor');
const mensagem = document.querySelector('#mensagem-editor');
const idEdicao = new URLSearchParams(location.search).get('id');
let existente = null;   // a publicação que está sendo editada (ou null)
let fotosDoMural = [];  // links das fotos que o mural JÁ tem (ao editar)

function campo(id) { return document.querySelector('#' + id); }

/* ---------- Mostra só os campos do tipo escolhido ---------- */
function mostrarCamposDoTipo() {
  const tipo = campo('tipo').value;
  document.querySelectorAll('.campo-tipo').forEach(bloco => {
    bloco.hidden = !bloco.dataset.tipos.split(' ').includes(tipo);
  });
  // Só o artigo exige texto; nos outros tipos ele é uma descrição opcional.
  campo('texto').required = tipo === 'artigo';
  campo('rotulo-texto').textContent = tipo === 'artigo' ? 'Conteúdo *' : 'Descrição (opcional)';
}
campo('tipo').addEventListener('change', mostrarCamposDoTipo);

/* ---------- Campos extras: data (Eventos) e tabela (Projetos) ---------- */
function mostrarCamposDaCategoria() {
  const ehEvento = campo('categoria').value === 'Eventos';
  campo('campo-data-evento').hidden = !ehEvento;
  campo('data-evento').required = ehEvento;
  // Campos da tabela de Projetos
  campo('campos-projeto').hidden = campo('categoria').value !== 'Projetos';
}
campo('categoria').addEventListener('change', mostrarCamposDaCategoria);

/* ---------- Prévia da capa ---------- */
function atualizarPreviaCapa() {
  const arquivo = campo('capa-arquivo').files[0];
  campo('previa-capa').src = arquivo ? URL.createObjectURL(arquivo)
    : (campo('imagem').value || existente?.imagem || 'imagens/escola.png');
}
campo('imagem').addEventListener('change', () => { campo('capa-arquivo').value = ''; atualizarPreviaCapa(); });
campo('capa-arquivo').addEventListener('change', atualizarPreviaCapa);

/* ---------- Preenche o formulário ao editar ---------- */
async function carregarEdicao() {
  if (!idEdicao) { mostrarCamposDoTipo(); mostrarCamposDaCategoria(); return; }
  existente = await Blog.buscar(idEdicao);
  if (!existente) {
    form.hidden = true;
    campo('titulo-editor').textContent = 'Publicação não encontrada';
    return;
  }
  campo('titulo-editor').textContent = 'Editar publicação';
  campo('tipo').value = existente.tipo;
  campo('titulo').value = existente.titulo;
  campo('resumo').value = existente.resumo;
  campo('categoria').value = existente.categoria;
  campo('alt').value = existente.alt;
  campo('data-evento').value = existente.dataEvento || '';
  campo('titulo-projeto').value = existente.tituloProjeto || '';
  campo('situacao-projeto').value = existente.situacaoProjeto || 'planejado';
  campo('professores').value = existente.professores || '';
  campo('turmas').value = existente.turmas || '';
  campo('texto').value = existente.texto.join('\n\n');
  if (existente.tipo === 'video') campo('video').value = existente.video;
  if (existente.tipo === 'artigo') campo('video-extra').value = existente.video;
  if (existente.tipo === 'enquete') campo('opcoes').value = existente.opcoes.join('\n');
  if (existente.tipo === 'mural') { fotosDoMural = [...existente.opcoes]; desenharFotosAtuais(); }
  campo('pdf-atual').textContent = existente.pdf ? 'Há um PDF anexado.' : 'Nenhum PDF anexado.';
  if (['imagens/muda.png', 'imagens/escola.png'].includes(existente.imagem)) campo('imagem').value = existente.imagem;
  mostrarCamposDoTipo();
  mostrarCamposDaCategoria();
  atualizarPreviaCapa();
}

/* ---------- MURAL: fotos atuais (com botão Remover) e prévia das novas ----------
   Ao editar, as fotos novas são ACRESCENTADAS às que o mural já tem.
   Os votos ficam guardados pelo link de cada foto, então não se perdem. */
function miniatura(src, legenda, aoRemover) {
  const fig = document.createElement('figure');
  const img = document.createElement('img');
  img.src = src; img.alt = legenda;
  fig.append(img);
  if (aoRemover) {
    const botao = document.createElement('button');
    botao.type = 'button'; botao.textContent = 'Remover';
    botao.setAttribute('aria-label', 'Remover ' + legenda);
    botao.addEventListener('click', aoRemover);
    fig.append(botao);
  }
  return fig;
}

function desenharFotosAtuais() {
  const area = campo('fotos-atuais');
  area.replaceChildren();
  fotosDoMural.forEach((link, i) => area.append(miniatura(link, 'Foto ' + (i + 1), () => {
    if (confirm('Remover esta foto do mural? Os votos dela deixam de aparecer.')) {
      fotosDoMural.splice(i, 1);
      desenharFotosAtuais();
    }
  })));
  const titulo = campo('titulo-fotos-atuais');
  titulo.hidden = !existente || existente.tipo !== 'mural';
  titulo.textContent = 'Fotos que o mural já tem: ' + fotosDoMural.length;
}

campo('fotos').addEventListener('change', () => {
  const area = campo('fotos-novas');
  area.replaceChildren();
  [...campo('fotos').files].forEach(f => area.append(miniatura(URL.createObjectURL(f), 'Nova: ' + f.name)));
  if (campo('fotos').files.length) {
    const aviso = document.createElement('p');
    aviso.className = 'titulo-fotos';
    aviso.textContent = campo('fotos').files.length + ' foto(s) nova(s) serão acrescentadas ao salvar.';
    area.prepend(aviso);
  }
});

/* ---------- Confere os arquivos antes de enviar ---------- */
function conferirArquivo(arquivo, tipos, limiteMB) {
  if (!tipos.test(arquivo.type)) throw Error('Formato não aceito: ' + arquivo.name);
  if (arquivo.size > limiteMB * 1024 * 1024) throw Error(arquivo.name + ' passa de ' + limiteMB + ' MB.');
}
const IMAGENS = /^image\/(png|jpeg|webp)$/;

/* ---------- Salvar (rascunho ou publicar) ---------- */
form.addEventListener('submit', async evento => {
  evento.preventDefault();
  const status = evento.submitter?.value || 'rascunho';
  const tipo = campo('tipo').value;
  const podeTerPdf = tipo === 'artigo' || tipo === 'video';
  const botoes = form.querySelectorAll('button');

  // Monta a publicação no formato usado pelas páginas (veja dados.js).
  const publicacao = {
    id: existente?.id,
    tipo,
    titulo: campo('titulo').value.trim(),
    resumo: campo('resumo').value.trim(),
    categoria: campo('categoria').value,
    alt: campo('alt').value.trim(),
    texto: campo('texto').value.trim().split(/\n\s*\n/).filter(t => t.trim()),
    imagem: campo('imagem').value || existente?.imagem || '',
    video: tipo === 'video' ? campo('video').value.trim() : tipo === 'artigo' ? campo('video-extra').value.trim() : '',
    pdf: (tipo === 'artigo' || tipo === 'video') && !campo('remover-pdf').checked ? existente?.pdf || '' : '',
    opcoes: existente?.tipo === tipo ? existente.opcoes : [],
    status,
    autor: existente?.autor || 'Equipe do blog',
    dataEvento: campo('categoria').value === 'Eventos' ? campo('data-evento').value : ''
  };
  // Dados da tabela de Projetos (só nessa categoria)
  const ehProjeto = publicacao.categoria === 'Projetos';
  publicacao.tituloProjeto = ehProjeto ? campo('titulo-projeto').value.trim() : '';
  publicacao.situacaoProjeto = ehProjeto ? campo('situacao-projeto').value : '';
  publicacao.professores = ehProjeto ? campo('professores').value.trim() : '';
  publicacao.turmas = ehProjeto ? campo('turmas').value.trim() : '';
  // Se escolheu uma capa da lista, ela substitui a capa enviada antes.
  if (campo('imagem').value) publicacao.imagem = campo('imagem').value;

  try {
    // Verificações simples de cada tipo
    if (!publicacao.titulo || !publicacao.resumo || !publicacao.alt) throw Error('Preencha título, resumo e descrição da imagem.');
    if (publicacao.categoria === 'Eventos' && !publicacao.dataEvento) throw Error('Informe a data do evento.');
    if (tipo === 'artigo' && publicacao.texto.length === 0) throw Error('Escreva o conteúdo do artigo.');
    if (publicacao.video && !Blog.videoId(publicacao.video)) throw Error('Informe um link válido de vídeo do YouTube (https://...).');
    if (tipo === 'video' && !publicacao.video) throw Error('Cole o link do vídeo do YouTube.');
    if (tipo === 'enquete') {
      publicacao.opcoes = campo('opcoes').value.split('\n').map(t => t.trim()).filter(t => t);
      if (publicacao.opcoes.length < 2) throw Error('A enquete precisa de pelo menos 2 opções.');
    }
    const fotos = [...campo('fotos').files];
    if (tipo === 'mural') publicacao.opcoes = [...fotosDoMural];
    if (tipo === 'mural' && fotos.length === 0 && publicacao.opcoes.length === 0) throw Error('Escolha as fotos do mural.');

    const capa = campo('capa-arquivo').files[0];
    const pdf = campo('pdf').files[0];
    // Fotos de celular podem ser grandes: aceitamos até 20 MB, pois o navegador reduz antes de enviar.
    if (capa) conferirArquivo(capa, IMAGENS, 20);
    fotos.forEach(f => conferirArquivo(f, IMAGENS, 20));
    if (pdf && podeTerPdf) conferirArquivo(pdf, /^application\/pdf$/, 5);

    // Envia os arquivos (Storage) e guarda os links na publicação.
    botoes.forEach(b => b.disabled = true);
    mensagem.textContent = 'Salvando... aguarde.';
    if (capa) publicacao.imagem = await Blog.enviarArquivo(capa);
    if (pdf && podeTerPdf) publicacao.pdf = await Blog.enviarArquivo(pdf);
    // Mural: as fotos novas vão para o FINAL da lista (as antigas continuam).
    for (let i = 0; tipo === 'mural' && i < fotos.length; i++) {
      mensagem.textContent = 'Enviando foto ' + (i + 1) + ' de ' + fotos.length + '...';
      publicacao.opcoes.push(await Blog.enviarArquivo(fotos[i]));
    }

    await Blog.salvar(publicacao);
    location.href = 'painel.html';
  } catch (erro) {
    mensagem.textContent = erro.message;
    botoes.forEach(b => b.disabled = false);
  }
});

/* ---------- Prévia do texto ---------- */
const previa = document.querySelector('#previa-editor');
campo('visualizar-editor').addEventListener('click', () => {
  campo('previa-titulo').textContent = campo('titulo').value || 'Título da publicação';
  campo('previa-resumo').textContent = campo('resumo').value;
  const texto = campo('previa-texto'); texto.replaceChildren();
  campo('texto').value.split(/\n\s*\n/).forEach(t => { const p = document.createElement('p'); p.textContent = t; texto.append(p); });
  previa.showModal();
});
document.querySelector('.fechar-previa').addEventListener('click', () => previa.close());

usuarioPronto.then(usuario => { if (usuario) carregarEdicao(); });
