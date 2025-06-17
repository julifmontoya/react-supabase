import supabase from './supabaseClient';

export const getSessionToken = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    console.error('Session error:', error);
    return null;
  }
  return session.access_token;
};
