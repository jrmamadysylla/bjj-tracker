// ── SUPABASE ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://jimlyjqhccplbsjbveff.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Vlaf075-sPY0nMc2J5x73w_uLEI-JeB';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── SHARED STATE ───────────────────────────────────────────────────────────────
let CURRENT_USER = null;
let currentWeights = {};
let CURRENT_PROGRAMME = 'upper_lower';
let EX_CONFIG = {};
let PROGRAMMES = {};

// ── DAY → SESSION MAPPING ──────────────────────────────────────────────────────
// Used by quick-log widget on dashboard
// 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
const DAY_SESSION_FIGHTERS = {
  2: 'Day 1 — Upper',
  4: 'Day 2 — Lower',
  6: 'Day 3 — Full body',
};
const DAY_SESSION_UL = {
  2: 'Upper A',
  4: 'Lower A',
  6: 'Upper B',
  0: 'Lower B',
};
