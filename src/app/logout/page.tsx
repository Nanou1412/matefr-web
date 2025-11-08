'use client';

import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.signOut().then(() => router.replace('/'));
  }, [router]);

  return <p>Déconnexion…</p>;
}
