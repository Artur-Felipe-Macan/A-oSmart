document.addEventListener('DOMContentLoaded', () => {
  // Validação de sessão do operador
  const loggedUser = localStorage.getItem('acosmart_user');
  if (!loggedUser) {
    window.location.href = 'login.html';
    return;
  }

  // Exibir nome do utilizador logado no cabeçalho
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) {
    userDisplay.textContent = `Operador: ${loggedUser}`;
  }

  // Ação para o botão de marcar todos como lidos
  const btnAcknowledgeAll = document.getElementById('btnAcknowledgeAll');
  if (btnAcknowledgeAll) {
    btnAcknowledgeAll.addEventListener('click', () => {
      alert('Todos os alertas pendentes foram marcados como resolvidos/lidos.');
    });
  }
});