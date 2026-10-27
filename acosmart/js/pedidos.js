document.addEventListener('DOMContentLoaded', () => {
  const loggedUser = localStorage.getItem('acosmart_user');
  if (!loggedUser) {
    window.location.href = 'login.html';
    return;
  }
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) userDisplay.textContent = `Operador: ${loggedUser}`;

  const btnNovoPedido = document.getElementById('btnNovoPedido');
  if (btnNovoPedido) {
    btnNovoPedido.addEventListener('click', () => {
      alert('Nova ordem de produção configurada! A redirecionar para a oficina.');
      window.location.href = 'oficina.html';
    });
  }
});