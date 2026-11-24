/* =====================================================================
   video.js — VÍDEO DE BOAS-VINDAS (o mesmo no banner da página inicial
   e na página Sobre). Para trocar o vídeo nos dois lugares, mude só aqui.
   ===================================================================== */

// Link do vídeo ou Short no YouTube (precisa estar "Não listado" ou "Público").
const VIDEO_BOAS_VINDAS = 'https://youtube.com/shorts/HXHj-K26MJU?feature=share';

/* No computador, o vídeo em pé é recortado para ocupar a área deitada.
   Escolha que parte aparece: 0 = o topo · 50 = o meio · 100 = a base.
   Aumente o número para DESCER o enquadramento; diminua para SUBIR. */
const ENQUADRAMENTO = 40;


/* ---------------------------------------------------------------------
   Vídeo da página Sobre (no lugar da foto)
   - Computador: ocupa a área da foto, recortado conforme o ENQUADRAMENTO.
   - Celular: aparece em pé, inteiro.
   --------------------------------------------------------------------- */
function montarVideoSobre() {
  const area = document.querySelector('#video-sobre');
  const id = Blog.videoId(VIDEO_BOAS_VINDAS);
  if (!area || !id) return;              // sem vídeo, a foto continua
  document.querySelector('.sobre-abertura > img').hidden = true;
  area.hidden = false;

  // Aberto direto da pasta (file://), o YouTube não toca dentro da página.
  if (location.protocol === 'file:') {
    const capa = document.createElement('a');
    capa.className = 'capa-video-banner';
    capa.href = 'https://www.youtube.com/watch?v=' + id;
    capa.target = '_blank'; capa.rel = 'noopener';
    capa.setAttribute('aria-label', 'Assistir ao vídeo no YouTube');
    const img = document.createElement('img');
    img.src = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg'; img.alt = '';
    const play = document.createElement('span'); play.className = 'icone-play'; play.textContent = '▶';
    const aviso = document.createElement('span'); aviso.className = 'aviso-video-banner';
    aviso.textContent = 'Para o vídeo tocar aqui, abra o blog pelo Live Server ou pelo site publicado.';
    capa.append(img, play, aviso);
    area.append(capa);
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/' + id +
    '?autoplay=1&mute=1&loop=1&playlist=' + id + '&playsinline=1&rel=0&enablejsapi=1';
  iframe.title = 'Vídeo de boas-vindas do Blog MPL';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.allowFullscreen = true;

  const som = document.createElement('button');
  som.type = 'button'; som.className = 'botao-som'; som.textContent = '🔇 Ativar som';
  som.addEventListener('click', () => {
    const ligar = som.textContent.includes('Ativar');
    iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: ligar ? 'unMute' : 'mute', args: []}), '*');
    som.textContent = ligar ? '🔊 Desativar som' : '🔇 Ativar som';
  });
  area.append(iframe, som);

  // Recorta o vídeo em pé (9:16) para cobrir a área, com o enquadramento escolhido.
  function ajustar() {
    if (matchMedia('(max-width: 640px)').matches) {   // celular: em pé, inteiro
      iframe.style.width = iframe.style.height = iframe.style.top = '';
      return;
    }
    let largura = area.clientWidth, altura = largura * 16 / 9;
    if (altura < area.clientHeight) { altura = area.clientHeight; largura = altura * 9 / 16; }
    iframe.style.width = largura + 'px';
    iframe.style.height = altura + 'px';
    iframe.style.top = (-(altura - area.clientHeight) * ENQUADRAMENTO / 100) + 'px';
  }
  ajustar();
  addEventListener('resize', ajustar);
}

if (document.querySelector('#video-sobre')) montarVideoSobre();
