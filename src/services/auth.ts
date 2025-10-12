import { createClient } from '@/lib/supabase/client';

class AuthService {
  static async signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  static async signIn(email: string, password: string) {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    return { data, error };
  }
}

export default AuthService;
