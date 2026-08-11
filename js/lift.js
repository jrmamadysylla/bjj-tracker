// ── WEIGHTS ───────────────────────────────────────────────────────────────────
async function loadWeights() {
  const { data } = await sb.from('exercise_weights').select('*').eq('user_id', CURRENT_USER);
  if (data) data.forEach(r => { currentWeights[r.exercise] = { kg: parseFloat(r.weight_kg), inc: parseFloat(r.increment) }; });
}

async function setWeight(exercise, kg) {
  await sb.from('exercise_weights').upsert({ exercise, weight_kg: kg, updated_at: new Date().toISOString(), user_id: CURRENT_USER }, { onConflict: 'exercise,user_id' });
  currentWeights[exercise] = { ...currentWeights[exercise], kg };
}

// ── DRAFT PERSISTENCE ─────────────────────────────────────────────────────────
function getLiftCacheKey() {
  const session = document.getElementById('lift-session')?.value || '';
  const date = document.getElementById('lift-date')?.value || today();
  return `lift_draft:${CURRENT_USER}:${date}:${session}`;
}

function saveLiftDraft() {
  const session = document.getElementById('lift-session')?.value;
  if (!session) return;
  const exNames = PROGRAMMES[session] || [];
  const data = {};
  exNames.forEach((name, ei) => {
    const cfg = EX_CONFIG[name] || {};
    data[name] = Array.from({length: cfg.sets||3}, (_,s) => ({
      kg: document.getElementById(`e${ei}s${s}kg`)?.value || '',
      reps: document.getElementById(`e${ei}s${s}reps`)?.value || '',
    }));
  });
  try { localStorage.setItem(getLiftCacheKey(), JSON.stringify(data)); } catch(e) {}
}

function restoreLiftDraft() {
  try {
    const cached = localStorage.getItem(getLiftCacheKey());
    if (!cached) return;
    const data = JSON.parse(cached);
    const session = document.getElementById('lift-session')?.value;
    const exNames = PROGRAMMES[session] || [];
    let restored = false;
    exNames.forEach((name, ei) => {
      const sets = data[name];
      if (!sets) return;
      sets.forEach((s, si) => {
        const kg = document.getElementById(`e${ei}s${si}kg`);
        const reps = document.getElementById(`e${ei}s${si}reps`);
        if (kg && s.kg) { kg.value = s.kg; restored = true; }
        if (reps && s.reps) { reps.value = s.reps; restored = true; }
      });
    });
    if (restored) toast('Draft restored ✓');
  } catch(e) {}
}

function clearLiftDraft() {
  try { localStorage.removeItem(getLiftCacheKey()); } catch(e) {}
}

// ── FILL DOWN ─────────────────────────────────────────────────────────────────
function fillDown(ei, totalSets, field) {
  const firstVal = document.getElementById(`e${ei}s0${field}`)?.value;
  if (!firstVal) return;
  for (let s = 1; s < totalSets; s++) {
    const el = document.getElementById(`e${ei}s${s}${field}`);
    if (el && !el.value) el.value = firstVal;
  }
  saveLiftDraft();
}

// ── PROGRESSIVE OVERLOAD ──────────────────────────────────────────────────────
function hitRepRange(exercise, setsData) {
  const cfg = EX_CONFIG[exercise];
  if (!cfg || cfg.type === 'bw' || cfg.inc === 0) return false;
  const validSets = setsData.filter(s => parseFloat(s.reps) > 0);
  if (validSets.length < cfg.sets) return false;
  return validSets.every(s => parseFloat(s.reps) >= cfg.maxRep);
}

// ── RENDER FORM ───────────────────────────────────────────────────────────────
async function renderLiftForm() {
  await loadWeights();
  const session = document.getElementById('lift-session')?.value;
  if (!session) return;
  const exNames = PROGRAMMES[session] || [];

  // Fetch previous session of same type
  let prevData = {};
  try {
    const { data: prev } = await sb.from('lifts')
      .select('exercises').eq('user_id', CURRENT_USER).eq('session', session)
      .order('date', { ascending: false }).limit(1).single();
    if (prev?.exercises) prev.exercises.forEach(ex => { prevData[ex.name] = ex.sets; });
  } catch(e) {}

  document.getElementById('lift-exercises').innerHTML = exNames.map((name, ei) => {
    const cfg = EX_CONFIG[name] || {};
    const w = currentWeights[name] || { kg: 0 };
    const isBW = cfg.type === 'bw';
    const targetReps = cfg.minRep === cfg.maxRep ? `${cfg.minRep} reps` : `${cfg.minRep}–${cfg.maxRep} reps`;
    const prev = prevData[name];
    const prevKg = prev?.[0]?.kg || '';
    const prevReps = prev?.[0]?.reps || '';
    const suggestedKg = w.kg > 0 ? w.kg : (prevKg || '');
    return `<div class="ex-block">
      <div class="ex-header">
        <div class="ex-name">${name}</div>
        <div class="ex-meta">
          ${isBW ? '' : `<span class="ex-suggested">${suggestedKg ? suggestedKg + ' kg' : 'Set weight'}</span>`}
          ${(!isBW && cfg.inc > 0) ? `<span class="ex-inc-badge">+${cfg.inc}kg on PR</span>` : ''}
          <span class="ex-target">${cfg.sets} × ${targetReps}</span>
        </div>
      </div>
      ${prev ? `<div class="ex-prev">Last: ${prev.map((s,i) => `S${i+1} ${s.kg||'—'}kg×${s.reps||'—'}`).join(' · ')}</div>` : ''}
      <div class="set-header"><span>#</span><span>${isBW ? 'N/A' : 'Weight (kg)'}</span><span>Reps</span></div>
      ${Array.from({length: cfg.sets}, (_,s) => `
        <div class="set-row">
          <span class="set-num">${s+1}</span>
          <input type="number" inputmode="decimal" step="0.5"
            placeholder="${isBW ? '—' : (prevKg || w.kg || 'kg')}"
            id="e${ei}s${s}kg"
            ${isBW ? 'disabled style="opacity:0.3"' : ''}
            oninput="saveLiftDraft()"
            ${s === 0 && !isBW ? `onblur="fillDown(${ei},${cfg.sets},'kg')"` : ''}>
          <input type="number" inputmode="numeric"
            placeholder="${prevReps || 'reps'}"
            id="e${ei}s${s}reps"
            oninput="saveLiftDraft()"
            ${s === 0 ? `onblur="fillDown(${ei},${cfg.sets},'reps')"` : ''}>
        </div>`).join('')}
    </div>`;
  }).join('');
  document.getElementById('overload-alerts').innerHTML = '';
  restoreLiftDraft();
}

// ── SAVE LIFT ─────────────────────────────────────────────────────────────────
async function saveLift() {
  const session = document.getElementById('lift-session').value;
  const date = document.getElementById('lift-date').value || today();
  const feel = document.getElementById('lift-feel').value;
  const exNames = PROGRAMMES[session];
  const exercises = exNames.map((name, ei) => {
    const cfg = EX_CONFIG[name] || {};
    return { name, sets: Array.from({length: cfg.sets||3}, (_,s) => ({
      kg: document.getElementById(`e${ei}s${s}kg`)?.value || '',
      reps: document.getElementById(`e${ei}s${s}reps`)?.value || '',
    }))};
  });
  const { error } = await sb.from('lifts').insert({ date, session, exercises, feel, user_id: CURRENT_USER });
  if (error) { toast('Error saving lift', true); return; }
  clearLiftDraft();
  haptic([50, 30, 50]);

  // Progressive overload check
  const alerts = [];
  for (const ex of exercises) {
    const cfg = EX_CONFIG[ex.name];
    if (!cfg || cfg.type === 'bw' || cfg.inc === 0) continue;
    if (hitRepRange(ex.name, ex.sets)) {
      const current = currentWeights[ex.name]?.kg || 0;
      const next = Math.round((current + cfg.inc) * 100) / 100;
      await setWeight(ex.name, next);
      alerts.push(`${ex.name}: ${current}kg → <strong>${next}kg</strong>`);
    } else {
      const usedKg = parseFloat(ex.sets.find(s => s.kg)?.kg || 0);
      if (usedKg > 0 && usedKg > (currentWeights[ex.name]?.kg || 0)) await setWeight(ex.name, usedKg);
    }
  }
  if (alerts.length) {
    document.getElementById('overload-alerts').innerHTML =
      `<div class="info" style="margin-top:1rem;">🏆 Rep targets hit — weight increased:<br>${alerts.join('<br>')}</div>`;
  }
  toast('Lift saved' + (alerts.length ? ` · ${alerts.length} progressed` : ''));
}
