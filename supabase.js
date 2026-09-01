// ========================================
// KABARU WARD FOOTBALL
// Supabase Connection
// ========================================

const SUPABASE_URL = "https://aitcfhalfkdlitaefhfo.supabase.co";

// Use your SUPABASE PUBLISHABLE KEY here.
// DO NOT use the secret key in this file.
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NyK1UAffJLTxXwyGxD89Ww_O2J-iPhl";

// Create Supabase client
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
