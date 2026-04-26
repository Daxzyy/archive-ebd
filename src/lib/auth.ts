import { getSupabase } from './supabase';

const SESSION_KEY = 'eber_access';

export async function checkPassword(input: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('config')
    .select('value')
    .eq('key', 'access_password')
    .single();

  if (error || !data) return false;
  return data.value === input;
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export function setAuthenticated() {
  sessionStorage.setItem(SESSION_KEY, 'true');
}

export function clearAuthenticated() {
  sessionStorage.removeItem(SESSION_KEY);
}
