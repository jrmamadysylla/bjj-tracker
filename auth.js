async function checkAuth() {
  const username = document.getElementById('auth-username').value.trim().toLowerCase();
  const input = document.getElementById('auth-input').value;
  const errEl = document.getElementById('auth-error');
  if (!username || !input) { errEl.textContent = 'Enter username and password'; return; }
  const { data, error } = await sb.from('config').select('value').eq('key', 'user:' + username).single();
  if (error || !data) { errEl.textContent = 'User not found'; return; }
  if (input === data.value) {
    CURRENT_USER = username;
    sessionStorage.setItem('auth', 'ok');
    sessionStorage.setItem('user', username);
    showApp();
  } else {
    errEl.textContent = 'Incorrect password';
    document.getElementById('auth-input').value = '';
  }
}

function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').style.display = 'grid';
  const logo = document.querySelector('.sidebar-logo');
  if (logo) logo.innerHTML = `BJJ/BULK<span>@${CURRENT_USER}</span>`;
  if (isMobile()) document.getElementById('bottom-nav').style.display = 'flex';
  init();
}

// Restore session on page load
if (sessionStorage.getItem('auth') === 'ok' && sessionStorage.getItem('user')) {
  CURRENT_USER = sessionStorage.getItem('user');
  document.addEventListener('DOMContentLoaded', showApp);
}
