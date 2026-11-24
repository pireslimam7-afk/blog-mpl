/* Interações da página inicial. As publicações vêm do banco de dados
   por meio de Blog.listar() (arquivo dados.js). */


/* Slides do banner de boas-vindas.
   "video" (opcional): link de um vídeo ou Short do YouTube, no lugar da imagem.
   "videoHorizontal" (opcional): versão deitada do vídeo, usada em telas grandes.
   O vídeo começa sem som. Para trocar o vídeo, é só trocar o link. */

/* ESTILO DOS VÍDEOS DA PÁGINA INICIAL — troque a palavra para mudar o visual:
   'recorte' → o vídeo ocupa toda a área da foto (no computador mostra só uma
               faixa do vídeo; escolha qual faixa em ENQUADRAMENTO, abaixo)
   'celular' → o vídeo aparece dentro de um celular, no banner
   'cinema'  → banner escuro, com o vídeo em destaque
   'vitrine' → o banner volta a ter a foto e os vídeos ficam numa faixa
               "Vídeos da escola", logo abaixo (abrem numa janela na própria página) */
const ESTILO_VIDEO = 'recorte';

/* O link do vídeo e o ENQUADRAMENTO ficam em js/video.js
   (o mesmo vídeo aparece no banner e na página Sobre). */

/* Vídeos da faixa "Vídeos da escola" (usada no estilo 'vitrine').
   Para acrescentar um vídeo, copie uma linha e troque o título e o link. */
const videosEscola = [
  {titulo: 'Tour pela escola', link: VIDEO_BOAS_VINDAS}
];
const slides = [
  {titulo: 'BEM-VINDOS AO\nBLOG MPL!', texto: 'Espaço para compartilhar ideias,\nconquistas e histórias.', botao: 'Saiba mais', imagem: 'imagens/escola.png', alt: 'Imagem ilustrativa de uma escola com jardim', acao: 'sobre',
   video: VIDEO_BOAS_VINDAS, tituloVideo: 'Tour pela escola'},
  {titulo: 'SAÚDE E BEM-ESTAR\nNA COMUNIDADE ESCOLAR', texto: 'Conheça as campanhas e os projetos\nque fazem parte da vida escolar.', botao: 'Explore Saúde', imagem: 'imagens/muda.png', alt: 'Imagem ilustrativa de uma muda verde', acao: 'Saúde'},
  {titulo: 'CULTURA, ARTE\nE CRIATIVIDADE NA ESCOLA', texto: 'Produções e expressões culturais\nda nossa comunidade.', botao: 'Explore Cultura', imagem: 'imagens/escola.png', alt: 'Imagem ilustrativa do ambiente escolar', acao: 'Cultura e Entretenimento'}
];
let slideAtual = 0;
let publicacoes = [];   // preenchida no final do arquivo, ao carregar do banco
let listaAtual = [];
let noticiaAtual = 0;
const janela = document.querySelector('#janela-conteudo');
let focoAnterior;

function abrirJanela(titulo, categoria, paragrafos, imagem, alt) {
  focoAnterior = document.activeElement;
  document.querySelector('#titulo-janela').textContent = titulo;
  document.querySelector('#categoria-janela').textContent = categoria;
  const corpo = document.querySelector('#texto-janela');
  corpo.replaceChildren();
  if (imagem) {
    const img = document.createElement('img');
    img.src = imagem; img.alt = alt;
    corpo.append(img);
  }
  paragrafos.forEach(texto => {
    const p = document.createElement('p');
    p.textContent = texto;
    corpo.append(p);
  });
  janela.showModal();
  document.body.classList.add('janela-aberta');
  document.querySelector('.fechar-janela').focus();
}

function abrirInformacoes(tipo) {
  if (tipo === 'sobre') {
    abrirJanela('Nossa escola, nossas histórias', 'Sobre o blog', [
      'O Blog MPL é uma proposta de espaço produzido pelos alunos do CETI Maria Pires Lima para compartilhar notícias, eventos, projetos e conquistas.',
      'Esta página inicial é um protótipo didático. Os textos e as imagens são ilustrativos. A turma poderá substituir os exemplos por conteúdos próprios e desenvolver as demais páginas.',
      'A imagem da escola é uma ilustração e não uma fotografia do CETI Maria Pires Lima.'
    ]);
  } else {
    abrirJanela('Equipe do blog', 'Projeto dos alunos', [
      'A equipe pode se organizar em redação, edição, design, programação e implantação.',
      'Acrescentem aqui os nomes dos participantes e as responsabilidades de cada integrante.',
      'O login e o painel de publicação serão desenvolvidos nas próximas etapas. Este protótipo não cadastra usuários nem publica matérias na internet.'
    ]);
  }
}

document.querySelectorAll('[data-abrir]').forEach(botao => botao.addEventListener('click', () => abrirInformacoes(botao.dataset.abrir)));
document.querySelector('.fechar-janela').addEventListener('click', () => janela.close());
janela.addEventListener('close', () => {
  document.body.classList.remove('janela-aberta');
  focoAnterior?.focus();
});

function mostrarNoticia() {
  const existe = listaAtual.length > 0;
  document.querySelector('.noticia-destaque').hidden = !existe;
  document.querySelector('.sem-resultados').hidden = existe;
  if (!existe) return;
  const noticia = listaAtual[noticiaAtual];
  document.querySelector('#titulo-noticia').textContent = noticia.titulo;
  const endereco = Blog.enderecoPublicacao(noticia);   // eventos abrem na página de Eventos
  document.querySelector('#titulo-noticia').href = endereco;
  document.querySelector('#ler-noticia').href = endereco;
  document.querySelector('#resumo-noticia').textContent = noticia.resumo;
  const imagem = document.querySelector('#capa-noticia');
  imagem.src = noticia.capa; imagem.alt = noticia.alt;
  document.querySelectorAll('.voltar-noticia, .avancar-noticia').forEach(b => b.disabled = listaAtual.length <= 1);
}
function mudarNoticia(direcao) {
  if (!listaAtual.length) return;
  noticiaAtual = (noticiaAtual + direcao + listaAtual.length) % listaAtual.length;
  mostrarNoticia();
}
document.querySelector('.voltar-noticia').addEventListener('click', () => mudarNoticia(-1));
document.querySelector('.avancar-noticia').addEventListener('click', () => mudarNoticia(1));

function filtrarCategoria(categoria) {
  listaAtual = publicacoes.filter(n => n.categoria === categoria);
  noticiaAtual = 0;
  document.querySelector('#titulo-destaques').textContent = categoria;
  document.querySelector('#limpar-filtro').hidden = false;
  mostrarNoticia();
}
document.querySelectorAll('[data-categoria]').forEach(link => link.addEventListener('click', () => {
  filtrarCategoria(link.dataset.categoria);
  fecharMenu();
}));
document.querySelector('#limpar-filtro').addEventListener('click', () => {
  listaAtual = [...publicacoes]; noticiaAtual = 0;
  document.querySelector('#titulo-destaques').textContent = 'Em destaque';
  document.querySelector('#limpar-filtro').hidden = true;
  document.querySelector('#resultado-busca').textContent = '';
  mostrarNoticia();
});

function mostrarSlide(indice) {
  slideAtual = (indice + slides.length) % slides.length;
  const s = slides[slideAtual];
  const titulo = document.querySelector('#titulo-apresentacao');
  titulo.textContent = s.titulo;
  titulo.style.whiteSpace = 'pre-line';
  const texto = document.querySelector('#texto-apresentacao');
  texto.textContent = s.texto; texto.style.whiteSpace = 'pre-line';
  document.querySelector('#acao-apresentacao').textContent = s.botao;
  const img = document.querySelector('.apresentacao-imagem img');
  img.src = s.imagem; img.alt = s.alt;
  mostrarVideoBanner(s);
  document.querySelectorAll('[data-slide]').forEach((botao,i) => {
    botao.classList.toggle('selecionado', i === slideAtual);
    botao.setAttribute('aria-pressed', String(i === slideAtual));
  });
}
/* =====================================================================
   VÍDEO DO BANNER
   - Telas grandes: o vídeo ocupa toda a área da imagem, na horizontal.
     Se o slide tiver "videoHorizontal", usa esse vídeo (aparece inteiro).
     Se só tiver "video" (um Short, em pé), ele é cortado em cima e embaixo.
   - Celular: o vídeo aparece em pé, inteiro.
   Ao trocar de slide, o vídeo é removido (e para de tocar).
   ===================================================================== */
const telaPequena = matchMedia('(max-width: 640px)');

function mostrarVideoBanner(slide) {
  const area = document.querySelector('#video-banner');
  const caixa = document.querySelector('.apresentacao-imagem');
  let link = telaPequena.matches ? (slide.video || slide.videoHorizontal) : (slide.videoHorizontal || slide.video);
  if (ESTILO_VIDEO === 'vitrine') link = '';   // na vitrine, o banner fica só com a foto
  const id = link ? Blog.videoId(link) : '';
  area.replaceChildren();
  area.hidden = !id;
  caixa.classList.toggle('com-video', Boolean(id));   // com vídeo, a foto do slide some
  // O estilo escolhido vale só para o slide que tem vídeo
  const banner = document.querySelector('.apresentacao');
  banner.classList.remove('video-recorte', 'video-celular', 'video-cinema');
  if (id) banner.classList.add('video-' + ESTILO_VIDEO);
  const selo = document.querySelector('#selo-video');
  selo.hidden = !id || !slide.tituloVideo;
  selo.textContent = '▶ ' + (slide.tituloVideo || '');
  if (!id) return;

  // Formato do vídeo: 16/9 (deitado) ou 9/16 (em pé, como os Shorts)
  area.dataset.proporcao = link === slide.videoHorizontal ? 16 / 9 : 9 / 16;
  // Vídeo em pé (Short) aparece SEMPRE inteiro, sem cortes: cortar um vídeo em pé
  // para caber deitado esconde os rostos. Só um vídeo deitado ocupa a área toda.
  const deitado = link === slide.videoHorizontal;
  const preencher = (deitado || ESTILO_VIDEO === 'recorte') && !telaPequena.matches;
  area.className = 'video-banner ' + (preencher ? 'modo-horizontal' : 'modo-vertical');
  area.style.aspectRatio = preencher ? '' : area.dataset.proporcao;
  // Fundo: a capa do vídeo desfocada, no lugar da foto da escola
  caixa.style.setProperty('--fundo-video', 'url(https://img.youtube.com/vi/' + id + '/hqdefault.jpg)');

  // Aberto direto do computador (file://), o YouTube não deixa tocar o vídeo
  // dentro da página. Nesse caso mostramos a capa, com link para o YouTube.
  if (location.protocol === 'file:') {
    const capa = document.createElement('a');
    capa.className = 'capa-video-banner';
    capa.href = 'https://www.youtube.com/watch?v=' + id;
    capa.target = '_blank'; capa.rel = 'noopener';
    capa.setAttribute('aria-label', 'Assistir ao vídeo de boas-vindas no YouTube');
    const img = document.createElement('img');
    img.src = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg'; img.alt = '';
    const play = document.createElement('span'); play.className = 'icone-play'; play.textContent = '▶';
    const aviso = document.createElement('span'); aviso.className = 'aviso-video-banner';
    aviso.textContent = 'Para o vídeo tocar aqui, abra o blog pelo Live Server ou pelo site publicado.';
    capa.append(img, play, aviso);
    area.append(capa);
    ajustarVideoBanner();
    return;
  }

  // No site publicado: player do YouTube, começando sem som e repetindo.
  // enablejsapi=1 deixa o nosso botão "Ativar som" controlar o player.
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/' + id +
    '?autoplay=1&mute=1&loop=1&playlist=' + id + '&playsinline=1&rel=0&enablejsapi=1';
  iframe.title = 'Vídeo de boas-vindas do Blog MPL';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.allowFullscreen = true;

  // Botão de som (na horizontal os controles do YouTube ficam escondidos pelo corte)
  const som = document.createElement('button');
  som.type = 'button'; som.className = 'botao-som'; som.textContent = '🔇 Ativar som';
  som.addEventListener('click', () => {
    const ligar = som.textContent.includes('Ativar');
    iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: ligar ? 'unMute' : 'mute', args: []}), '*');
    som.textContent = ligar ? '🔊 Desativar som' : '🔇 Ativar som';
  });

  area.append(iframe, som);
  ajustarVideoBanner();
}

/* Na horizontal, aumenta o vídeo até cobrir toda a área (como object-fit: cover). */
function ajustarVideoBanner() {
  const area = document.querySelector('#video-banner');
  const midia = area.querySelector('iframe, .capa-video-banner img');
  if (!midia) return;
  if (!area.classList.contains('modo-horizontal')) { midia.style.width = midia.style.height = midia.style.top = ''; return; }
  const proporcao = Number(area.dataset.proporcao);
  let largura = area.clientWidth, altura = largura / proporcao;
  if (altura < area.clientHeight) { altura = area.clientHeight; largura = altura * proporcao; }
  midia.style.width = largura + 'px';
  midia.style.height = altura + 'px';
  // Quanto do vídeo sobra fora da área, e quanto disso fica "acima" (enquadramento)
  const enquadramento = area.style.aspectRatio === '' && Number(area.dataset.proporcao) < 1 ? ENQUADRAMENTO : 50;
  midia.style.top = (-(altura - area.clientHeight) * enquadramento / 100) + 'px';
}
addEventListener('resize', ajustarVideoBanner);
// Ao passar de computador para celular (ou o contrário), monta o vídeo de novo.
telaPequena.addEventListener('change', () => mostrarVideoBanner(slides[slideAtual]));

document.querySelector('.anterior').addEventListener('click', () => mostrarSlide(slideAtual - 1));
document.querySelector('.proxima').addEventListener('click', () => mostrarSlide(slideAtual + 1));
document.querySelectorAll('[data-slide]').forEach(b => b.addEventListener('click', () => mostrarSlide(Number(b.dataset.slide))));
mostrarSlide(0);   // desenha o primeiro slide (com o vídeo) ao abrir a página

/* =====================================================================
   VITRINE "VÍDEOS DA ESCOLA" (estilo 'vitrine')
   Cartões em pé, como os Shorts. Clicando, o vídeo abre numa janela
   na própria página, já com som.
   ===================================================================== */
function montarVitrine() {
  const secao = document.querySelector('#videos-escola');
  const lista = videosEscola.filter(v => Blog.videoId(v.link));
  secao.hidden = ESTILO_VIDEO !== 'vitrine' || lista.length === 0;
  if (secao.hidden) return;
  const area = document.querySelector('#lista-videos');
  area.replaceChildren();
  lista.forEach(v => {
    const id = Blog.videoId(v.link);
    const cartao = document.createElement('button');
    cartao.type = 'button'; cartao.className = 'cartao-video';
    cartao.setAttribute('aria-label', 'Assistir: ' + v.titulo);
    const img = document.createElement('img');
    img.src = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg'; img.alt = ''; img.loading = 'lazy';
    const play = document.createElement('span'); play.className = 'icone-play'; play.textContent = '▶';
    const titulo = document.createElement('strong'); titulo.textContent = v.titulo;
    cartao.append(img, play, titulo);
    cartao.addEventListener('click', () => abrirVideo(id, v.titulo));
    area.append(cartao);
  });
}

function abrirVideo(id, titulo) {
  // Aberto pela pasta (file://) o YouTube não toca dentro da página.
  if (location.protocol === 'file:') { open('https://www.youtube.com/watch?v=' + id, '_blank', 'noopener'); return; }
  const janela = document.querySelector('#janela-video');
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&playsinline=1&rel=0';
  iframe.title = titulo;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.allowFullscreen = true;
  janela.querySelector('.janela-video-corpo').replaceChildren(iframe);
  janela.showModal();
}
// Ao fechar a janela, o vídeo é removido (e para de tocar).
document.querySelector('#janela-video').addEventListener('close', e => e.target.querySelector('.janela-video-corpo').replaceChildren());
document.querySelector('#fechar-video').addEventListener('click', () => document.querySelector('#janela-video').close());
document.querySelector('#janela-video').addEventListener('click', e => { if (e.target.id === 'janela-video') e.target.close(); });
montarVitrine();
document.querySelector('#acao-apresentacao').addEventListener('click', () => {
  const acao = slides[slideAtual].acao;
  location.href = acao === 'sobre' ? 'sobre.html' : Blog.enderecoCategoria(acao);
});

// Menu de celular e busca nas publicações demonstrativas.
const botaoMenu = document.querySelector('.botao-menu');
function fecharMenu() {
  document.querySelector('.menu').classList.remove('aberto');
  botaoMenu.setAttribute('aria-expanded','false');
  botaoMenu.setAttribute('aria-label','Abrir menu');
}
botaoMenu.addEventListener('click', () => {
  const aberto = document.querySelector('.menu').classList.toggle('aberto');
  botaoMenu.setAttribute('aria-expanded', String(aberto));
  botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
});
document.querySelector('.abrir-busca').addEventListener('click', () => {
  const painel = document.querySelector('#painel-busca');
  painel.hidden = !painel.hidden;
  document.querySelector('.abrir-busca').setAttribute('aria-expanded', String(!painel.hidden));
  if (!painel.hidden) document.querySelector('#termo-busca').focus();
});
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
}
document.querySelector('#painel-busca').addEventListener('submit', evento => {
  evento.preventDefault();
  location.href = 'busca.html?q=' + encodeURIComponent(document.querySelector('#termo-busca').value.trim());
});

// Carrega as publicações do banco e só então monta os destaques.
async function iniciarPagina() {
  publicacoes = await Blog.listar();
  listaAtual = [...publicacoes];
  // Filtros recebidos pelos links da página de publicação.
  const parametrosIniciais = new URLSearchParams(location.search);
  const categoriaInicial = parametrosIniciais.get('categoria');
  if (publicacoes.some(n => n.categoria === categoriaInicial)) filtrarCategoria(categoriaInicial);
  if (parametrosIniciais.has('busca')) {
    document.querySelector('#termo-busca').value = parametrosIniciais.get('busca');
    document.querySelector('#painel-busca').hidden = false;
    document.querySelector('.abrir-busca').setAttribute('aria-expanded','true');
    document.querySelector('#painel-busca').requestSubmit();
  }
  mostrarNoticia();
}
iniciarPagina();
