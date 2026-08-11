async function init() {
  const t = today();
  ['lift-date','bjj-date','mob-date','bw-date','meas-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = t;
  });
  const hr = new Date().getHours();
  const note = document.getElementById('lift-5am-note');
  if (note && hr < 7) note.style.display = 'block';
  const logo = document.querySelector('.sidebar-logo');
  if (logo && CURRENT_USER) logo.innerHTML = `BJJ/BULK<span>@${CURRENT_USER}</span>`;
  await loadWeights();
  await loadUserProgramme();
  await renderLiftForm();
  await renderDashboard();
  initSwipe();
}
