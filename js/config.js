/* =====================================================================
   CONFIGURAÇÃO DO BANCO DE DADOS (Supabase)
   Este é o ÚNICO arquivo que precisa ser alterado para colocar o blog
   no ar. O passo a passo está no LEIA-ME.txt.
   ===================================================================== */

// 1) Cole a "Project URL" do Supabase. Exemplo: "https://abcdefgh.supabase.co"
const SUPABASE_URL = 'https://kfrmdadgigqqoxeboqnq.supabase.co';

// 2) Cole a chave pública ("publishable" ou "anon public").
//    NUNCA cole aqui a chave "secret" ou "service_role".
const SUPABASE_CHAVE = 'sb_publishable_Xg3HisizObbOzFrmDOh8PQ_T-IVxZqR';

/* Enquanto os dados acima não forem preenchidos, o blog funciona em
   MODO DEMONSTRAÇÃO: os registros ficam só neste navegador, como na
   etapa anterior. Serve para testar em sala antes de criar o banco. */
const MODO_DEMO = SUPABASE_URL.includes('COLE_AQUI');

// "banco" é o objeto que conversa com o Supabase (null no modo demonstração).
const banco = MODO_DEMO ? null : supabase.createClient(SUPABASE_URL, SUPABASE_CHAVE);
