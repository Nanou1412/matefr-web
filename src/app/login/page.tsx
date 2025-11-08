'use client';

import { supabase } from '@/lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) router.push('/profil');
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold">Connexion / Inscription</h2>
      <Auth
        supabaseClient={supabase}
        providers={['google']}
        appearance={{ theme: ThemeSupa }}
      />
    </div>
  );
}

