/* =====================================================================
   eventos.js — página de Eventos
   - Conteúdo principal: o evento escolhido (eventos.html?id=...) ou, se
     nenhum for escolhido, o PRÓXIMO evento (data mais próxima a partir de hoje).
   - Abaixo: os outros próximos eventos.
   - Barra lateral: os eventos que já aconteceram (do mais recente ao mais antigo).
   A data usada é a "Data do evento" preenchida no editor.
   ===================================================================== */

function el(id) { return document.getElementById(id); }

// Data de hoje no formato AAAA-MM-DD (o mesmo do banco), no fuso do computador.
function hojeTexto() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

// Se a data do evento não foi preenchida, usa a data da publicação.
function dataDoEvento(p) { return p.dataEvento || p.data; }

// "2026-11-10" → "10 de novembro de 2026"
function dataPorExtenso(texto) {
  const [ano, mes, dia] = texto.split('-').map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {day: 'numeric', month: 'long', year: 'numeric'});
}

// Cria um ícone usando os símbolos SVG do topo da página.
function icone(nome) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#' + nome);
  svg.append(use);
  return svg;
}

async function carregarEventos() {
  const hoje = hojeTexto();
  const eventos = (await Blog.listar()).filter(p => p.categoria === 'Eventos');

  if (eventos.length === 0) {
    el('grade-eventos').hidden = true;
    el('sem-eventos').hidden = false;
    return;
  }

  // Separa em próximos (hoje ou depois) e passados (antes de hoje).
  const proximos = eventos.filter(p => dataDoEvento(p) >= hoje)
    .sort((a, b) => dataDoEvento(a).localeCompare(dataDoEvento(b)));        // mais perto primeiro
  const passados = eventos.filter(p => dataDoEvento(p) < hoje)
    .sort((a, b) => dataDoEvento(b).localeCompare(dataDoEvento(a)));        // mais recente primeiro

  // Qual evento mostrar no conteúdo principal?
  const idEscolhido = new URLSearchParams(location.search).get('id');
  const atual = eventos.find(p => p.id === idEscolhido) || proximos[0] || passados[0];

  mostrarEvento(atual, dataDoEvento(atual) >= hoje);
  mostrarProximos(proximos.filter(p => p.id !== atual.id));
  mostrarPassados(passados.filter(p => p.id !== atual.id));
}

/* ---------- Conteúdo principal ---------- */
function mostrarEvento(p, ehProximo) {
  document.title = p.titulo + ' | Eventos | Blog MPL';
  el('caminho-evento').textContent = p.titulo;
  el('situacao-evento').textContent = ehProximo ? 'Próximo evento' : 'Evento realizado';
  el('situacao-evento').classList.toggle('realizado', !ehProximo);
  el('titulo-evento').textContent = p.titulo;
  el('resumo-evento').textContent = p.resumo;
  el('autor-evento').textContent = p.autor;
  el('data-evento').dateTime = dataDoEvento(p);
  el('data-evento').textContent = dataPorExtenso(dataDoEvento(p));
  el('capa-evento').src = p.capa;
  el('capa-evento').alt = p.alt;

  const texto = el('texto-evento');
  texto.replaceChildren();
  p.texto.forEach(paragrafo => {
    const par = document.createElement('p');
    par.textContent = paragrafo;
    texto.append(par);
  });

  // Vídeo do YouTube
  const idVideo = Blog.videoId(p.video || '');
  if (idVideo) {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + idVideo;
    iframe.title = 'Vídeo do evento';
    iframe.loading = 'lazy';
    iframe.allowFullscreen = true;
    iframe.className = 'video-materia';
    el('video-evento').replaceChildren(iframe);
    el('caixa-video').hidden = false;
  }

  // Material em PDF
  if (p.pdf) {
    el('pdf-evento').href = p.pdf;
    el('caixa-material').hidden = false;
  }

  // Enquete ou mural: a votação fica na página da publicação
  if (p.tipo === 'enquete' || p.tipo === 'mural') {
    el('texto-participar').textContent = p.tipo === 'enquete'
      ? 'Este evento tem uma enquete aberta. Dê a sua opinião!'
      : 'Veja o mural de fotos do evento e vote na sua favorita.';
    el('link-participar').textContent = p.tipo === 'enquete' ? 'Participar da enquete' : 'Ver o mural e votar';
    el('link-participar').href = 'publicacao.html?id=' + encodeURIComponent(p.id);
    el('caixa-participar').hidden = false;
  }
}

/* ---------- Outros próximos eventos (abaixo do principal) ---------- */
function mostrarProximos(lista) {
  el('proximos').hidden = lista.length === 0;
  const area = el('lista-proximos');
  area.replaceChildren();
  lista.forEach(p => area.append(cartaoEvento(p, 'cartao-proximo')));
}

/* ---------- Barra lateral: eventos passados ---------- */
function mostrarPassados(lista) {
  el('sem-passados').hidden = lista.length > 0;
  const area = el('lista-passados');
  area.replaceChildren();
  lista.forEach(p => area.append(cartaoEvento(p, 'cartao-passado')));
}

// Cartão com miniatura, título e data (usado nas duas listas).
function cartaoEvento(p, classe) {
  const link = document.createElement('a');
  link.className = classe;
  link.href = 'eventos.html?id=' + encodeURIComponent(p.id);

  const img = document.createElement('img');
  img.src = p.capa; img.alt = ''; img.loading = 'lazy';

  const dados = document.createElement('span');
  const titulo = document.createElement('strong');
  titulo.textContent = p.titulo;
  const data = document.createElement('small');
  data.append(icone('cal'), document.createTextNode(dataPorExtenso(dataDoEvento(p))));
  dados.append(titulo, data);

  link.append(img, dados);
  return link;
}

carregarEventos();
