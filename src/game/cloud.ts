import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Cloud save (Supabase + Google login).
//
// Only the auth user id and the game save JSON are stored in our table
// (public.saves). Nothing else about the player is kept by the game.
// Login only works on the real site (not inside an embedded preview frame,
// where Google's sign-in page cannot open).

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

function embedded() {
  try {
    return window.top !== window;
  } catch {
    return true;
  }
}

// `?nocloud` turns server features off (used by automated tests).
const optedOut = new URLSearchParams(location.search).has('nocloud');
export const cloudAvailable = !!URL && !!KEY && !embedded() && !optedOut && location.protocol.startsWith('http');

const sb: SupabaseClient | null = cloudAvailable
  ? createClient(URL!, KEY!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } })
  : null;

let session: Session | null = null;

export async function initCloud() {
  if (!sb) return;
  try {
    const { data } = await sb.auth.getSession();
    session = data.session;
    sb.auth.onAuthStateChange((_e, s) => (session = s));
    // Drop the ?code=… left in the address bar after the Google redirect.
    if (location.search.includes('code=')) history.replaceState(null, '', location.pathname);
  } catch {
    session = null;
  }
}

export const signedIn = () => !!session;

export async function signInWithGoogle() {
  if (!sb) return;
  await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: location.origin + location.pathname },
  });
}

export async function signOut() {
  if (!sb) return;
  await sb.auth.signOut();
  session = null;
}

export interface CloudSave {
  data: Record<string, unknown>;
  updatedAt: number;
}

export async function downloadSave(): Promise<CloudSave | null | 'error'> {
  if (!sb || !session) return null;
  const { data, error } = await sb.from('saves').select('data, updated_at').eq('user_id', session.user.id).maybeSingle();
  if (error) return 'error';
  if (!data) return null;
  return { data: data.data as Record<string, unknown>, updatedAt: Date.parse(data.updated_at as string) };
}

export async function uploadSave(data: unknown): Promise<boolean> {
  if (!sb || !session) return false;
  const { error } = await sb
    .from('saves')
    .upsert({ user_id: session.user.id, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  return !error;
}

/** Deletes the login account and its cloud save. Local browser saves are untouched. */
export async function deleteAccount(): Promise<boolean> {
  if (!sb || !session) return false;
  const { error } = await sb.rpc('delete_my_account');
  if (error) return false;
  await sb.auth.signOut().catch(() => undefined);
  session = null;
  return true;
}
