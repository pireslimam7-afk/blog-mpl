/* =====================================================================
   dados.js — TODA a comunicação com os dados do blog fica aqui.
   As páginas não falam direto com o banco: elas chamam as funções do
   objeto "Blog" (Blog.listar, Blog.salvar, Blog.votar...).

   Cada função tem dois caminhos:
   - MODO_DEMO: usa o localStorage deste navegador (para testar em sala);
   - Supabase: usa o banco de dados online (blog de verdade).
   Os dois devolvem as publicações no MESMO formato, então as páginas
   funcionam igual nos dois modos.
   ===================================================================== */

/* Publicações de exemplo, usadas apenas no MODO_DEMO. */
const publicacoesBase = [
  {
    tipo: 'artigo', id: 'memorias-escola', autor: 'Equipe do blog', data: '2026-11-12', categoria: 'Projetos',
    titulo: 'Memórias da escola', resumo: 'Entrevistas e registros da comunidade escolar.',
    professores: 'Carlos Lima\nMariana Costa', turmas: '2ª A', tituloProjeto: 'Histórias que nos conectam', situacaoProjeto: 'planejado',
    imagem: 'imagens/escola.png', alt: 'Imagem ilustrativa de uma escola com jardim',
    texto: ['Projeto ilustrativo. Os estudantes vão entrevistar ex-alunos, professores e funcionários para registrar a história da escola.']
  },
  {
    tipo: 'artigo', id: 'clube-leitura', autor: 'Equipe do blog', data: '2026-11-08', categoria: 'Projetos',
    titulo: 'Clube de leitura', resumo: 'Leitura, rodas de conversa e produção de resenhas.',
    professores: 'Mariana Costa', turmas: '1ª A\n1ª B', tituloProjeto: 'Ler, compartilhar e criar', situacaoProjeto: 'andamento',
    imagem: 'imagens/muda.png', alt: 'Mãos segurando uma muda verde com terra',
    texto: ['Projeto ilustrativo. Encontros semanais de leitura com rodas de conversa e produção de resenhas para o blog.']
  },
  {
    tipo: 'artigo', id: 'robotica-pratica', autor: 'Equipe do blog', data: '2026-10-30', categoria: 'Projetos',
    titulo: 'Robótica na prática', resumo: 'Protótipos para desafios do cotidiano.',
    professores: 'Paulo Santos\nAna Silva', turmas: '3ª A', tituloProjeto: 'Tecnologia para transformar', situacaoProjeto: 'concluido',
    imagem: 'imagens/escola.png', alt: 'Imagem ilustrativa de uma escola com jardim',
    texto: ['Projeto ilustrativo. As equipes construíram protótipos simples para resolver problemas do dia a dia da escola.']
  },
  {
    tipo: 'artigo', id: 'mostra-cultural', autor: 'Equipe de Eventos', data: '2026-11-18', dataEvento: '2026-12-12',
    titulo: 'Mostra Cultural de fim de ano', categoria: 'Eventos',
    resumo: 'Apresentações de dança, música, teatro e exposição de trabalhos das turmas.',
    imagem: 'imagens/escola.png', alt: 'Imagem ilustrativa de uma escola com jardim',
    texto: ['A Mostra Cultural encerra o ano letivo com apresentações preparadas pelas turmas ao longo do semestre. A comunidade está convidada!',
            'A programação começa às 8h, no pátio da escola, com exposição de trabalhos nas salas do bloco B.']
  },
  {
    tipo: 'artigo', id: 'palestra-meio-ambiente', autor: 'Equipe de Ciências', data: '2026-10-10', dataEvento: '2026-10-15',
    titulo: 'Palestra sobre meio ambiente abre a Semana da Ciência', categoria: 'Eventos',
    resumo: 'Estudantes conversaram com especialistas sobre preservação e consumo consciente.',
    imagem: 'imagens/muda.png', alt: 'Mãos segurando uma muda verde com terra',
    texto: ['A palestra de abertura da Semana da Ciência reuniu as turmas no auditório para discutir preservação ambiental e consumo consciente.']
  },
  {
    tipo: 'artigo', id: 'gincana-integracao', autor: 'Equipe do blog', data: '2026-09-15', dataEvento: '2026-09-20',
    titulo: 'Gincana de integração movimenta as turmas', categoria: 'Eventos',
    resumo: 'Provas culturais, esportivas e solidárias marcaram o dia de integração.',
    imagem: 'imagens/escola.png', alt: 'Imagem ilustrativa de uma escola com jardim',
    texto: ['A gincana reuniu as turmas em provas culturais, esportivas e solidárias. Os alimentos arrecadados foram doados a instituições do município.']
  },
  {
    tipo: 'enquete', id: 'enquete-semana-cultural', autor: 'Equipe do blog', data: '2026-11-17',
    titulo: 'Qual deve ser o tema da Semana Cultural?', categoria: 'Eventos',
    resumo: 'Vote e ajude a escolher o tema do próximo evento da escola.',
    imagem: 'imagens/escola.png', alt: 'Imagem ilustrativa de uma escola com jardim',
    texto: ['Enquete demonstrativa. Cada pessoa pode votar uma vez neste navegador.'],
    opcoes: ['Cultura nordestina', 'Tecnologia e futuro', 'Meio ambiente', 'Esportes']
  },
  {
    tipo: 'mural', id: 'mural-fotos', autor: 'Equipe do blog', data: '2026-11-17',
    titulo: 'Mural de fotos: escolha a sua favorita', categoria: 'Cultura e Entretenimento',
    resumo: 'Fotos enviadas pela turma. Vote na imagem de que você mais gostou.',
    imagem: 'imagens/muda.png', alt: 'Mãos segurando uma muda verde com terra',
    texto: ['Mural demonstrativo. Substituam as imagens por fotos autorizadas da turma.'],
    opcoes: ['imagens/muda.png', 'imagens/escola.png']
  },
  {
    tipo: 'artigo', id: 'feira-ciencias', autor: 'Equipe do blog', data: '2026-11-16',
    titulo: 'Feira de Ciências movimenta a escola', categoria: 'Notícias',
    resumo: 'Alunos apresentam projetos desenvolvidos ao longo do semestre com criatividade e inovação.',
    imagem: 'imagens/muda.png', alt: 'Mãos segurando uma muda verde com terra',
    texto: ['Nesta matéria demonstrativa, a Feira de Ciências reúne trabalhos sobre meio ambiente, tecnologia e sustentabilidade.', 'Os estudantes apresentam suas ideias e explicam como os conhecimentos aprendidos em sala podem ser aplicados no cotidiano. Substitua este texto pela reportagem produzida pela turma.']
  },
  {
    tipo: 'artigo', id: 'encontro-projetos', autor: 'Equipe do blog', data: '2026-11-16', dataEvento: '2026-11-28',
    titulo: 'Encontro de projetos da comunidade escolar', categoria: 'Eventos',
    pdf: 'arquivos/programacao-exemplo.pdf',
    resumo: 'Uma oportunidade para compartilhar experiências e conhecer os trabalhos das turmas.',
    imagem: 'imagens/escola.png', alt: 'Imagem ilustrativa de uma escola com jardim',
    texto: ['Esta publicação é um exemplo de conteúdo da categoria Eventos.', 'A equipe pode acrescentar informações confirmadas sobre a programação, o local, a data e a participação dos alunos. Nenhum evento real está sendo anunciado neste modelo.']
  },
  {
    tipo: 'artigo', id: 'horta-escolar', autor: 'Equipe do blog', data: '2026-11-16',
    professores: 'Ana Silva\nPaulo Santos', turmas: '1ª A\n2ª B', tituloProjeto: 'Cultivar para aprender', situacaoProjeto: 'andamento',
    pdf: 'arquivos/projeto-exemplo.pdf',
    titulo: 'Horta escolar', categoria: 'Projetos',
    resumo: 'Cultivo de hortaliças e educação ambiental.',
    imagem: 'imagens/muda.png', alt: 'Muda verde apoiada nas mãos',
    texto: ['A horta escolar aparece neste modelo como exemplo de projeto que pode ser documentado pelo blog.', 'Na versão da equipe, incluam os objetivos, as atividades realizadas e os registros autorizados do projeto.']
  },
  {
    tipo: 'artigo', id: 'talentos', autor: 'Equipe do blog', data: '2026-11-16',
    titulo: 'Talentos que fazem a diferença', categoria: 'Conquistas',
    resumo: 'Um espaço para valorizar a dedicação e compartilhar as conquistas dos nossos alunos.',
    imagem: 'imagens/escola.png', alt: 'Escola ilustrativa com pátio e árvores',
    texto: ['Esta matéria demonstrativa mostra como apresentar uma conquista da comunidade escolar.', 'Substituam o exemplo por um resultado verificado. Informem o evento ou atividade e reconheçam a participação de todos os envolvidos.']
  },
{
  "tipo": "artigo",
  "id": "saude-bem-estar",
  "autor": "Equipe do blog",
  "data": "2026-11-16",
  "titulo": "Saúde e bem-estar no cotidiano escolar",
  "categoria": "Saúde",
  "resumo": "Um espaço para registrar campanhas e projetos de saúde e bem-estar da comunidade escolar.",
  "imagem": "imagens/escola.png",
  "alt": "Imagem ilustrativa de uma escola com jardim",
  "texto": [
    "Esta matéria é um exemplo para a seção Saúde. A turma poderá registrar campanhas, entrevistas e projetos desenvolvidos na escola.",
    "Antes de publicar informações sobre saúde, a equipe deve conferir as fontes e solicitar a revisão de um profissional responsável quando necessário. Este texto não apresenta orientações clínicas nem anuncia uma campanha real."
  ]
},
{
  "tipo": "artigo",
  "id": "cultura-criatividade",
  "autor": "Equipe do blog",
  "data": "2026-11-16",
  "titulo": "Arte, cultura e criatividade na escola",
  "categoria": "Cultura e Entretenimento",
  "resumo": "Produções dos alunos, manifestações culturais e atividades que fazem parte da vida escolar.",
  "imagem": "imagens/escola.png",
  "alt": "Imagem ilustrativa de uma escola com pátio e árvores",
  "texto": [
    "Esta publicação demonstrativa apresenta o espaço de Cultura e Entretenimento do blog.",
    "A equipe pode compartilhar produções artísticas, resenhas, apresentações e expressões da cultura local. Substituam este exemplo pelos registros autorizados das atividades da turma."
  ]
},
{
  "tipo": "artigo",
  "id": "entrevista-projeto-escolar",
  "autor": "Equipe do blog",
  "data": "2026-11-16",
  "titulo": "Entrevista: como nasce um projeto escolar",
  "categoria": "Entrevistas",
  "resumo": "Um exemplo de entrevista em perguntas e respostas para orientar a produção dos alunos.",
  "imagem": "imagens/escola.png",
  "alt": "Imagem ilustrativa do ambiente escolar",
  "texto": [
    "Entrevista simulada para fins didáticos. As respostas abaixo são fictícias e não foram atribuídas a uma pessoa real.",
    "Pergunta: como surge a ideia de um projeto?",
    "Resposta fictícia: a equipe observa uma necessidade da escola, conversa sobre o assunto e escolhe o que pretende construir.",
    "Pergunta: como os alunos organizam o trabalho?",
    "Resposta fictícia: dividimos as tarefas, registramos as decisões e acompanhamos o que cada integrante está desenvolvendo.",
    "Na entrevista real, identifiquem a pessoa entrevistada, a data e o contexto da conversa. Confiram o texto com ela antes da publicação."
  ]
}
];



const Blog = (() => {
  const CHAVE_DEMO = 'blog-mpl-demo-v7';
  const categorias = ['Notícias', 'Saúde', 'Cultura e Entretenimento', 'Entrevistas', 'Esportes', 'Eventos', 'Projetos', 'Conquistas'];
  const tipos = {artigo: 'Artigo', video: 'Vídeo', enquete: 'Enquete', mural: 'Mural de fotos'};
  const situacoesProjeto = {planejado: 'Planejado', andamento: 'Em andamento', concluido: 'Concluído'};
  const CAPA_PADRAO = 'imagens/escola.png';

  function enderecoCategoria(nome) {
    const paginas = {'Saúde':'saude.html','Cultura e Entretenimento':'cultura.html','Entrevistas':'entrevistas.html',
                     'Esportes':'esportes.html','Eventos':'eventos.html','Projetos':'projetos.html','Conquistas':'conquistas.html'};
    return paginas[nome] || 'categoria.html?categoria=' + encodeURIComponent(nome);
  }

  // Endereço de uma publicação: eventos abrem na página de Eventos; o resto, em publicacao.html.
  function enderecoPublicacao(p) {
    return (p.categoria === 'Eventos' ? 'eventos.html?id=' : 'publicacao.html?id=') + encodeURIComponent(p.id);
  }

  // Pega o código de 11 caracteres de um link do YouTube (ou '' se o link for inválido).
  function videoId(url) {
    try {
      const u = new URL(url);
      if (u.protocol !== 'https:') return '';
      let id = '';
      if (u.hostname === 'youtu.be') id = u.pathname.slice(1);
      else if (['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname)) {
        id = u.searchParams.get('v') || (u.pathname.startsWith('/shorts/') ? u.pathname.split('/')[2] : '');
      }
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : '';
    } catch { return ''; }
  }

  // Escolhe a imagem do cartão: capa enviada > miniatura do vídeo > 1ª foto do mural > padrão.
  function escolherCapa(p) {
    if (p.imagem) return p.imagem;
    const id = videoId(p.video || '');
    if (p.tipo === 'video' && id) return 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
    if (p.tipo === 'mural' && p.opcoes && p.opcoes.length) return p.opcoes[0];
    return CAPA_PADRAO;
  }

  /* ---------- Conversão entre o formato do banco e o das páginas ----------
     Banco (colunas):  id, tipo, categoria, titulo, resumo, conteudo, imagem_url,
                       alt, video_url, pdf_url, opcoes, publicada, autor, criado_em, data_evento,
                       professores, turmas, titulo_projeto, situacao_projeto
     Páginas (campos): id, tipo, categoria, titulo, resumo, texto[], imagem,
                       alt, video, pdf, opcoes[], status, autor, data, dataEvento,
                       professores, turmas, tituloProjeto, situacaoProjeto */
  function doBanco(linha) {
    const p = {
      id: String(linha.id), tipo: linha.tipo, categoria: linha.categoria,
      titulo: linha.titulo, resumo: linha.resumo || '',
      texto: (linha.conteudo || '').split(/\n\s*\n/).filter(t => t.trim()),
      imagem: linha.imagem_url || '', alt: linha.alt || '',
      video: linha.video_url || '', pdf: linha.pdf_url || '', opcoes: linha.opcoes || [],
      status: linha.publicada ? 'publicada' : 'rascunho',
      autor: linha.autor || 'Equipe do blog', data: (linha.criado_em || '').slice(0, 10),
      dataEvento: linha.data_evento || '',  // só para a categoria Eventos (AAAA-MM-DD)
      // Só para a categoria Projetos:
      professores: linha.professores || '', turmas: linha.turmas || '',
      tituloProjeto: linha.titulo_projeto || '', situacaoProjeto: linha.situacao_projeto || ''
    };
    p.capa = escolherCapa(p);
    return p;
  }
  function paraBanco(p) {
    return {
      tipo: p.tipo, categoria: p.categoria, titulo: p.titulo, resumo: p.resumo,
      conteudo: p.texto.join('\n\n'), imagem_url: p.imagem || null, alt: p.alt,
      video_url: p.video || null, pdf_url: p.pdf || null, opcoes: p.opcoes || [],
      publicada: p.status === 'publicada', autor: p.autor,
      data_evento: p.dataEvento || null,
      professores: p.professores || null, turmas: p.turmas || null,
      titulo_projeto: p.tituloProjeto || null, situacao_projeto: p.situacaoProjeto || null
    };
  }

  /* ---------- MODO DEMO: funções auxiliares do localStorage ---------- */
  function lerDemo() {
    try {
      const lista = JSON.parse(localStorage.getItem(CHAVE_DEMO));
      if (Array.isArray(lista)) return lista;
    } catch {}
    return publicacoesBase.map(p => ({video: '', pdf: '', ...p, status: 'publicada', opcoes: p.opcoes || []}));
  }
  function gravarDemo(lista) {
    try { localStorage.setItem(CHAVE_DEMO, JSON.stringify(lista)); }
    catch { throw Error('O navegador não conseguiu salvar. Use arquivos menores no modo demonstração.'); }
  }
  function comCapa(p) { return {...p, capa: escolherCapa(p)}; }

  /* =================== PUBLICAÇÕES =================== */

  // Lista as publicações. Visitantes recebem só as publicadas;
  // com {todas: true} (painel da equipe) vêm também os rascunhos.
  async function listar(opcoes = {}) {
    if (MODO_DEMO) {
      const lista = lerDemo().map(comCapa);
      return opcoes.todas ? lista : lista.filter(p => p.status === 'publicada');
    }
    let consulta = banco.from('publicacoes').select('*').order('criado_em', {ascending: false});
    if (!opcoes.todas) consulta = consulta.eq('publicada', true);
    const {data, error} = await consulta;
    if (error) { console.error('Erro ao buscar publicações:', error); return []; }
    return data.map(doBanco);
  }

  async function buscar(id) {
    if (MODO_DEMO) {
      const p = lerDemo().find(item => item.id === id);
      return p ? comCapa(p) : null;
    }
    const {data, error} = await banco.from('publicacoes').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return doBanco(data);
  }

  // Cria (sem id) ou atualiza (com id) uma publicação. Só funciona para ADM logado.
  async function salvar(p) {
    if (MODO_DEMO) {
      const lista = lerDemo();
      if (!p.id) {
        p.id = 'pub-' + Date.now();
        const hoje = new Date();
        p.data = [hoje.getFullYear(), String(hoje.getMonth()+1).padStart(2,'0'), String(hoje.getDate()).padStart(2,'0')].join('-');
        lista.unshift(p);
      } else {
        const pos = lista.findIndex(item => item.id === p.id);
        lista[pos] = {...lista[pos], ...p};
      }
      gravarDemo(lista);
      return;
    }
    const dados = paraBanco(p);
    const {error} = p.id
      ? await banco.from('publicacoes').update(dados).eq('id', p.id)
      : await banco.from('publicacoes').insert(dados);
    if (error) throw Error('Não foi possível salvar: ' + error.message);
  }

  // Publica ou retira do blog (volta a rascunho) sem apagar o conteúdo.
  async function mudarStatus(id, publicada) {
    if (MODO_DEMO) {
      const lista = lerDemo();
      lista.find(p => p.id === id).status = publicada ? 'publicada' : 'rascunho';
      gravarDemo(lista);
      return;
    }
    const {error} = await banco.from('publicacoes').update({publicada}).eq('id', id);
    if (error) throw Error(error.message);
  }

  // Exclui de vez. Os votos da publicação somem junto (regra do banco).
  async function excluir(id) {
    if (MODO_DEMO) {
      gravarDemo(lerDemo().filter(p => p.id !== id));
      try { localStorage.removeItem('blog-mpl-demo-votos-' + id); } catch {}
      return;
    }
    const {error} = await banco.from('publicacoes').delete().eq('id', id);
    if (error) throw Error(error.message);
  }

  /* =================== ARQUIVOS (capas, fotos do mural, PDF) ===================
     No Supabase, o arquivo vai para a pasta "arquivos" (Storage) e guardamos só o link.
     No modo demo, o arquivo vira texto (base64) e fica no navegador.

     FOTOS: antes de enviar, o navegador DIMINUI a imagem (como o WhatsApp faz).
     Assim uma foto de celular de 4 MB vira um JPEG de uns 200 a 400 KB, o mural
     aceita muitas fotos e o site carrega rápido. */
  const LADO_MAXIMO = MODO_DEMO ? 900 : 1600;   // maior lado da foto, em pixels
  const QUALIDADE = MODO_DEMO ? 0.7 : 0.82;     // qualidade do JPEG (0 a 1)

  function reduzirImagem(arquivo) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, LADO_MAXIMO / Math.max(img.width, img.height));
        const tela = document.createElement('canvas');
        tela.width = Math.round(img.width * escala);
        tela.height = Math.round(img.height * escala);
        const ctx = tela.getContext('2d');
        ctx.fillStyle = '#fff';                  // fundo branco para PNG transparente
        ctx.fillRect(0, 0, tela.width, tela.height);
        ctx.drawImage(img, 0, 0, tela.width, tela.height);
        URL.revokeObjectURL(img.src);
        tela.toBlob(b => b ? resolve(b) : reject(Error('Não foi possível preparar ' + arquivo.name)), 'image/jpeg', QUALIDADE);
      };
      img.onerror = () => reject(Error('Não foi possível abrir a imagem ' + arquivo.name));
      img.src = URL.createObjectURL(arquivo);
    });
  }

  async function enviarArquivo(arquivo) {
    const ehImagem = arquivo.type.startsWith('image/');
    const conteudo = ehImagem ? await reduzirImagem(arquivo) : arquivo;

    if (MODO_DEMO) {
      if (conteudo.size > 500 * 1024) throw Error('No modo demonstração, use arquivos de até 500 KB.');
      return new Promise((resolve, reject) => {
        const leitor = new FileReader();
        leitor.onload = () => resolve(leitor.result);
        leitor.onerror = () => reject(Error('Não foi possível ler o arquivo.'));
        leitor.readAsDataURL(conteudo);
      });
    }
    // Nome único: data + número aleatório + nome do arquivo sem acentos/espaços
    let limpo = arquivo.name.normalize('NFD').replace(/[^\w.]/g, '').toLowerCase();
    if (ehImagem) limpo = limpo.replace(/\.\w+$/, '') + '.jpg';
    const caminho = Date.now() + '-' + Math.random().toString(36).slice(2, 7) + '-' + limpo;
    const {error} = await banco.storage.from('arquivos').upload(caminho, conteudo, {contentType: ehImagem ? 'image/jpeg' : arquivo.type});
    if (error) throw Error('Erro ao enviar ' + arquivo.name + ': ' + error.message);
    return banco.storage.from('arquivos').getPublicUrl(caminho).data.publicUrl;
  }

  /* =================== VOTOS (enquete e mural) =================== */
  async function votos(id) {
    if (MODO_DEMO) {
      try { return JSON.parse(localStorage.getItem('blog-mpl-demo-votos-' + id)) || []; } catch { return []; }
    }
    const {data, error} = await banco.from('votos').select('opcao').eq('publicacao_id', id);
    return error ? [] : data;
  }
  async function votar(id, opcao) {
    if (MODO_DEMO) {
      const lista = await votos(id);
      lista.push({opcao});
      localStorage.setItem('blog-mpl-demo-votos-' + id, JSON.stringify(lista));
    } else {
      const {error} = await banco.from('votos').insert({publicacao_id: id, opcao});
      if (error) throw Error('Não foi possível registrar o voto.');
    }
    // O navegador lembra que a pessoa votou (simples: limpar o navegador permite votar de novo).
    try { localStorage.setItem('blog-mpl-votou-' + id, 'sim'); } catch {}
  }
  function jaVotou(id) {
    try { return localStorage.getItem('blog-mpl-votou-' + id) === 'sim'; } catch { return false; }
  }

  /* =================== LOGIN DA EQUIPE DE ADM =================== */
  async function usuario() {
    if (MODO_DEMO) {
      try { return JSON.parse(sessionStorage.getItem('blog-mpl-demo-usuario')); } catch { return null; }
    }
    const {data} = await banco.auth.getSession();
    return data.session ? {email: data.session.user.email, nome: data.session.user.email} : null;
  }
  async function entrar(email, senha) {
    if (MODO_DEMO) {
      if (senha !== 'demo') throw Error('No modo demonstração, use qualquer e-mail e a senha demo.');
      sessionStorage.setItem('blog-mpl-demo-usuario', JSON.stringify({email, nome: 'ADM (demonstração)'}));
      return;
    }
    const {error} = await banco.auth.signInWithPassword({email, password: senha});
    if (error) throw Error('E-mail ou senha incorretos.');
  }
  async function sair() {
    if (MODO_DEMO) { sessionStorage.removeItem('blog-mpl-demo-usuario'); return; }
    await banco.auth.signOut();
  }

  return {listar, buscar, salvar, mudarStatus, excluir, enviarArquivo, votos, votar, jaVotou,
          usuario, entrar, sair, categorias, tipos, videoId, enderecoCategoria, enderecoPublicacao, situacoesProjeto};
})();
