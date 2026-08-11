function getWeekDates() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(new Date().setDate(diff));
  return Array.from({length:7}, (_,i) => { const nd=new Date(mon); nd.setDate(mon.getDate()+i); return nd.toISOString().split('T')[0]; });
}

function getTodaySession() {
  const dayMap = CURRENT_PROGRAMME === 'fighters' ? DAY_SESSION_FIGHTERS : DAY_SESSION_UL;
  return dayMap[new Date().getDay()] || null;
}

async function renderDashboard() {
  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  const weekDates = getWeekDates();
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const tod = today();

  const [{ data: lifts },{ data: bjj },{ data: mob },{ data: bw },{ data: allLifts },{ data: allBJJ },{ data: mobAll }] = await Promise.all([
    sb.from('lifts').select('date').eq('user_id',CURRENT_USER).gte('date',weekDates[0]),
    sb.from('bjj').select('date').eq('user_id',CURRENT_USER).gte('date',weekDates[0]),
    sb.from('mobility_log').select('date').eq('completed',true).eq('user_id',CURRENT_USER).gte('date',weekDates[0]),
    sb.from('bodyweight').select('weight_kg,date').eq('user_id',CURRENT_USER).order('date',{ascending:false}).limit(10),
    sb.from('lifts').select('date').eq('user_id',CURRENT_USER).order('date',{ascending:false}),
    sb.from('bjj').select('date').eq('user_id',CURRENT_USER).order('date',{ascending:false}),
    sb.from('mobility_log').select('date').eq('completed',true).eq('user_id',CURRENT_USER).order('date',{ascending:false}),
  ]);

  const lArr=lifts||[], bArr=bjj||[], mArr=mob||[], wArr=bw||[];
  document.getElementById('s-lifts').textContent = lArr.length;
  document.getElementById('s-bjj').textContent = bArr.length;
  document.getElementById('s-weight').textContent = wArr.length ? parseFloat(wArr[0].weight_kg).toFixed(1) : '—';

  // Streak
  const allDates = new Set([...(allLifts||[]).map(l=>l.date),...(allBJJ||[]).map(l=>l.date)]);
  let streak=0; const sd=new Date();
  while(streak<365){if(allDates.has(sd.toISOString().split('T')[0])){streak++;sd.setDate(sd.getDate()-1);}else break;}
  document.getElementById('s-streak').textContent = streak;

  // Mobility streak
  const mobDone = new Set((mobAll||[]).map(r=>r.date));
  let mStreak=0; const md=new Date();
  while(mStreak<365){if(mobDone.has(md.toISOString().split('T')[0])){mStreak++;md.setDate(md.getDate()-1);}else break;}
  document.getElementById('s-mob').textContent = mStreak+'d';

  // Quick log widget
  const qlWrap = document.getElementById('quick-log-wrap');
  const todaySession = getTodaySession();
  const alreadyLogged = lArr.some(l => l.date === tod);
  const todayBJJ = bArr.some(l => l.date === tod);

  let bannerHtml = '';
  if (todaySession && !alreadyLogged) {
    bannerHtml = `<div class="quick-log">
      <div>
        <div class="quick-log-text">Today: ${todaySession}</div>
        <div class="quick-log-sub">Tap to log this session</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="quickLogSession('${todaySession}')">Log now</button>
    </div>`;
  } else if (alreadyLogged && !todayBJJ) {
    bannerHtml = `<div class="train-banner">✓ Lift done today — don't forget to log BJJ if you trained</div>`;
  } else if (alreadyLogged && todayBJJ) {
    bannerHtml = `<div class="train-banner">✓ Lift + BJJ logged today — good work</div>`;
  }
  if (qlWrap) qlWrap.innerHTML = bannerHtml;

  // Week view
  document.getElementById('week-view').innerHTML = weekDates.map((wd,i) => `
    <div class="wk-day${wd===tod?' today':''}">
      <div class="wk-label">${days[i]}</div>
      <div class="wk-dots">
        <div class="dot${lArr.some(l=>l.date===wd)?' lift':''}"></div>
        <div class="dot${bArr.some(l=>l.date===wd)?' bjj':''}"></div>
        <div class="dot${mArr.some(l=>l.date===wd)?' mob':''}"></div>
      </div>
    </div>`).join('');

  // Weight chart
  const wChart = document.getElementById('weight-chart');
  if (!wArr.length) { wChart.innerHTML = '<div class="empty" style="width:100%">No weight data yet</div>'; }
  else {
    const recent = [...wArr].reverse(); const vals = recent.map(w=>w.weight_kg);
    const mn=Math.min(...vals)-0.5, mx=Math.max(...vals)+0.5;
    wChart.innerHTML = recent.map(w => { const h=Math.round(((w.weight_kg-mn)/(mx-mn))*70+8); return `<div class="wbar-col"><div class="wbar-val">${parseFloat(w.weight_kg).toFixed(1)}</div><div class="wbar" style="height:${h}px"></div><div class="wbar-lbl">${w.date.slice(5)}</div></div>`; }).join('');
  }

  // Working weights
  await loadWeights();
  const entries = Object.entries(currentWeights).filter(([,v])=>v.kg>0).sort((a,b)=>b[1].kg-a[1].kg).slice(0,8);
  const prEl = document.getElementById('pr-list');
  if (!entries.length) { prEl.innerHTML = '<div class="empty">Log lifts to see working weights</div>'; return; }
  const maxKg = Math.max(...entries.map(([,v])=>v.kg));
  prEl.innerHTML = entries.map(([name,v]) => `<div class="pr-row"><span class="pr-name">${name}</span><div class="pr-bar-wrap"><div class="pr-bar" style="width:${Math.round((v.kg/maxKg)*100)}%"></div></div><span class="pr-val">${v.kg}kg</span></div>`).join('');
}

// Quick log — navigate to lift page and pre-select session
function quickLogSession(session) {
  const sel = document.getElementById('lift-session');
  if (sel) { sel.value = session; }
  nav('lift', document.getElementById('bn-lift'));
  renderLiftForm();
  haptic(40);
}
