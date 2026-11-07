import {createClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const localDemo=import.meta.env.DEV&&new URLSearchParams(window.location.search).get('demo')==='1';
export const supabase=!localDemo&&url&&key?createClient(url,key):null;

export const publicSearchEnabled=Boolean(supabase)&&import.meta.env.VITE_PUBLIC_SEARCH_ENABLED==='true';

// Server-side admin authorization is enforced by the applied moderation RPCs.
export const moderationEnabled=Boolean(supabase)&&import.meta.env.VITE_MODERATION_ENABLED==='true';
