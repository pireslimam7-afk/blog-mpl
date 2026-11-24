/* Login da equipe de ADM.
   No Supabase, as contas são criadas pelo professor em Authentication → Users.
   No modo demonstração, qualquer e-mail entra com a senha "demo". */
const formLogin = document.querySelector('#form-login');
const mensagemLogin = document.querySelector('#mensagem-login');

// Quem já está logado vai direto para o painel.
usuarioPronto.then(usuario => { if (usuario) location.replace('painel.html'); });

formLogin.addEventListener('submit', async evento => {
  evento.preventDefault();
  const email = document.querySelector('#email').value.trim().toLowerCase();
  const senha = document.querySelector('#senha').value;
  mensagemLogin.textContent = 'Entrando...';
  try {
    await Blog.entrar(email, senha);
    location.href = 'painel.html';
  } catch (erro) {
    mensagemLogin.textContent = erro.message;
  }
});
