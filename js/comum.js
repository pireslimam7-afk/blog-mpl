/* Recursos comuns às páginas internas (menu, busca e área da equipe).
   Painel e editor só abrem para quem fez login como ADM. A proteção de
   verdade fica nas regras do banco (banco-de-dados.sql): mesmo que alguém
   mexa neste código, o Supabase não deixa visitante gravar nada. */
const paginaAtual = document.body.dataset.pagina;
const paginaRestrita = ['painel','editor'].includes(paginaAtual);

// Esconde a página restrita até confirmar o login.
if (paginaRestrita) document.body.hidden = true;

// "usuarioPronto" é usado pelo painel.js e pelo editor.js para esperar o login.
const usuarioPronto = Blog.usuario().then(usuario => {
  if (paginaRestrita && !usuario) { location.replace('login.html'); return null; }
  document.body.hidden = false;
  const nome = document.querySelector('#nome-equipe');
  if (usuario && nome) nome.textContent = usuario.nome;
  const modo = document.querySelector('#modo-dados');
  if (modo) modo.textContent = MODO_DEMO ? 'Modo demonstração (dados só neste navegador)' : 'Conectado ao banco de dados';
  document.querySelectorAll('.aviso-demo').forEach(e => e.hidden = !MODO_DEMO);
  return usuario;
});

// "Notícias" fica destacado no menu nas páginas de lista de notícias.
if (['categoria','saude','cultura','entrevistas','esportes','busca'].includes(paginaAtual)) {
  const noticias = document.querySelector('.menu [data-menu="noticias"]');
  if (noticias && !document.querySelector('.menu [aria-current]')) {
    noticias.classList.add('ativo'); noticias.setAttribute('aria-current', 'page');
  }
}

// No celular as abas de categorias rolam para o lado: mostra a aba atual.
setTimeout(() => {
  const abaAtual = document.querySelector('.filtros-categorias [aria-current]');
  const abas = document.querySelector('.filtros-categorias');
  if (abaAtual && abas && abas.scrollWidth > abas.clientWidth) {
    abas.scrollLeft = abaAtual.offsetLeft - (abas.clientWidth - abaAtual.offsetWidth) / 2;
  }
}, 300);

document.querySelectorAll('.sair').forEach(e => e.addEventListener('click', async () => {
  await Blog.sair();
  location.href = 'login.html';
}));

const menuBotao = document.querySelector('.botao-menu');
if (menuBotao) menuBotao.addEventListener('click', () => {
  const aberto = document.querySelector('.menu').classList.toggle('aberto');
  menuBotao.setAttribute('aria-expanded',String(aberto));
  menuBotao.setAttribute('aria-label',aberto?'Fechar menu':'Abrir menu');
});
const buscaBotao = document.querySelector('.abrir-busca');
if (buscaBotao) buscaBotao.addEventListener('click', () => {
  const painel = document.querySelector('#painel-busca');painel.hidden=!painel.hidden;
  buscaBotao.setAttribute('aria-expanded',String(!painel.hidden));
  if (!painel.hidden) document.querySelector('#termo-busca').focus();
});
const buscaForm = document.querySelector('#painel-busca');
if (buscaForm) buscaForm.addEventListener('submit', e => {
  e.preventDefault();location.href='busca.html?q='+encodeURIComponent(document.querySelector('#termo-busca').value.trim());
});
