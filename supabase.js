// ============================================
// KABARU WARD FOOTBALL
// Supabase Connection
// ============================================

const SUPABASE_URL = "https://aitcfhalfkdlitaefhfo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NyK1UAffJLTxXwyGxD89Ww_O2J-iPhl";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
