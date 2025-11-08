'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function ProfilPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">Profil</h2>
      <p>{email ? `Connecté : ${email}` : 'Non connecté'}</p>
      <Link
        href="/logout"
        className="inline-block rounded-lg border px-4 py-2 text-sm"
      >
        Se déconnecter
      </Link>
    </div>
  );
}
