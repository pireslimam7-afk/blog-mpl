const parametrosPagina = new URLSearchParams(location.search);
const listaMaterias = document.querySelector('#lista-materias');
function normalizarBusca(t) {return t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
// Páginas próprias de cada categoria (o resto usa categoria.html?categoria=...)
const PAGINAS_CATEGORIA = {'saude.html':'Saúde','cultura.html':'Cultura e Entretenimento','entrevistas.html':'Entrevistas',
  'esportes.html':'Esportes','eventos.html':'Eventos','projetos.html':'Projetos','conquistas.html':'Conquistas'};
async function montarLista() {
  let lista = await Blog.listar();
  if (paginaAtual !== 'busca') {
    const categoria = PAGINAS_CATEGORIA[paginaAtual + '.html'] || parametrosPagina.get('categoria');
    if (categoria) lista=lista.filter(p=>p.categoria===categoria);
    document.querySelector('#titulo-lista').textContent=categoria||'Todas as publicações';
    document.querySelector('#nome-caminho').textContent=categoria||'Categorias';
    document.querySelectorAll('.filtros-categorias a').forEach(a=>{
      if ((new URL(a.href).searchParams.get('categoria') || PAGINAS_CATEGORIA[new URL(a.href).pathname.split('/').pop()] || '')===(categoria||''))a.setAttribute('aria-current','page');
    });
  } else {
    const termo=parametrosPagina.get('q')||'';
    document.querySelector('#pesquisa-pagina').value=termo;
    lista=lista.filter(p=>normalizarBusca(p.titulo+' '+p.resumo+' '+p.categoria).includes(normalizarBusca(termo)));
    document.querySelector('#titulo-lista').textContent=termo?'Resultados para “'+termo+'”':'Todas as publicações';
    document.querySelector('#form-busca-pagina').addEventListener('submit',e=>{
      e.preventDefault();location.href='busca.html?q='+encodeURIComponent(document.querySelector('#pesquisa-pagina').value.trim());
    });
  }
  document.querySelector('#contagem-lista').textContent=lista.length+' publicação(ões)';
  document.querySelector('#lista-vazia').hidden=lista.length>0;
  lista.forEach(p=>{
    const artigo=document.createElement('article');artigo.className='cartao-materia';
    const link=document.createElement('a');link.href=Blog.enderecoPublicacao(p);
    const img=document.createElement('img');img.src=p.capa;img.alt=p.alt;img.loading='lazy';
    const corpo=document.createElement('div');
    // O tipo aparece junto da categoria, para o visitante saber se é vídeo, enquete ou mural.
    const cat=document.createElement('small');cat.textContent=p.tipo==='artigo'?p.categoria:p.categoria+' · '+Blog.tipos[p.tipo];
    const titulo=document.createElement('h2');titulo.textContent=p.titulo;
    const resumo=document.createElement('p');resumo.textContent=p.resumo;
    const leia=document.createElement('span');leia.textContent={video:'Assistir ao vídeo',enquete:'Participar da enquete',mural:'Ver o mural e votar'}[p.tipo]||'Leia a matéria';leia.className='leia-cartao';
    corpo.append(cat,titulo,resumo,leia);link.append(img,corpo);artigo.append(link);listaMaterias.append(artigo);
  });
}
if (listaMaterias) montarLista();
