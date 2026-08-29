// ==========================================
// KABARU WARD FOOTBALL
// Supabase Connection
// ==========================================

const SUPABASE_URL = "https://aitcfhalfkdlitaefhfo.supabase.co";

// Paste your Supabase PUBLISHABLE KEY between the quotes below
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NyK1UAffJLTxXwyGxD89Ww_O2J-iPhl";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
