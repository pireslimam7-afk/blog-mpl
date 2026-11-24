/* Página da publicação: o parâmetro ?id= diz qual registro buscar no banco.
   O conteúdo muda conforme o TIPO: artigo, vídeo, enquete ou mural de fotos. */
const parametros = new URLSearchParams(location.search);
const idPublicacao = parametros.get('id') || 'feira-ciencias';

async function carregarPublicacao() {
  const noticia = await Blog.buscar(idPublicacao);
  // Rascunhos não aparecem para visitantes (o banco nem os envia).
  if (!noticia || noticia.status !== 'publicada') {
    document.querySelector('.grade-publicacao').hidden = true;
    document.querySelector('.caminho').hidden = true;
    document.querySelector('#publicacao-ausente').hidden = false;
    document.title = 'Publicação não encontrada | Blog MPL';
    return;
  }
  document.title = noticia.titulo + ' | Blog MPL';
  document.querySelector('#titulo-materia').textContent = noticia.titulo;
  document.querySelector('#titulo-caminho').textContent = noticia.titulo;
  document.querySelector('#resumo-materia').textContent = noticia.resumo;
  document.querySelector('#categoria-materia').textContent =
    noticia.tipo === 'artigo' ? noticia.categoria : noticia.categoria + ' · ' + Blog.tipos[noticia.tipo];
  document.querySelector('#autor-materia').textContent = noticia.autor;
  const categoria = document.querySelector('#categoria-caminho');
  categoria.textContent = noticia.categoria;
  categoria.href = Blog.enderecoCategoria(noticia.categoria);
  const data = document.querySelector('#data-materia');
  // Em eventos, mostra a data em que o evento acontece (e não a data da publicação).
  const dataMostrada = noticia.categoria === 'Eventos' && noticia.dataEvento ? noticia.dataEvento : noticia.data;
  data.dateTime = dataMostrada;
  const [ano,mes,dia] = dataMostrada.split('-').map(Number);
  data.textContent = new Date(ano,mes-1,dia).toLocaleDateString('pt-BR', {day:'numeric',month:'long',year:'numeric'});

  // Capa: no vídeo, o player do YouTube ocupa o lugar da imagem (como no YouTube).
  const figura = document.querySelector('.materia-capa');
  const idVideo = Blog.videoId(noticia.video || '');
  if (noticia.tipo === 'video' && idVideo) {
    figura.replaceChildren(criarPlayer(idVideo));
  } else if (noticia.tipo === 'mural') {
    figura.hidden = true; // no mural, as fotos aparecem logo abaixo, para votação
  } else {
    const imagem = document.querySelector('#imagem-materia');
    imagem.src = noticia.capa; imagem.alt = noticia.alt;
    document.querySelector('#legenda-materia').textContent = noticia.alt;
  }

  const texto = document.querySelector('#texto-materia');
  texto.replaceChildren();
  noticia.texto.forEach(paragrafo => {
    const p = document.createElement('p'); p.textContent = paragrafo; texto.append(p);
  });

  if (noticia.tipo === 'enquete') montarEnquete(noticia);
  if (noticia.tipo === 'mural') montarMural(noticia);
  montarComplementos(noticia, idVideo);
  montarRelacionadas(noticia);
}

function criarPlayer(idVideo) {
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/' + idVideo;
  iframe.title = 'Vídeo da publicação'; iframe.loading = 'lazy'; iframe.allowFullscreen = true;
  iframe.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.className = 'video-materia';
  return iframe;
}

/* ---------- ENQUETE: botões para votar → depois, barras com o resultado ---------- */
function contarVotos(votos) {
  const contagem = {};
  votos.forEach(v => { contagem[v.opcao] = (contagem[v.opcao] || 0) + 1; });
  return contagem;
}

async function montarEnquete(noticia) {
  const area = document.querySelector('#area-votacao');
  area.hidden = false;
  const lista = document.querySelector('#opcoes-votacao');
  lista.replaceChildren();
  lista.className = 'enquete';
  const votos = await Blog.votos(noticia.id);
  const contagem = contarVotos(votos);
  const votou = Blog.jaVotou(noticia.id);
  document.querySelector('#aviso-votacao').textContent = votou
    ? 'Obrigado por votar! Resultado parcial com ' + votos.length + ' voto(s):'
    : 'Escolha uma opção. Cada pessoa pode votar uma vez.';

  noticia.opcoes.forEach(opcao => {
    if (!votou) {
      const botao = document.createElement('button');
      botao.type = 'button'; botao.className = 'opcao-enquete'; botao.textContent = opcao;
      botao.addEventListener('click', () => registrarVoto(noticia, opcao, montarEnquete));
      lista.append(botao);
      return;
    }
    const quantidade = contagem[opcao] || 0;
    const porcentagem = votos.length ? Math.round(quantidade / votos.length * 100) : 0;
    const linha = document.createElement('div'); linha.className = 'resultado-enquete';
    const topo = document.createElement('p');
    const nome = document.createElement('span'); nome.textContent = opcao;
    const valor = document.createElement('strong'); valor.textContent = porcentagem + '% (' + quantidade + ')';
    topo.append(nome, valor);
    const barra = document.createElement('div'); barra.className = 'barra-enquete';
    const preenchida = document.createElement('div'); preenchida.style.width = porcentagem + '%';
    barra.append(preenchida); linha.append(topo, barra); lista.append(linha);
  });
}

/* ---------- MURAL: cada foto tem um botão de votar ---------- */
async function montarMural(noticia) {
  const area = document.querySelector('#area-votacao');
  area.hidden = false;
  document.querySelector('#titulo-votacao').textContent = 'Mural de fotos';
  const lista = document.querySelector('#opcoes-votacao');
  lista.replaceChildren();
  lista.className = 'mural';
  const contagem = contarVotos(await Blog.votos(noticia.id));
  const votou = Blog.jaVotou(noticia.id);
  document.querySelector('#aviso-votacao').textContent = votou
    ? 'Obrigado por votar! Veja como está a votação:'
    : 'Clique em "Votar" na sua foto favorita. Cada pessoa pode votar uma vez.';

  noticia.opcoes.forEach((foto, numero) => {
    const cartao = document.createElement('figure'); cartao.className = 'foto-mural';
    const img = document.createElement('img'); img.src = foto; img.alt = 'Foto ' + (numero + 1) + ' do mural'; img.loading = 'lazy';
    const legenda = document.createElement('figcaption');
    const total = document.createElement('span'); total.textContent = '♥ ' + (contagem[foto] || 0) + ' voto(s)';
    legenda.append(total);
    if (!votou) {
      const botao = document.createElement('button');
      botao.type = 'button'; botao.className = 'botao'; botao.textContent = 'Votar';
      botao.addEventListener('click', () => registrarVoto(noticia, foto, montarMural));
      legenda.append(botao);
    }
    cartao.append(img, legenda); lista.append(cartao);
  });
}

async function registrarVoto(noticia, opcao, atualizar) {
  try {
    await Blog.votar(noticia.id, opcao);
    atualizar(noticia);
  } catch (erro) {
    document.querySelector('#aviso-votacao').textContent = erro.message;
  }
}

/* ---------- Vídeo extra (em artigos) e PDF ---------- */
function montarComplementos(noticia, idVideo) {
  const secao = document.querySelector('.materia-complementos');
  const temVideoExtra = noticia.tipo !== 'video' && idVideo;
  if (!temVideoExtra && !noticia.pdf) { secao.hidden = true; return; }
  secao.querySelector('p').remove();
  if (temVideoExtra) secao.append(criarPlayer(idVideo));
  if (noticia.pdf) {
    const a = document.createElement('a'); a.className = 'botao botao-contorno';
    a.href = noticia.pdf; a.target = '_blank'; a.rel = 'noopener';
    a.download = 'material.pdf'; a.textContent = 'Baixar material em PDF'; secao.append(a);
  }
}

async function montarRelacionadas(noticia) {
  const lista = document.querySelector('#lista-relacionadas');
  lista.replaceChildren();
  const outras = (await Blog.listar()).filter(item => item.id !== noticia.id).slice(0, 6);
  // Sem outras publicações, a coluna lateral some e a matéria ocupa a largura toda.
  document.querySelector('.relacionadas').hidden = outras.length === 0;
  document.querySelector('.grade-publicacao').classList.toggle('sem-lateral', outras.length === 0);
  outras.forEach(item => {
    const link = document.createElement('a');
    link.className = 'cartao-relacionado';
    link.href = Blog.enderecoPublicacao(item);
    const img = document.createElement('img');
    img.src = item.capa; img.alt = ''; img.loading = 'lazy';
    const dados = document.createElement('span');
    const categoria = document.createElement('small'); categoria.textContent = item.categoria;
    const titulo = document.createElement('strong'); titulo.textContent = item.titulo;
    dados.append(categoria,titulo); link.append(img,dados); lista.append(link);
  });
}

carregarPublicacao();

// Menu de celular.
const botaoMenu = document.querySelector('.botao-menu');
botaoMenu.addEventListener('click', () => {
  const aberto = document.querySelector('.menu').classList.toggle('aberto');
  botaoMenu.setAttribute('aria-expanded', String(aberto));
  botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
});
// A pesquisa retorna à página inicial com os resultados.
document.querySelector('.abrir-busca').addEventListener('click', () => {
  const painel = document.querySelector('#painel-busca'); painel.hidden = !painel.hidden;
  document.querySelector('.abrir-busca').setAttribute('aria-expanded', String(!painel.hidden));
  if (!painel.hidden) document.querySelector('#termo-busca').focus();
});
document.querySelector('#painel-busca').addEventListener('submit', evento => {
  evento.preventDefault();
  const termo = document.querySelector('#termo-busca').value.trim();
  location.href = 'busca.html?q=' + encodeURIComponent(termo);
});
// Informações institucionais, enquanto a página Sobre não foi desenvolvida.
const janela = document.querySelector('#janela-conteudo');
let focoAnterior;
document.querySelectorAll('[data-abrir]').forEach(botao => botao.addEventListener('click', () => {
  focoAnterior = document.activeElement;
  const sobre = botao.dataset.abrir === 'sobre';
  document.querySelector('#titulo-janela').textContent = sobre ? 'Nossa escola, nossas histórias' : 'Equipe do blog';
  document.querySelector('#categoria-janela').textContent = 'Projeto dos alunos';
  const p = document.createElement('p');
  p.textContent = sobre ? 'O Blog MPL é um projeto dos alunos do CETI Maria Pires Lima para divulgar o cotidiano escolar. Os conteúdos e as imagens desta etapa são demonstrativos.' : 'A equipe desenvolverá o blog e organizará a produção e a revisão das matérias. O login e o painel editorial serão implementados nas próximas etapas.';
  document.querySelector('#texto-janela').replaceChildren(p);
  janela.showModal(); document.body.classList.add('janela-aberta');
  document.querySelector('.fechar-janela').focus();
}));
document.querySelector('.fechar-janela').addEventListener('click', () => janela.close());
janela.addEventListener('close', () => { document.body.classList.remove('janela-aberta'); focoAnterior?.focus(); });
