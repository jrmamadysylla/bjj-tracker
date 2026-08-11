// ── FIGHTERS PROGRAMME ─────────────────────────────────────────────────────────
const EX_CONFIG_FIGHTERS = {
  'Bench press':                { sets:4, minRep:3,  maxRep:5,  inc:2.5, type:'barbell' },
  'Weighted dip':               { sets:4, minRep:6,  maxRep:8,  inc:2,   type:'bw'      },
  'Pull-up':                    { sets:3, minRep:6,  maxRep:8,  inc:2.5, type:'bw'      },
  'Chest-supported row':        { sets:4, minRep:8,  maxRep:10, inc:2.5, type:'machine' },
  'Lateral raise':              { sets:3, minRep:12, maxRep:20, inc:2,   type:'db'      },
  'Curl variation':             { sets:3, minRep:10, maxRep:15, inc:2,   type:'db'      },
  'Overhead tricep extension':  { sets:3, minRep:10, maxRep:15, inc:2,   type:'db'      },
  'Face pulls (accessory)':     { sets:3, minRep:15, maxRep:15, inc:2.5, type:'cable'   },
  'Front squat':                { sets:4, minRep:3,  maxRep:5,  inc:2.5, type:'barbell' },
  'Stiff-leg deadlift':         { sets:4, minRep:6,  maxRep:8,  inc:2.5, type:'barbell' },
  'Bulgarian split squat':      { sets:3, minRep:8,  maxRep:12, inc:2,   type:'db'      },
  'Leg extension':              { sets:3, minRep:8,  maxRep:10, inc:2.5, type:'machine' },
  'Weighted plank / ab wheel':  { sets:3, minRep:8,  maxRep:15, inc:0,   type:'bw'      },
  'Deadlift':                   { sets:3, minRep:8,  maxRep:10, inc:2.5, type:'barbell' },
  'Incline press':              { sets:3, minRep:8,  maxRep:10, inc:2,   type:'db'      },
  'Pull-up variation':          { sets:3, minRep:10, maxRep:12, inc:2.5, type:'bw'      },
  'Hip thrust':                 { sets:3, minRep:8,  maxRep:10, inc:2.5, type:'barbell' },
  'Lateral raise (D3)':         { sets:3, minRep:12, maxRep:20, inc:2,   type:'db'      },
  'DB hammer curl':             { sets:3, minRep:10, maxRep:15, inc:2,   type:'db'      },
  'DB skull crusher':           { sets:3, minRep:10, maxRep:15, inc:2,   type:'db'      },
};

const PROGRAMMES_FIGHTERS = {
  'Day 1 — Upper':    ['Bench press','Weighted dip','Pull-up','Chest-supported row','Lateral raise','Curl variation','Overhead tricep extension','Face pulls (accessory)'],
  'Day 2 — Lower':    ['Front squat','Stiff-leg deadlift','Bulgarian split squat','Leg extension','Weighted plank / ab wheel'],
  'Day 3 — Full body':['Deadlift','Incline press','Pull-up variation','Hip thrust','Lateral raise (D3)','DB hammer curl','DB skull crusher'],
};

// ── UPPER / LOWER PROGRAMME ────────────────────────────────────────────────────
const EX_CONFIG_UL = {
  'Barbell bench press':        { sets:4, minRep:5,  maxRep:6,  inc:2.5, type:'barbell' },
  'Weighted pull-ups':          { sets:4, minRep:5,  maxRep:6,  inc:2.5, type:'barbell' },
  'Overhead press':             { sets:3, minRep:6,  maxRep:8,  inc:2.5, type:'barbell' },
  'Barbell row':                { sets:3, minRep:6,  maxRep:8,  inc:2.5, type:'barbell' },
  'Face pulls':                 { sets:3, minRep:15, maxRep:15, inc:2.5, type:'cable'   },
  'Rear delt fly':              { sets:3, minRep:15, maxRep:15, inc:2,   type:'db'      },
  'EZ bar preacher curls':      { sets:3, minRep:10, maxRep:12, inc:2,   type:'barbell' },
  'Farmer carries':             { sets:3, minRep:0,  maxRep:0,  inc:0,   type:'bw'      },
  'Incline DB press':           { sets:4, minRep:8,  maxRep:10, inc:2,   type:'db'      },
  'Cable row':                  { sets:4, minRep:10, maxRep:12, inc:2.5, type:'cable'   },
  'DB shoulder press':          { sets:3, minRep:10, maxRep:12, inc:2,   type:'db'      },
  'Lat pulldown':               { sets:3, minRep:10, maxRep:12, inc:2.5, type:'cable'   },
  'Pec dec / cable crossover':  { sets:3, minRep:15, maxRep:15, inc:2.5, type:'cable'   },
  'Lateral raises':             { sets:4, minRep:15, maxRep:15, inc:2,   type:'db'      },
  'Tricep pushdowns':           { sets:2, minRep:15, maxRep:15, inc:2.5, type:'cable'   },
  'Hammer curls':               { sets:2, minRep:12, maxRep:12, inc:2,   type:'db'      },
  'Reverse wrist curls':        { sets:3, minRep:15, maxRep:15, inc:0,   type:'db'      },
  'Squat':                      { sets:4, minRep:5,  maxRep:6,  inc:2.5, type:'barbell' },
  'Romanian deadlift':          { sets:3, minRep:8,  maxRep:8,  inc:2.5, type:'barbell' },
  'Leg press':                  { sets:3, minRep:10, maxRep:12, inc:2.5, type:'machine' },
  'Leg curl':                   { sets:3, minRep:10, maxRep:12, inc:2.5, type:'machine' },
  'Calf raises':                { sets:3, minRep:15, maxRep:20, inc:2.5, type:'machine' },
  'Hanging knee raises':        { sets:3, minRep:10, maxRep:12, inc:0,   type:'bw'      },
  'Wrist curls':                { sets:3, minRep:15, maxRep:15, inc:0,   type:'db'      },
  'Deadlift (UL)':              { sets:3, minRep:5,  maxRep:5,  inc:2.5, type:'barbell' },
  'Bulgarian split squat (UL)': { sets:3, minRep:10, maxRep:10, inc:2,   type:'db'      },
  'Plank hold':                 { sets:3, minRep:0,  maxRep:0,  inc:0,   type:'bw'      },
};

const PROGRAMMES_UL = {
  'Upper A': ['Barbell bench press','Weighted pull-ups','Overhead press','Barbell row','Face pulls','Rear delt fly','EZ bar preacher curls','Farmer carries'],
  'Upper B': ['Incline DB press','Cable row','DB shoulder press','Lat pulldown','Pec dec / cable crossover','Lateral raises','Tricep pushdowns','Hammer curls','Reverse wrist curls'],
  'Lower A': ['Squat','Romanian deadlift','Leg press','Leg curl','Calf raises','Hanging knee raises','Wrist curls'],
  'Lower B': ['Deadlift (UL)','Bulgarian split squat (UL)','Leg press','Leg curl','Calf raises','Plank hold','Wrist curls'],
};

// ── SETTERS ────────────────────────────────────────────────────────────────────
function setProgramme(prog) {
  CURRENT_PROGRAMME = prog;
  if (prog === 'fighters') {
    EX_CONFIG = EX_CONFIG_FIGHTERS;
    PROGRAMMES = PROGRAMMES_FIGHTERS;
  } else {
    EX_CONFIG = EX_CONFIG_UL;
    PROGRAMMES = PROGRAMMES_UL;
  }
  const sel = document.getElementById('lift-session');
  if (sel) sel.innerHTML = Object.keys(PROGRAMMES).map(k => `<option value="${k}">${k}</option>`).join('');
}

async function loadUserProgramme() {
  const { data } = await sb.from('config').select('value').eq('key', 'programme:' + CURRENT_USER).single();
  if (data?.value) setProgramme(data.value);
}

async function saveUserProgramme(prog) {
  await sb.from('config').upsert({ key: 'programme:' + CURRENT_USER, value: prog }, { onConflict: 'key' });
  setProgramme(prog);
  renderProgrammePage();
  toast('Programme updated');
}
