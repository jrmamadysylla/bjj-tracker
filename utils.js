function today() { return new Date().toISOString().split('T')[0]; }

function isMobile() { return window.innerWidth <= 700; }

function haptic(pattern = 50) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function toast(msg, isError) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => t.className = 'toast', 2200);
}
