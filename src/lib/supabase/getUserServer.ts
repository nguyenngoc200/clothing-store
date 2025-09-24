import { PostgrestError, User } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';
import { TProfile } from '@/types/TProfile';

export async function getUserServer(): Promise<{
  user: User | null;
  profile: TProfile | null;
  error?: PostgrestError | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (error) {
    console.error('Error fetching profile: ', error);
  }

  return { user, profile, error };
}
