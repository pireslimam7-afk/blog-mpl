-- =====================================================================
--  BANCO DE DADOS DO BLOG MPL (Supabase)
--  Como usar: no Supabase, abra "SQL Editor" → "New query", cole TODO
--  este arquivo e clique em "Run". Só precisa fazer UMA vez.
--
--  JÁ RODOU UMA VERSÃO ANTERIOR DESTE ARQUIVO? Não rode tudo de novo.
--  Rode só estas linhas, que acrescentam os campos de Eventos e Projetos:
--    alter table publicacoes add column if not exists data_evento date;
--    alter table publicacoes add column if not exists professores text;
--    alter table publicacoes add column if not exists turmas text;
--    alter table publicacoes add column if not exists titulo_projeto text;
--    alter table publicacoes add column if not exists situacao_projeto text;
-- =====================================================================


-- ---------------------------------------------------------------------
--  TABELA 1: publicacoes
--  Guarda TODOS os tipos: artigo, vídeo, enquete e mural de fotos.
-- ---------------------------------------------------------------------
create table publicacoes (
  id          bigint generated always as identity primary key,  -- número automático
  tipo        text not null default 'artigo'
              check (tipo in ('artigo', 'video', 'enquete', 'mural')),
  categoria   text not null default 'Notícias',
  titulo      text not null,
  resumo      text,
  conteudo    text,                       -- parágrafos separados por linha em branco
  imagem_url  text,                       -- capa (vazio = automática)
  alt         text,                       -- descrição da imagem (acessibilidade)
  video_url   text,                       -- link do YouTube
  pdf_url     text,                       -- material em PDF (opcional)
  opcoes      jsonb not null default '[]'::jsonb,  -- opções da enquete OU links das fotos do mural
  publicada   boolean not null default false,      -- false = rascunho (visitante não vê)
  autor       text default 'Equipe do blog',
  data_evento date,                       -- só para a categoria Eventos (data em que acontece)
  -- Só para a categoria Projetos (tabela da página projetos.html):
  professores      text,                  -- um nome por linha
  turmas           text,                  -- uma turma por linha
  titulo_projeto   text,                  -- lema do projeto
  situacao_projeto text check (situacao_projeto in ('planejado', 'andamento', 'concluido')),
  criado_em   timestamptz not null default now()
);


-- ---------------------------------------------------------------------
--  TABELA 2: votos
--  Cada voto em enquete ou mural vira uma linha.
--  Se a publicação for excluída, os votos dela somem junto (cascade).
-- ---------------------------------------------------------------------
create table votos (
  id             bigint generated always as identity primary key,
  publicacao_id  bigint not null references publicacoes(id) on delete cascade,
  opcao          text not null,
  criado_em      timestamptz not null default now()
);


-- ---------------------------------------------------------------------
--  REGRAS DE SEGURANÇA (RLS)
--  anon          = visitante (sem cadastro)
--  authenticated = equipe de ADM logada
--  É AQUI que o blog fica protegido, e não no JavaScript.
-- ---------------------------------------------------------------------
alter table publicacoes enable row level security;
alter table votos       enable row level security;

-- Visitantes veem SÓ o que está publicado; a equipe vê tudo (inclusive rascunhos).
create policy "Visitantes veem publicadas"
  on publicacoes for select to anon using (publicada = true);
create policy "ADM ve tudo"
  on publicacoes for select to authenticated using (true);

-- Só a equipe de ADM cria, edita e exclui.
create policy "ADM cria"   on publicacoes for insert to authenticated with check (true);
create policy "ADM edita"  on publicacoes for update to authenticated using (true);
create policy "ADM exclui" on publicacoes for delete to authenticated using (true);

-- Qualquer pessoa vê os resultados e vota, mas só em enquete ou mural publicados.
-- Ninguém pelo site consegue alterar ou apagar votos.
create policy "Todos veem votos"
  on votos for select to anon, authenticated using (true);
create policy "Todos votam em enquetes e murais publicados"
  on votos for insert to anon, authenticated
  with check (exists (
    select 1 from publicacoes p
    where p.id = publicacao_id and p.publicada and p.tipo in ('enquete', 'mural')
  ));

grant select on publicacoes to anon, authenticated;
grant insert, update, delete on publicacoes to authenticated;
grant select, insert on votos to anon, authenticated;


-- ---------------------------------------------------------------------
--  PASTA DE ARQUIVOS (Storage): capas, fotos do mural e PDFs
--  Pública para VER; só ADM envia ou apaga.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('arquivos', 'arquivos', true);

create policy "ADM envia arquivos" on storage.objects
  for insert to authenticated with check (bucket_id = 'arquivos');
create policy "ADM apaga arquivos" on storage.objects
  for delete to authenticated using (bucket_id = 'arquivos');


-- ---------------------------------------------------------------------
--  (OPCIONAL) Publicação de boas-vindas para testar
-- ---------------------------------------------------------------------
insert into publicacoes (tipo, categoria, titulo, resumo, conteudo, alt, publicada)
values ('artigo', 'Notícias', 'O Blog MPL está no ar!',
        'O blog da escola foi criado pelos alunos do curso de Desenvolvimento de Sistemas.',
        'Sejam bem-vindos! Aqui vocês vão encontrar notícias, vídeos, enquetes e murais de fotos da nossa escola.',
        'Imagem ilustrativa de uma escola com jardim', true);
