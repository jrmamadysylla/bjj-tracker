// ── BJJ ───────────────────────────────────────────────────────────────────────
async function saveBJJ() {
  const { error } = await sb.from('bjj').insert({
    date: document.getElementById('bjj-date').value || today(),
    type: document.getElementById('bjj-type').value,
    duration_min: parseInt(document.getElementById('bjj-dur').value) || 60,
    energy: document.getElementById('bjj-energy').value,
    notes: document.getElementById('bjj-notes').value,
    user_id: CURRENT_USER,
  });
  if (error) { toast('Error saving BJJ', true); return; }
  document.getElementById('bjj-notes').value = '';
  haptic(50);
  toast('BJJ session saved');
}

// ── MOBILITY ──────────────────────────────────────────────────────────────────
async function saveMobility() {
  const date = document.getElementById('mob-date').value || today();
  const { error } = await sb.from('mobility_log').upsert(
    { date, completed: true, duration_min: 15, notes: document.getElementById('mob-notes').value, user_id: CURRENT_USER },
    { onConflict: 'date,user_id' }
  );
  if (error) { toast('Error saving mobility', true); return; }
  document.getElementById('mob-notes').value = '';
  haptic(50);
  toast('Mobility logged ✓');
  renderMobilityStreak();
}

async function renderMobilityStreak() {
  const { data } = await sb.from('mobility_log').select('date').eq('completed',true).eq('user_id',CURRENT_USER).order('date',{ascending:false}).limit(28);
  const done = new Set((data||[]).map(r=>r.date));
  const dots = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const ds = d.toISOString().split('T')[0];
    dots.push(`<div class="mob-dot${done.has(ds)?' done':''}" title="${ds}"></div>`);
  }
  document.getElementById('mob-streak').innerHTML = dots.join('');
  let streak=0; const sd=new Date();
  while(streak<365){if(done.has(sd.toISOString().split('T')[0])){streak++;sd.setDate(sd.getDate()-1);}else break;}
  const el = document.getElementById('s-mob');
  if (el) el.textContent = streak+'d';
}

// ── BODYWEIGHT ────────────────────────────────────────────────────────────────
async function saveBW() {
  const weight_kg = parseFloat(document.getElementById('bw-val').value);
  if (isNaN(weight_kg)) { toast('Enter a valid weight', true); return; }
  const { error } = await sb.from('bodyweight').insert({
    date: document.getElementById('bw-date').value||today(),
    weight_kg,
    time_of_day: document.getElementById('bw-time').value,
    user_id: CURRENT_USER,
  });
  if (error) { toast('Error saving weight', true); return; }
  document.getElementById('bw-val').value = '';
  haptic(50);
  toast('Weight saved');
  renderBWHistory();
}

async function renderBWHistory() {
  const { data } = await sb.from('bodyweight').select('*').eq('user_id',CURRENT_USER).order('date',{ascending:false}).limit(20);
  const el = document.getElementById('bw-history');
  if (!data?.length) { el.innerHTML = '<div class="empty">No entries yet</div>'; return; }
  el.innerHTML = data.map(l => `<div class="log-row"><div class="log-date">${l.date}</div><div>${parseFloat(l.weight_kg).toFixed(1)} kg <span style="color:var(--hint);font-size:11px;margin-left:6px;">${l.time_of_day}</span></div></div>`).join('');
}

// ── MEASUREMENTS ──────────────────────────────────────────────────────────────
async function saveMeasurements() {
  const date = document.getElementById('meas-date').value || today();
  const fields = ['chest','waist','shoulders','hips','arm_l','arm_r','forearm_l','forearm_r','thigh_l','thigh_r','calf_l','calf_r'];
  const data = { date, user_id: CURRENT_USER, notes: document.getElementById('m-notes')?.value || null };
  fields.forEach(f => { data[f] = parseFloat(document.getElementById('m-'+f.replace('_','-'))?.value) || null; });
  const { error } = await sb.from('measurements').insert(data);
  if (error) { toast('Error saving measurements', true); return; }
  fields.forEach(f => { const el = document.getElementById('m-'+f.replace('_','-')); if(el) el.value=''; });
  document.getElementById('m-notes').value = '';
  haptic(50);
  toast('Check-in saved');
  renderMeasurementsHistory();
}

async function renderMeasurementsHistory() {
  const { data } = await sb.from('measurements').select('*').eq('user_id',CURRENT_USER).order('date',{ascending:false}).limit(10);
  const el = document.getElementById('meas-history');
  if (!data?.length) { el.innerHTML = '<div class="empty">No check-ins yet</div>'; return; }
  el.innerHTML = data.map(m => `
    <div class="log-row">
      <div class="log-date">${m.date}</div>
      <div style="font-size:12px;color:var(--muted);line-height:1.8;">
        ${m.chest ? `Chest: <strong style="color:var(--text)">${m.chest}cm</strong> · ` : ''}
        ${m.waist ? `Waist: <strong style="color:var(--text)">${m.waist}cm</strong> · ` : ''}
        ${m.shoulders ? `Shoulders: <strong style="color:var(--text)">${m.shoulders}cm</strong>` : ''}<br>
        ${m.arm_l ? `Arms: <strong style="color:var(--text)">${m.arm_l}/${m.arm_r}cm</strong> · ` : ''}
        ${m.forearm_l ? `Forearms: <strong style="color:var(--text)">${m.forearm_l}/${m.forearm_r}cm</strong>` : ''}
        ${m.notes ? `<br><span style="color:var(--hint);font-size:11px;">${m.notes}</span>` : ''}
      </div>
    </div>`).join('');
}
