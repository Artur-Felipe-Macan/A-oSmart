const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    if (user) {
      localStorage.setItem('acosmart_user', user);
      window.location.href = 'materiais.html';
    }
  });
}