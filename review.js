// ── HISTORY ───────────────────────────────────────────────────────────────────
async function renderHistory() {
  const [{ data: lifts },{ data: bjj },{ data: bw },{ data: mob }] = await Promise.all([
    sb.from('lifts').select('*').eq('user_id',CURRENT_USER).order('date',{ascending:false}).limit(15),
    sb.from('bjj').select('*').eq('user_id',CURRENT_USER).order('date',{ascending:false}).limit(15),
    sb.from('bodyweight').select('*').eq('user_id',CURRENT_USER).order('date',{ascending:false}).limit(8),
    sb.from('mobility_log').select('*').eq('user_id',CURRENT_USER).order('date',{ascending:false}).limit(15),
  ]);
  const all = [
    ...(lifts||[]).map(l=>({...l,kind:'lift'})),
    ...(bjj||[]).map(l=>({...l,kind:'bjj'})),
    ...(bw||[]).map(l=>({...l,kind:'weight'})),
    ...(mob||[]).map(l=>({...l,kind:'mob'})),
  ].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,50);

  const el = document.getElementById('history-list');
  if (!all.length) { el.innerHTML = '<div class="empty">Nothing logged yet</div>'; return; }
  el.innerHTML = all.map(l => {
    let badge, detail;
    if (l.kind==='lift') { badge='<span class="badge badge-lift">Lift</span>'; detail=`${l.session} · ${l.feel||''}`; }
    else if (l.kind==='bjj') { badge='<span class="badge badge-bjj">BJJ</span>'; detail=`${l.type} · ${l.duration_min}min · ${l.energy}${l.notes?' · '+l.notes:''}`; }
    else if (l.kind==='weight') { badge='<span class="badge badge-weight">Weight</span>'; detail=`${parseFloat(l.weight_kg).toFixed(1)}kg · ${l.time_of_day}`; }
    else { badge='<span class="badge badge-mob">Mobility</span>'; detail=`${l.duration_min}min${l.notes?' · '+l.notes:''}`; }
    return `<div class="log-row"><div class="log-date">${l.date}<br><br>${badge}</div><div><div style="font-size:13px;color:var(--text)">${detail}</div></div></div>`;
  }).join('');
}

// ── PROGRESSION ───────────────────────────────────────────────────────────────
async function renderProgressionPage() {
  await loadWeights();
  const keys = Object.keys(EX_CONFIG);
  document.getElementById('po-table-wrap').innerHTML = `<table class="po-table">
    <thead><tr><th>Exercise</th><th>Type</th><th>Current weight</th><th>Increment</th><th>Target</th></tr></thead>
    <tbody>${keys.map(k => {
      const cfg=EX_CONFIG[k]; const w=currentWeights[k]; const isBW=cfg.type==='bw';
      const target = isBW ? 'reps only' : (cfg.minRep===cfg.maxRep ? `${cfg.minRep}` : `${cfg.minRep}–${cfg.maxRep}`);
      return `<tr><td>${k}</td><td style="color:var(--hint);font-size:11px">${cfg.type}</td><td><span class="po-weight">${isBW?'—':((w?.kg||0)+' kg')}</span></td><td><span class="po-inc">${isBW?'—':'+'+cfg.inc+'kg'}</span></td><td style="color:var(--muted);font-size:12px">${target}</td></tr>`;
    }).join('')}</tbody></table>`;
  document.getElementById('override-ex').innerHTML = keys.filter(k=>EX_CONFIG[k].type!=='bw').map(k=>`<option value="${k}">${k}</option>`).join('');
}

async function overrideWeight() {
  const ex = document.getElementById('override-ex').value;
  const kg = parseFloat(document.getElementById('override-kg').value);
  if (isNaN(kg)) { toast('Enter a valid weight', true); return; }
  await setWeight(ex, kg);
  toast(`${ex} updated to ${kg}kg`);
  document.getElementById('override-kg').value = '';
  renderProgressionPage();
}

// ── PROGRAMME PAGE ─────────────────────────────────────────────────────────────
function renderProgrammePage() {
  const label = document.getElementById('prog-current-label');
  if (label) label.textContent = CURRENT_PROGRAMME === 'fighters' ? '— Fighters' : '— Upper/Lower';
  ['fighters','upper_lower'].forEach(p => {
    const el = document.getElementById('prog-' + p);
    if (!el) return;
    el.style.border = p === CURRENT_PROGRAMME ? '1px solid var(--purple)' : '1px solid var(--border2)';
    el.style.background = p === CURRENT_PROGRAMME ? 'var(--purple-dim)' : 'var(--surface2)';
  });
}

// ── EXPORT ────────────────────────────────────────────────────────────────────
async function generateExport() {
  const [{ data: bw },{ data: meas },{ data: lifts },{ data: bjjLogs },{ data: mobLogs },{ data: weights }] = await Promise.all([
    sb.from('bodyweight').select('*').eq('user_id',CURRENT_USER).order('date',{ascending:false}).limit(8),
    sb.from('measurements').select('*').eq('user_id',CURRENT_USER).order('date',{ascending:false}).limit(2),
    sb.from('lifts').select('date').eq('user_id',CURRENT_USER).gte('date', new Date(Date.now()-30*24*60*60*1000).toISOString().split('T')[0]),
    sb.from('bjj').select('date').eq('user_id',CURRENT_USER).gte('date', new Date(Date.now()-30*24*60*60*1000).toISOString().split('T')[0]),
    sb.from('mobility_log').select('date').eq('completed',true).eq('user_id',CURRENT_USER).gte('date', new Date(Date.now()-30*24*60*60*1000).toISOString().split('T')[0]),
    sb.from('exercise_weights').select('*').eq('user_id',CURRENT_USER).order('exercise'),
  ]);
  const hrv = document.getElementById('exp-hrv').value;
  const rhr = document.getElementById('exp-rhr').value;
  const latest = bw?.[0];
  const trend = bw ? [...bw].reverse().map(w=>parseFloat(w.weight_kg).toFixed(1)+'kg').join(' → ') : '—';
  const latestMeas = meas?.[0]; const prevMeas = meas?.[1];
  const exportDate = new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  let txt = `BJJ TRACKER EXPORT — ${exportDate}\n${'─'.repeat(40)}\n\n`;
  txt += `BODYWEIGHT\nCurrent: ${latest ? parseFloat(latest.weight_kg).toFixed(1)+' kg' : '—'}\nTrend: ${trend}\n\n`;
  if (latestMeas) {
    txt += `MEASUREMENTS (${latestMeas.date})\n`;
    [['chest','Chest'],['waist','Waist'],['shoulders','Shoulders'],['arm_l','Arms L/R'],['forearm_l','Forearms L/R'],['thigh_l','Thighs L/R'],['calf_l','Calves L/R']].forEach(([k,label]) => {
      if (!latestMeas[k]) return;
      const val = k.endsWith('_l') ? `${latestMeas[k]}/${latestMeas[k.replace('_l','_r')]}cm` : `${latestMeas[k]}cm`;
      const prev = prevMeas?.[k] ? ` (prev: ${prevMeas[k]})` : '';
      txt += `${label}: ${val}${prev}\n`;
    });
    txt += '\n';
  }
  txt += `WORKING WEIGHTS\n`;
  (weights||[]).filter(w=>w.weight_kg>0).forEach(w => { txt += `${w.exercise}: ${w.weight_kg} kg\n`; });
  txt += `\nTRAINING THIS MONTH\nLifts: ${lifts?.length||0}\nBJJ sessions: ${bjjLogs?.length||0}\nMobility sessions: ${mobLogs?.length||0}\n`;
  if (hrv||rhr) { txt += `\nRECOVERY (Apple Watch)\n`; if(hrv) txt+=`Avg HRV: ${hrv} ms\n`; if(rhr) txt+=`Resting HR: ${rhr} bpm\n`; }
  txt += `\nCONTEXT\nProgramme: ${CURRENT_PROGRAMME === 'fighters' ? 'Fighters (Thiago)' : 'Upper/Lower'}\nBJJ: 5–6x/week\nGoal: Clean bulk, Frank Zane aesthetic\nDiet: No dairy, no fish, no pork. Whole foods.\n`;
  document.getElementById('export-text').value = txt;
  document.getElementById('export-output').style.display = 'block';
}

function copyExport() {
  const txt = document.getElementById('export-text');
  txt.select();
  navigator.clipboard.writeText(txt.value).then(() => { haptic(50); toast('Copied to clipboard'); });
}

// ── CLEAR ALL ─────────────────────────────────────────────────────────────────
async function clearAll() {
  await Promise.all([
    sb.from('lifts').delete().eq('user_id',CURRENT_USER),
    sb.from('bjj').delete().eq('user_id',CURRENT_USER),
    sb.from('bodyweight').delete().eq('user_id',CURRENT_USER),
    sb.from('mobility_log').delete().eq('user_id',CURRENT_USER),
    sb.from('exercise_weights').delete().eq('user_id',CURRENT_USER),
    sb.from('measurements').delete().eq('user_id',CURRENT_USER),
  ]);
  toast('All data cleared');
  renderDashboard();
}
